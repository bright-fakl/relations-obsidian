import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CycleDetector, CycleInfo } from '@/cycle-detector';
import { RelationGraph, NodeInfo } from '@/relation-graph';
import { FrontmatterCache } from '@/frontmatter-cache';
import { TFile, App } from 'obsidian';

/**
 * Helper to create mock TFile objects for testing
 */
function createMockFile(path: string, basename: string): TFile {
  return {
    path,
    basename,
    name: basename + '.md',
    extension: 'md',
    stat: { ctime: 0, mtime: 0, size: 0 },
    vault: {} as any,
    parent: null,
  } as TFile;
}

/**
 * Helper to create a mock RelationGraph with specified edges
 */
function createMockGraph(edges: [string, string][]): RelationGraph {
  const mockApp = {
    vault: {
      getMarkdownFiles: vi.fn().mockReturnValue([]),
    },
    metadataCache: {
      getFileCache: vi.fn(),
      getFirstLinkpathDest: vi.fn(),
    },
  } as any;

  const frontmatterCache = new FrontmatterCache(mockApp);
  const graph = new RelationGraph(mockApp, 'parent', 5, frontmatterCache);
  
  // Build file map
  const fileMap = new Map<string, TFile>();
  const nodeMap = new Map<string, NodeInfo>();
  
  // Collect all unique file paths
  const allPaths = new Set<string>();
  edges.forEach(([child, parent]) => {
    allPaths.add(child);
    allPaths.add(parent);
  });
  
  // Create TFile objects
  allPaths.forEach(path => {
    const file = createMockFile(path, path);
    fileMap.set(path, file);
    nodeMap.set(path, { file, parents: [], children: [] });
  });
  
  // Build parent-child relationships
  edges.forEach(([childPath, parentPath]) => {
    const childFile = fileMap.get(childPath)!;
    const parentFile = fileMap.get(parentPath)!;
    
    const childNode = nodeMap.get(childPath)!;
    const parentNode = nodeMap.get(parentPath)!;
    
    childNode.parents.push(parentFile);
    parentNode.children.push(childFile);
  });
  
  // Inject the graph structure
  (graph as any).graph = nodeMap;
  
  // Initialize cycle detector
  (graph as any).cycleDetector = new CycleDetector(graph);
  
  return graph;
}

describe('CycleDetector', () => {
  describe('No Cycles', () => {
    it('should return null for acyclic chain: A → B → C', () => {
      // A has parent B, B has parent C, C has no parent
      const graph = createMockGraph([
        ['A', 'B'],
        ['B', 'C'],
      ]);
      
      const fileA = createMockFile('A', 'A');
      const cycleInfo = graph.detectCycle(fileA);
      
      expect(cycleInfo).toBeNull();
    });

    it('should return null for tree structure with multiple branches', () => {
      // Root has two children (B and C), each with their own child
      //     Root
      //    /    \
      //   B      C
      //   |      |
      //   D      E
      const graph = createMockGraph([
        ['B', 'Root'],
        ['C', 'Root'],
        ['D', 'B'],
        ['E', 'C'],
      ]);
      
      const fileD = createMockFile('D', 'D');
      const cycleInfo = graph.detectCycle(fileD);
      
      expect(cycleInfo).toBeNull();
    });

    it('should return null for disconnected graphs', () => {
      // Two separate chains: A → B and C → D
      const graph = createMockGraph([
        ['A', 'B'],
        ['C', 'D'],
      ]);
      
      const fileA = createMockFile('A', 'A');
      const cycleInfo = graph.detectCycle(fileA);
      
      expect(cycleInfo).toBeNull();
    });
  });

  describe('Simple Cycles', () => {
    it('should detect self-loop: A → A', () => {
      const graph = createMockGraph([
        ['A', 'A'],
      ]);
      
      const fileA = createMockFile('A', 'A');
      const cycleInfo = graph.detectCycle(fileA);
      
      expect(cycleInfo).not.toBeNull();
      expect(cycleInfo!.length).toBe(1);
      expect(cycleInfo!.cyclePath).toHaveLength(2); // [A, A]
      expect(cycleInfo!.cyclePath[0].path).toBe('A');
      expect(cycleInfo!.cyclePath[1].path).toBe('A');
      expect(cycleInfo!.description).toContain('A → A');
    });

    it('should detect two-node cycle: A → B → A', () => {
      const graph = createMockGraph([
        ['A', 'B'],
        ['B', 'A'],
      ]);
      
      const fileA = createMockFile('A', 'A');
      const cycleInfo = graph.detectCycle(fileA);
      
      expect(cycleInfo).not.toBeNull();
      expect(cycleInfo!.length).toBe(2);
      expect(cycleInfo!.cyclePath).toHaveLength(3); // [A, B, A] or [B, A, B]
      expect(cycleInfo!.description).toMatch(/A.*B.*A|B.*A.*B/);
    });
  });

  describe('Complex Cycles', () => {
    it('should detect three-node cycle: A → B → C → A', () => {
      const graph = createMockGraph([
        ['A', 'B'],
        ['B', 'C'],
        ['C', 'A'],
      ]);
      
      const fileA = createMockFile('A', 'A');
      const cycleInfo = graph.detectCycle(fileA);
      
      expect(cycleInfo).not.toBeNull();
      expect(cycleInfo!.length).toBe(3);
      expect(cycleInfo!.cyclePath).toHaveLength(4); // [A, B, C, A]
    });

    it('should detect cycle in graph with multiple parents', () => {
      // A has parents B and C, C has parent B, B has parent A (cycle: A → B → A)
      const graph = createMockGraph([
        ['A', 'B'],
        ['A', 'C'],
        ['C', 'B'],
        ['B', 'A'],
      ]);
      
      const fileA = createMockFile('A', 'A');
      const cycleInfo = graph.detectCycle(fileA);
      
      expect(cycleInfo).not.toBeNull();
      // Should find the A → B → A cycle
      expect(cycleInfo!.length).toBeGreaterThanOrEqual(2);
    });

    it('should return first cycle found when multiple cycles exist', () => {
      // Two separate cycles: A → B → A and C → D → C
      const graph = createMockGraph([
        ['A', 'B'],
        ['B', 'A'],
        ['C', 'D'],
        ['D', 'C'],
      ]);
      
      const fileA = createMockFile('A', 'A');
      const cycleInfoA = graph.detectCycle(fileA);
      
      const fileC = createMockFile('C', 'C');
      const cycleInfoC = graph.detectCycle(fileC);
      
      // Both should find their respective cycles
      expect(cycleInfoA).not.toBeNull();
      expect(cycleInfoC).not.toBeNull();
      
      // Cycle A should involve A and B
      expect(cycleInfoA!.description).toMatch(/A.*B/);
      
      // Cycle C should involve C and D
      expect(cycleInfoC!.description).toMatch(/C.*D/);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty graph', () => {
      const graph = createMockGraph([]);
      
      const fileA = createMockFile('A', 'A');
      const cycleInfo = graph.detectCycle(fileA);
      
      // File doesn't exist in graph, should return null
      expect(cycleInfo).toBeNull();
    });

    it('should handle single node with no parents', () => {
      const mockApp = {
        vault: { getMarkdownFiles: vi.fn().mockReturnValue([]) },
        metadataCache: { getFileCache: vi.fn(), getFirstLinkpathDest: vi.fn() },
      } as any;
      
      const frontmatterCache = new FrontmatterCache(mockApp);
  const graph = new RelationGraph(mockApp, 'parent', 5, frontmatterCache);
      const fileA = createMockFile('A', 'A');
      
      // Manually add single node with no parents
      (graph as any).graph = new Map([
        ['A', { file: fileA, parents: [], children: [] }]
      ]);
      (graph as any).cycleDetector = new CycleDetector(graph);
      
      const cycleInfo = graph.detectCycle(fileA);
      
      expect(cycleInfo).toBeNull();
    });

    it('should handle long cycle path (10+ nodes)', () => {
      // Create a long cycle: A → B → C → ... → J → A
      const edges: [string, string][] = [];
      const nodes = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
      
      for (let i = 0; i < nodes.length - 1; i++) {
        edges.push([nodes[i], nodes[i + 1]]);
      }
      edges.push([nodes[nodes.length - 1], nodes[0]]); // J → A
      
      const graph = createMockGraph(edges);
      const fileA = createMockFile('A', 'A');
      const cycleInfo = graph.detectCycle(fileA);
      
      expect(cycleInfo).not.toBeNull();
      expect(cycleInfo!.length).toBe(10);
      expect(cycleInfo!.cyclePath).toHaveLength(11); // 10 nodes + closing node
    });
  });

  describe('CycleInfo Structure', () => {
    it('should return correct cycle path', () => {
      const graph = createMockGraph([
        ['A', 'B'],
        ['B', 'C'],
        ['C', 'A'],
      ]);
      
      const fileA = createMockFile('A', 'A');
      const cycleInfo = graph.detectCycle(fileA);
      
      expect(cycleInfo).not.toBeNull();
      expect(cycleInfo!.cyclePath).toBeDefined();
      expect(Array.isArray(cycleInfo!.cyclePath)).toBe(true);
      
      // First and last elements should be the same (closing the cycle)
      expect(cycleInfo!.cyclePath[0].path).toBe(
        cycleInfo!.cyclePath[cycleInfo!.cyclePath.length - 1].path
      );
    });

    it('should return correct cycle length', () => {
      const graph = createMockGraph([
        ['A', 'B'],
        ['B', 'A'],
      ]);
      
      const fileA = createMockFile('A', 'A');
      const cycleInfo = graph.detectCycle(fileA);
      
      expect(cycleInfo).not.toBeNull();
      expect(cycleInfo!.length).toBe(2); // Two unique nodes in cycle
    });

    it('should return meaningful description', () => {
      const graph = createMockGraph([
        ['NoteA', 'NoteB'],
        ['NoteB', 'NoteA'],
      ]);
      
      const fileA = createMockFile('NoteA', 'NoteA');
      const cycleInfo = graph.detectCycle(fileA);
      
      expect(cycleInfo).not.toBeNull();
      expect(cycleInfo!.description).toContain('Cycle detected');
      expect(cycleInfo!.description).toContain('→');
      expect(cycleInfo!.description).toContain('NoteA');
      expect(cycleInfo!.description).toContain('NoteB');
    });

    it('should set correct startFile', () => {
      const graph = createMockGraph([
        ['A', 'B'],
        ['B', 'A'],
      ]);
      
      const fileA = createMockFile('A', 'A');
      const cycleInfo = graph.detectCycle(fileA);
      
      expect(cycleInfo).not.toBeNull();
      expect(cycleInfo!.startFile).toBeDefined();
      expect(cycleInfo!.startFile.path).toBe('A');
    });
  });

  describe('hasCycles()', () => {
    it('should return false for acyclic graph', () => {
      const graph = createMockGraph([
        ['A', 'B'],
        ['B', 'C'],
      ]);
      
      const hasCycles = graph.hasCycles();
      
      expect(hasCycles).toBe(false);
    });

    it('should return true when any cycle exists', () => {
      const graph = createMockGraph([
        ['A', 'B'],
        ['B', 'C'],
        ['C', 'A'],
      ]);
      
      const hasCycles = graph.hasCycles();
      
      expect(hasCycles).toBe(true);
    });

    it('should return true when multiple disconnected cycles exist', () => {
      const graph = createMockGraph([
        ['A', 'B'],
        ['B', 'A'],
        ['C', 'D'],
        ['D', 'C'],
      ]);
      
      const hasCycles = graph.hasCycles();
      
      expect(hasCycles).toBe(true);
    });

    it('should return false for empty graph', () => {
      const graph = createMockGraph([]);
      
      const hasCycles = graph.hasCycles();
      
      expect(hasCycles).toBe(false);
    });
  });
});