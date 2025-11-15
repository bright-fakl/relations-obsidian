import { TFile } from 'obsidian';
import { RelationGraph } from './relation-graph';

/**
 * Engine for computing extended relationships (ancestors, descendants, siblings, cousins).
 *
 * All traversal methods include cycle protection to prevent infinite loops.
 */
export class RelationshipEngine {
  constructor(private graph: RelationGraph) {}

  /**
   * Gets ancestors of a file, organized by generation.
   *
   * Uses breadth-first search to traverse parent relationships, organizing
   * results by generation level (parents, grandparents, great-grandparents, etc.).
   * Includes cycle protection to prevent infinite loops.
   *
   * @param file - The file to get ancestors for
   * @param maxDepth - Maximum depth to traverse (default: from settings)
   * @returns Array of arrays: [[parents], [grandparents], [great-grandparents], ...]
   *
   * @example
   * // Given: A → B → C → D
   * // getAncestors(A, 3) returns:
   * // [
   * //   [B],           // Generation 1: parents
   * //   [C],           // Generation 2: grandparents
   * //   [D]            // Generation 3: great-grandparents
   * // ]
   *
   * @example
   * // Given: A → B, A → C; B → D, C → D
   * // getAncestors(A, 2) returns:
   * // [
   * //   [B, C],        // Generation 1: parents
   * //   [D]            // Generation 2: grandparents (merged from both paths)
   * // ]
   */
  getAncestors(file: TFile, maxDepth?: number): TFile[][] {
    const depth = maxDepth ?? this.graph.getMaxDepth();
    const result: TFile[][] = [];
    const visited = new Set<string>();

    // Mark starting file as visited to prevent cycles back to self
    visited.add(file.path);

    // BFS: current generation
    let currentGeneration = [file];

    for (let level = 0; level < depth; level++) {
      const nextGeneration: TFile[] = [];
      const seenInGeneration = new Set<string>();

      // Process all files in current generation
      for (const current of currentGeneration) {
        const parents = this.graph.getParents(current);

        for (const parent of parents) {
          // Skip if already visited (cycle protection)
          if (visited.has(parent.path)) continue;

          // Skip if already added to this generation (deduplication)
          if (seenInGeneration.has(parent.path)) continue;

          nextGeneration.push(parent);
          seenInGeneration.add(parent.path);
          visited.add(parent.path);
        }
      }

      // If no more parents, stop traversal
      if (nextGeneration.length === 0) break;

      result.push(nextGeneration);
      currentGeneration = nextGeneration;
    }

    return result;
  }
}
