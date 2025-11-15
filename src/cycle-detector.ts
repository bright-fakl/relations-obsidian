import { TFile } from 'obsidian';
import { RelationGraph } from './relation-graph';

/**
 * Information about a detected cycle in the relationship graph.
 */
export interface CycleInfo {
  /** The files involved in the cycle, in order */
  cyclePath: TFile[];
  
  /** The file where the cycle was first detected */
  startFile: TFile;
  
  /** Human-readable description of the cycle */
  description: string;
  
  /** Length of the cycle */
  length: number;
}

/**
 * Node states for the three-color DFS algorithm.
 * - WHITE: Node hasn't been explored yet
 * - GRAY: Node is in current DFS path (cycle if revisited)
 * - BLACK: Node and all descendants have been explored
 */
enum NodeState {
  WHITE = 'unvisited',
  GRAY = 'visiting',
  BLACK = 'visited'
}

/**
 * Detects cycles in the relationship graph using depth-first search.
 * 
 * Uses three-color algorithm:
 * - WHITE (unvisited): Node hasn't been explored yet
 * - GRAY (visiting): Node is in current DFS path (cycle if revisited)
 * - BLACK (visited): Node and all descendants have been explored
 */
export class CycleDetector {
  constructor(private graph: RelationGraph) {}

  /**
   * Detects if there is a cycle involving the specified file.
   * 
   * @param startFile - The file to check for cycles
   * @returns CycleInfo if a cycle is found, null otherwise
   */
  detectCycle(startFile: TFile): CycleInfo | null {
    const states = new Map<string, NodeState>();
    const path: TFile[] = [];
    
    return this.dfs(startFile, states, path);
  }

  /**
   * Checks if the graph contains any cycles.
   * 
   * @returns true if any cycle exists in the graph
   */
  hasCycles(): boolean {
    const allFiles = this.graph.getAllFiles();
    const states = new Map<string, NodeState>();
    
    for (const file of allFiles) {
      const state = states.get(file.path) || NodeState.WHITE;
      
      if (state === NodeState.WHITE) {
        const path: TFile[] = [];
        const cycle = this.dfs(file, states, path);
        if (cycle) return true;
      }
    }
    
    return false;
  }

  /**
   * Gets detailed information about a cycle involving the specified file.
   * Alias for detectCycle() for clarity.
   * 
   * @param file - The file to check
   * @returns CycleInfo with cycle path details, or null if no cycle
   */
  getCycleInfo(file: TFile): CycleInfo | null {
    return this.detectCycle(file);
  }

  /**
   * DFS helper for cycle detection using three-color algorithm.
   * 
   * @param current - Current node being explored
   * @param states - Map of node paths to their current states
   * @param path - Current DFS path (stack of files)
   * @returns CycleInfo if cycle detected, null otherwise
   */
  private dfs(
    current: TFile,
    states: Map<string, NodeState>,
    path: TFile[]
  ): CycleInfo | null {
    // Mark current node as visiting (GRAY)
    states.set(current.path, NodeState.GRAY);
    path.push(current);

    // Check all parents (following parent links)
    const parents = this.graph.getParents(current);
    
    for (const parent of parents) {
      const state = states.get(parent.path) || NodeState.WHITE;
      
      if (state === NodeState.GRAY) {
        // Found a cycle! Parent is in current path
        return this.buildCycleInfo(parent, path);
      }
      
      if (state === NodeState.WHITE) {
        // Recursively explore unvisited parent
        const cycle = this.dfs(parent, states, path);
        if (cycle) return cycle;
      }
      
      // BLACK nodes are already fully explored, skip
    }

    // Mark current node as visited (BLACK)
    states.set(current.path, NodeState.BLACK);
    path.pop();
    
    return null; // No cycle found from this node
  }

  /**
   * Builds CycleInfo object from detected cycle.
   * 
   * @param cycleStart - The file where the cycle begins
   * @param path - Current DFS path containing the cycle
   * @returns CycleInfo with cycle details
   */
  private buildCycleInfo(cycleStart: TFile, path: TFile[]): CycleInfo {
    // Find where cycle starts in path
    const cycleStartIndex = path.findIndex(f => f.path === cycleStart.path);
    
    // Extract cycle portion of path
    const cyclePath = path.slice(cycleStartIndex);
    cyclePath.push(cycleStart); // Close the cycle
    
    // Build description
    const names = cyclePath.map(f => f.basename).join(' → ');
    
    return {
      cyclePath,
      startFile: path[0],
      description: `Cycle detected: ${names}`,
      length: cyclePath.length - 1 // Exclude duplicate at end
    };
  }
}