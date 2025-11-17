import { TFile } from 'obsidian';
import { RelationGraph } from '../relation-graph';

/**
 * Represents a path between two notes in the relationship graph.
 */
export interface NotePath {
  /** Starting note */
  start: TFile;

  /** Ending note */
  end: TFile;

  /** Ordered array of notes from start to end (inclusive) */
  path: TFile[];

  /** Length of path (number of edges) */
  length: number;

  /** Direction of relationships in path */
  direction: 'up' | 'down' | 'mixed';
}

/**
 * Finds the shortest path between two notes using BFS.
 *
 * @param start - Starting note
 * @param end - Target note
 * @param graph - Relation graph to search
 * @returns Shortest path or null if no path exists
 *
 * @example
 * // Given: A → B → C → D
 * // findShortestPath(A, D) returns:
 * // {
 * //   start: A,
 * //   end: D,
 * //   path: [A, B, C, D],
 * //   length: 3,
 * //   direction: 'up'
 * // }
 */
export function findShortestPath(
  start: TFile,
  end: TFile,
  graph: RelationGraph
): NotePath | null {
  // Early exit if start equals end
  if (start.path === end.path) {
    return {
      start,
      end,
      path: [start],
      length: 0,
      direction: 'mixed'
    };
  }

  // BFS to find shortest path
  const queue: Array<{ node: TFile; path: TFile[] }> = [
    { node: start, path: [start] }
  ];
  const visited = new Set<string>([start.path]);

  while (queue.length > 0) {
    const { node, path } = queue.shift()!;

    // Check parents (upward direction)
    const parents = graph.getParents(node);
    for (const parent of parents) {
      if (parent.path === end.path) {
        const fullPath = [...path, parent];
        return {
          start,
          end,
          path: fullPath,
          length: fullPath.length - 1,
          direction: 'up'
        };
      }

      if (!visited.has(parent.path)) {
        visited.add(parent.path);
        queue.push({ node: parent, path: [...path, parent] });
      }
    }

    // Check children (downward direction)
    const children = graph.getChildren(node);
    for (const child of children) {
      if (child.path === end.path) {
        const fullPath = [...path, child];
        return {
          start,
          end,
          path: fullPath,
          length: fullPath.length - 1,
          direction: 'down'
        };
      }

      if (!visited.has(child.path)) {
        visited.add(child.path);
        queue.push({ node: child, path: [...path, child] });
      }
    }
  }

  // No path found
  return null;
}

/**
 * Finds all paths between two notes up to a maximum length.
 *
 * @param start - Starting note
 * @param end - Target note
 * @param graph - Relation graph to search
 * @param maxLength - Maximum path length to consider (default: 10)
 * @returns Array of all paths within max length, sorted by length
 */
export function findAllPaths(
  start: TFile,
  end: TFile,
  graph: RelationGraph,
  maxLength: number = 10
): NotePath[] {
  const paths: NotePath[] = [];

  function dfs(
    current: TFile,
    target: TFile,
    path: TFile[],
    visited: Set<string>
  ): void {
    // Stop if path is too long
    if (path.length > maxLength) return;

    // Found target
    if (current.path === target.path) {
      paths.push({
        start,
        end,
        path: [...path],
        length: path.length - 1,
        direction: determineDirection(path, graph)
      });
      return;
    }

    // Mark as visited
    visited.add(current.path);

    // Explore parents
    const parents = graph.getParents(current);
    for (const parent of parents) {
      if (!visited.has(parent.path)) {
        dfs(parent, target, [...path, parent], new Set(visited));
      }
    }

    // Explore children
    const children = graph.getChildren(current);
    for (const child of children) {
      if (!visited.has(child.path)) {
        dfs(child, target, [...path, child], new Set(visited));
      }
    }
  }

  dfs(start, end, [start], new Set());

  // Sort by path length (shortest first)
  return paths.sort((a, b) => a.length - b.length);
}

/**
 * Determines the direction of a path.
 *
 * @param path - Array of files representing a path
 * @param graph - Relation graph
 * @returns Direction of the path ('up', 'down', or 'mixed')
 */
function determineDirection(
  path: TFile[],
  graph: RelationGraph
): 'up' | 'down' | 'mixed' {
  if (path.length < 2) return 'mixed';

  let hasUp = false;
  let hasDown = false;

  for (let i = 0; i < path.length - 1; i++) {
    const current = path[i];
    const next = path[i + 1];

    const parents = graph.getParents(current);
    const children = graph.getChildren(current);

    if (parents.some(p => p.path === next.path)) {
      hasUp = true;
    }
    if (children.some(c => c.path === next.path)) {
      hasDown = true;
    }
  }

  if (hasUp && !hasDown) return 'up';
  if (hasDown && !hasUp) return 'down';
  return 'mixed';
}
