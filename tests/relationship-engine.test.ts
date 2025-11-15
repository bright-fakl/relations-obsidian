import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RelationshipEngine } from '@/relationship-engine';
import { RelationGraph, NodeInfo } from '@/relation-graph';
import { CycleDetector } from '@/cycle-detector';
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
function createMockGraph(edges: [string, string][], maxDepth: number = 5): RelationGraph {
  const mockApp = {
    vault: {
      getMarkdownFiles: vi.fn().mockReturnValue([]),
    },
    metadataCache: {
      getFileCache: vi.fn(),
      getFirstLinkpathDest: vi.fn(),
    },
  } as any;

  const graph = new RelationGraph(mockApp, 'parent', maxDepth);

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

/**
 * Helper to create linear chain: A → B → C → D → ...
 */
function createLinearChain(length: number, maxDepth: number = 10): {
  graph: RelationGraph;
  files: Map<string, TFile>;
} {
  const nodes = Array.from({ length }, (_, i) =>
    String.fromCharCode(65 + i) // A, B, C, D, ...
  );

  const edges: [string, string][] = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    edges.push([nodes[i], nodes[i + 1]]);
  }

  const graph = createMockGraph(edges, maxDepth);

  // Build file map for easy access
  const files = new Map<string, TFile>();
  nodes.forEach(name => {
    const node = (graph as any).graph.get(name);
    if (node) {
      files.set(name, node.file);
    }
  });

  return { graph, files };
}

/**
 * Helper to create diamond structure:
 *     D
 *    / \
 *   B   C
 *    \ /
 *     A
 */
function createDiamondStructure(): {
  graph: RelationGraph;
  files: { A: TFile; B: TFile; C: TFile; D: TFile };
} {
  const edges: [string, string][] = [
    ['A', 'B'],
    ['A', 'C'],
    ['B', 'D'],
    ['C', 'D']
  ];

  const graph = createMockGraph(edges);
  const graphInternal = (graph as any).graph;

  return {
    graph,
    files: {
      A: graphInternal.get('A')!.file,
      B: graphInternal.get('B')!.file,
      C: graphInternal.get('C')!.file,
      D: graphInternal.get('D')!.file
    }
  };
}

describe('RelationshipEngine - getAncestors', () => {
  describe('Linear Chains', () => {
    it('should return ancestors for linear chain: A → B → C → D', () => {
      // Setup: A has parent B, B has parent C, C has parent D
      const { graph, files } = createLinearChain(4);
      const engine = new RelationshipEngine(graph);

      const ancestors = engine.getAncestors(files.get('A')!, 3);

      // Expect: [[B], [C], [D]]
      expect(ancestors).toHaveLength(3);
      expect(ancestors[0]).toHaveLength(1);
      expect(ancestors[0][0].basename).toBe('B');
      expect(ancestors[1]).toHaveLength(1);
      expect(ancestors[1][0].basename).toBe('C');
      expect(ancestors[2]).toHaveLength(1);
      expect(ancestors[2][0].basename).toBe('D');
    });

    it('should respect depth limit in linear chain', () => {
      // Setup: A → B → C → D → E → F
      const { graph, files } = createLinearChain(6);
      const engine = new RelationshipEngine(graph);

      const ancestors = engine.getAncestors(files.get('A')!, 2);

      // Expect: [[B], [C]]
      // D, E, F should not be included
      expect(ancestors).toHaveLength(2);
      expect(ancestors[0][0].basename).toBe('B');
      expect(ancestors[1][0].basename).toBe('C');
    });

    it('should return empty array for root node (no parents)', () => {
      // Setup: A has no parents
      const graph = createMockGraph([]);
      const engine = new RelationshipEngine(graph);
      const fileA = createMockFile('A', 'A');

      const ancestors = engine.getAncestors(fileA);

      // Expect: []
      expect(ancestors).toHaveLength(0);
    });

    it('should handle depth 1 (immediate parents only)', () => {
      // Setup: A → B → C → D
      const { graph, files } = createLinearChain(4);
      const engine = new RelationshipEngine(graph);

      const ancestors = engine.getAncestors(files.get('A')!, 1);

      // Expect: [[B]]
      expect(ancestors).toHaveLength(1);
      expect(ancestors[0]).toHaveLength(1);
      expect(ancestors[0][0].basename).toBe('B');
    });
  });

  describe('Multiple Parents (Diamond Structures)', () => {
    it('should handle multiple parents: A → B, A → C', () => {
      // Setup: A has parents B and C
      const graph = createMockGraph([
        ['A', 'B'],
        ['A', 'C']
      ]);
      const engine = new RelationshipEngine(graph);
      const fileA = (graph as any).graph.get('A')!.file;

      const ancestors = engine.getAncestors(fileA, 1);

      // Expect: [[B, C]] (both in same generation)
      expect(ancestors).toHaveLength(1);
      expect(ancestors[0]).toHaveLength(2);
      const names = ancestors[0].map(f => f.basename).sort();
      expect(names).toEqual(['B', 'C']);
    });

    it('should merge ancestors when paths converge: A → B, A → C; B → D, C → D', () => {
      // Setup:
      //     D
      //    / \
      //   B   C
      //    \ /
      //     A
      const { graph, files } = createDiamondStructure();
      const engine = new RelationshipEngine(graph);

      const ancestors = engine.getAncestors(files.A, 2);

      // Expect: [[B, C], [D]]
      // D should appear only once even though reachable via two paths
      expect(ancestors).toHaveLength(2);
      expect(ancestors[0]).toHaveLength(2);
      const gen1Names = ancestors[0].map(f => f.basename).sort();
      expect(gen1Names).toEqual(['B', 'C']);
      expect(ancestors[1]).toHaveLength(1);
      expect(ancestors[1][0].basename).toBe('D');
    });

    it('should handle complex multi-parent hierarchy', () => {
      // Setup:
      //       F
      //      / \
      //     D   E
      //    / \ / \
      //   B   C   G
      //    \ /
      //     A
      const graph = createMockGraph([
        ['A', 'B'],
        ['A', 'C'],
        ['B', 'D'],
        ['C', 'D'],
        ['C', 'E'],
        ['G', 'E'],
        ['D', 'F'],
        ['E', 'F']
      ]);
      const engine = new RelationshipEngine(graph);
      const fileA = (graph as any).graph.get('A')!.file;

      const ancestors = engine.getAncestors(fileA, 3);

      // Verify all ancestors at correct generation levels
      expect(ancestors).toHaveLength(3);

      // Generation 1: B, C
      expect(ancestors[0]).toHaveLength(2);
      const gen1 = ancestors[0].map(f => f.basename).sort();
      expect(gen1).toEqual(['B', 'C']);

      // Generation 2: D, E
      expect(ancestors[1]).toHaveLength(2);
      const gen2 = ancestors[1].map(f => f.basename).sort();
      expect(gen2).toEqual(['D', 'E']);

      // Generation 3: F
      expect(ancestors[2]).toHaveLength(1);
      expect(ancestors[2][0].basename).toBe('F');
    });
  });

  describe('Cycle Protection', () => {
    it('should stop at cycle without infinite loop: A → B → C → B', () => {
      // Setup: A → B → C → B (cycle between B and C)
      const graph = createMockGraph([
        ['A', 'B'],
        ['B', 'C'],
        ['C', 'B']
      ]);
      const engine = new RelationshipEngine(graph);
      const fileA = (graph as any).graph.get('A')!.file;

      const ancestors = engine.getAncestors(fileA, 10);

      // Should complete without hanging
      // Should not include B twice
      expect(ancestors).toBeDefined();
      expect(ancestors.length).toBeGreaterThan(0);

      // B should appear in generation 1
      expect(ancestors[0].some(f => f.basename === 'B')).toBe(true);

      // C should appear in generation 2
      expect(ancestors[1].some(f => f.basename === 'C')).toBe(true);

      // No more generations (cycle prevents further traversal)
      expect(ancestors.length).toBe(2);
    });

    it('should handle self-loop: A → B → B', () => {
      // Setup: A has parent B, B has parent B (self-loop)
      const graph = createMockGraph([
        ['A', 'B'],
        ['B', 'B']
      ]);
      const engine = new RelationshipEngine(graph);
      const fileA = (graph as any).graph.get('A')!.file;

      const ancestors = engine.getAncestors(fileA);

      // Expect: [[B]]
      // Should not infinitely loop on B
      expect(ancestors).toHaveLength(1);
      expect(ancestors[0]).toHaveLength(1);
      expect(ancestors[0][0].basename).toBe('B');
    });

    it('should handle cycle to starting node: A → B → A', () => {
      // Setup: A has parent B, B has parent A
      const graph = createMockGraph([
        ['A', 'B'],
        ['B', 'A']
      ]);
      const engine = new RelationshipEngine(graph);
      const fileA = (graph as any).graph.get('A')!.file;

      const ancestors = engine.getAncestors(fileA);

      // Expect: [[B]]
      // Should not include A again
      expect(ancestors).toHaveLength(1);
      expect(ancestors[0]).toHaveLength(1);
      expect(ancestors[0][0].basename).toBe('B');
    });

    it('should handle long cycle: A → B → C → D → E → C', () => {
      // Setup: Cycle exists at generation 4
      const graph = createMockGraph([
        ['A', 'B'],
        ['B', 'C'],
        ['C', 'D'],
        ['D', 'E'],
        ['E', 'C']
      ]);
      const engine = new RelationshipEngine(graph);
      const fileA = (graph as any).graph.get('A')!.file;

      const ancestors = engine.getAncestors(fileA, 10);

      // Should stop when cycle detected
      // Should include each node only once
      expect(ancestors).toBeDefined();

      // Collect all unique ancestors
      const allAncestors = ancestors.flat();
      const uniqueNames = new Set(allAncestors.map(f => f.basename));

      // Should have B, C, D, E (each once)
      expect(uniqueNames.size).toBe(4);
      expect(uniqueNames.has('B')).toBe(true);
      expect(uniqueNames.has('C')).toBe(true);
      expect(uniqueNames.has('D')).toBe(true);
      expect(uniqueNames.has('E')).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty graph', () => {
      // Setup: Empty graph
      const graph = createMockGraph([]);
      const engine = new RelationshipEngine(graph);
      const fileA = createMockFile('A', 'A');

      const ancestors = engine.getAncestors(fileA);

      // Expect: []
      expect(ancestors).toHaveLength(0);
    });

    it('should handle single node with no parents', () => {
      // Setup: Isolated node A
      const graph = createMockGraph([]);
      const engine = new RelationshipEngine(graph);
      const fileA = createMockFile('A', 'A');

      const ancestors = engine.getAncestors(fileA);

      // Expect: []
      expect(ancestors).toHaveLength(0);
    });

    it('should handle maxDepth = 0', () => {
      // Setup: A → B → C
      const { graph, files } = createLinearChain(3);
      const engine = new RelationshipEngine(graph);

      const ancestors = engine.getAncestors(files.get('A')!, 0);

      // Expect: []
      expect(ancestors).toHaveLength(0);
    });

    it('should handle maxDepth larger than tree height', () => {
      // Setup: A → B → C (height 2)
      const { graph, files } = createLinearChain(3);
      const engine = new RelationshipEngine(graph);

      const ancestors = engine.getAncestors(files.get('A')!, 100);

      // Expect: [[B], [C]]
      // Should not error or return undefined generations
      expect(ancestors).toHaveLength(2);
      expect(ancestors[0][0].basename).toBe('B');
      expect(ancestors[1][0].basename).toBe('C');
    });

    it('should use default maxDepth from settings when not provided', () => {
      // Setup: Settings has maxDepth = 3, tree has depth 10
      const { graph, files } = createLinearChain(10, 3);
      const engine = new RelationshipEngine(graph);

      const ancestors = engine.getAncestors(files.get('A')!);

      // Expect: Should only traverse 3 levels
      expect(ancestors).toHaveLength(3);
    });
  });

  describe('Generation Ordering', () => {
    it('should maintain consistent ordering within generation', () => {
      // Setup: A → B, A → C, A → D (multiple parents)
      const graph = createMockGraph([
        ['A', 'B'],
        ['A', 'C'],
        ['A', 'D']
      ]);
      const engine = new RelationshipEngine(graph);
      const fileA = (graph as any).graph.get('A')!.file;

      // Test multiple times
      const ancestors1 = engine.getAncestors(fileA, 1);
      const ancestors2 = engine.getAncestors(fileA, 1);
      const ancestors3 = engine.getAncestors(fileA, 1);

      // Same order each time (deterministic)
      const order1 = ancestors1[0].map(f => f.basename).join(',');
      const order2 = ancestors2[0].map(f => f.basename).join(',');
      const order3 = ancestors3[0].map(f => f.basename).join(',');

      expect(order1).toBe(order2);
      expect(order2).toBe(order3);
    });

    it('should not have duplicates within same generation', () => {
      // Setup: Complex graph with multiple paths to same ancestor
      const { graph, files } = createDiamondStructure();
      const engine = new RelationshipEngine(graph);

      const ancestors = engine.getAncestors(files.A);

      // Each ancestor should appear exactly once per generation
      ancestors.forEach((generation, idx) => {
        const names = generation.map(f => f.basename);
        const uniqueNames = new Set(names);
        expect(names.length).toBe(uniqueNames.size);
      });
    });
  });

  describe('Performance', () => {
    it('should process 1000-node lineage in reasonable time', () => {
      // Setup: Linear chain of 1000 nodes
      const { graph, files } = createLinearChain(1000, 1000);
      const engine = new RelationshipEngine(graph);

      const startTime = Date.now();
      const ancestors = engine.getAncestors(files.get('A')!, 1000);
      const endTime = Date.now();

      // Measure: Execution time
      const duration = endTime - startTime;

      // Should complete in reasonable time
      expect(duration).toBeLessThan(1000); // Less than 1 second

      // Verify correctness
      expect(ancestors).toHaveLength(999); // A has 999 ancestors
    });

    it('should handle wide tree (many parents per node)', () => {
      // Setup: Node with many parents
      const edges: [string, string][] = [];

      // A has 50 parents (P0, P1, P2, ... P49)
      for (let i = 0; i < 50; i++) {
        edges.push(['A', `P${i}`]);
      }

      // Each parent has 50 parents (GP0, GP1, ... GP49)
      for (let i = 0; i < 50; i++) {
        for (let j = 0; j < 50; j++) {
          edges.push([`P${i}`, `GP${j}`]);
        }
      }

      const graph = createMockGraph(edges, 2);
      const engine = new RelationshipEngine(graph);
      const fileA = (graph as any).graph.get('A')!.file;

      const startTime = Date.now();
      const ancestors = engine.getAncestors(fileA, 2);
      const endTime = Date.now();

      // Should complete quickly
      const duration = endTime - startTime;
      expect(duration).toBeLessThan(500); // Less than 500ms

      // Generation 1: 50 parents
      expect(ancestors[0]).toHaveLength(50);

      // Generation 2: 50 grandparents (merged from all paths)
      expect(ancestors[1]).toHaveLength(50);
    });
  });
});

/**
 * Helper to create linear chain for descendant tests
 * A has child B, B has child C, C has child D, etc.
 * Structure: A → B → C → D → ...
 */
function createDescendantChain(length: number, maxDepth: number = 10): {
  graph: RelationGraph;
  files: Map<string, TFile>;
} {
  const nodes = Array.from({ length }, (_, i) =>
    String.fromCharCode(65 + i) // A, B, C, D, ...
  );

  const edges: [string, string][] = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    // Create chain: A → B → C → D (A has child B, B has child C, etc.)
    // Edge format: [child, parent]
    // To make A have child B: B has parent A, so edge [B, A]
    edges.push([nodes[i + 1], nodes[i]]);
  }

  const graph = createMockGraph(edges, maxDepth);

  // Build file map for easy access
  const files = new Map<string, TFile>();
  nodes.forEach(name => {
    const node = (graph as any).graph.get(name);
    if (node) {
      files.set(name, node.file);
    }
  });

  return { graph, files };
}

/**
 * Helper to create inverted diamond structure for descendant tests:
 *     D
 *    / \
 *   B   C
 *    \ /
 *     A
 */
function createDescendantDiamond(): {
  graph: RelationGraph;
  files: { A: TFile; B: TFile; C: TFile; D: TFile };
} {
  const edges: [string, string][] = [
    ['B', 'D'], // B has parent D (D has child B)
    ['C', 'D'], // C has parent D (D has child C)
    ['A', 'B'], // A has parent B (B has child A)
    ['A', 'C']  // A has parent C (C has child A)
  ];

  const graph = createMockGraph(edges);
  const graphInternal = (graph as any).graph;

  return {
    graph,
    files: {
      A: graphInternal.get('A')!.file,
      B: graphInternal.get('B')!.file,
      C: graphInternal.get('C')!.file,
      D: graphInternal.get('D')!.file
    }
  };
}

describe('RelationshipEngine - getDescendants', () => {
  describe('Linear Chains', () => {
    it('should return descendants for linear chain: A → B → C → D', () => {
      // Setup: A has child B, B has child C, C has child D
      const { graph, files } = createDescendantChain(4);
      const engine = new RelationshipEngine(graph);

      const descendants = engine.getDescendants(files.get('A')!, 3);

      // Expect: [[B], [C], [D]]
      expect(descendants).toHaveLength(3);
      expect(descendants[0]).toHaveLength(1);
      expect(descendants[0][0].basename).toBe('B');
      expect(descendants[1]).toHaveLength(1);
      expect(descendants[1][0].basename).toBe('C');
      expect(descendants[2]).toHaveLength(1);
      expect(descendants[2][0].basename).toBe('D');
    });

    it('should respect depth limit in linear chain', () => {
      // Setup: A → B → C → D → E → F
      const { graph, files } = createDescendantChain(6);
      const engine = new RelationshipEngine(graph);

      const descendants = engine.getDescendants(files.get('A')!, 2);

      // Expect: [[B], [C]]
      // D, E, F should not be included
      expect(descendants).toHaveLength(2);
      expect(descendants[0][0].basename).toBe('B');
      expect(descendants[1][0].basename).toBe('C');
    });

    it('should return empty array for leaf node (no children)', () => {
      // Setup: A has no children
      const graph = createMockGraph([]);
      const engine = new RelationshipEngine(graph);
      const fileA = createMockFile('A', 'A');

      const descendants = engine.getDescendants(fileA);

      // Expect: []
      expect(descendants).toHaveLength(0);
    });

    it('should handle depth 1 (immediate children only)', () => {
      // Setup: A → B → C → D
      const { graph, files } = createDescendantChain(4);
      const engine = new RelationshipEngine(graph);

      const descendants = engine.getDescendants(files.get('A')!, 1);

      // Expect: [[B]]
      expect(descendants).toHaveLength(1);
      expect(descendants[0]).toHaveLength(1);
      expect(descendants[0][0].basename).toBe('B');
    });
  });

  describe('Multiple Children (Tree Structures)', () => {
    it('should handle multiple children: A → B, A → C', () => {
      // Setup: A has children B and C
      const graph = createMockGraph([
        ['B', 'A'],
        ['C', 'A']
      ]);
      const engine = new RelationshipEngine(graph);
      const fileA = (graph as any).graph.get('A')!.file;

      const descendants = engine.getDescendants(fileA, 1);

      // Expect: [[B, C]] (both in same generation)
      expect(descendants).toHaveLength(1);
      expect(descendants[0]).toHaveLength(2);
      const names = descendants[0].map(f => f.basename).sort();
      expect(names).toEqual(['B', 'C']);
    });

    it('should merge descendants when paths converge: D → B, D → C; B → A, C → A', () => {
      // Setup:
      //     D (root - start here)
      //    / \
      //   B   C (children of D)
      //    \ /
      //     A (grandchild of D via both paths)
      const { graph, files } = createDescendantDiamond();
      const engine = new RelationshipEngine(graph);

      const descendants = engine.getDescendants(files.D, 2);

      // Expect: [[B, C], [A]]
      // A should appear only once even though reachable via two paths
      expect(descendants).toHaveLength(2);
      expect(descendants[0]).toHaveLength(2);
      const gen1Names = descendants[0].map(f => f.basename).sort();
      expect(gen1Names).toEqual(['B', 'C']);
      expect(descendants[1]).toHaveLength(1);
      expect(descendants[1][0].basename).toBe('A');
    });

    it('should handle wide tree (many children per node)', () => {
      // Setup: Node with many children
      const edges: [string, string][] = [];

      // A has 50 children (C0, C1, C2, ... C49)
      for (let i = 0; i < 50; i++) {
        edges.push([`C${i}`, 'A']);
      }

      // Each child has 50 children (GC0, GC1, ... GC49)
      for (let i = 0; i < 50; i++) {
        for (let j = 0; j < 50; j++) {
          edges.push([`GC${j}`, `C${i}`]);
        }
      }

      const graph = createMockGraph(edges, 2);
      const engine = new RelationshipEngine(graph);
      const fileA = (graph as any).graph.get('A')!.file;

      const descendants = engine.getDescendants(fileA, 2);

      // Generation 1: 50 children
      expect(descendants[0]).toHaveLength(50);

      // Generation 2: 50 grandchildren (merged from all paths)
      expect(descendants[1]).toHaveLength(50);
    });

    it('should handle complex multi-child hierarchy', () => {
      // Setup:
      //       A
      //      / \
      //     B   C
      //    / \ / \
      //   D   E   F
      //        \ /
      //         G
      const graph = createMockGraph([
        ['B', 'A'],
        ['C', 'A'],
        ['D', 'B'],
        ['E', 'B'],
        ['E', 'C'],
        ['F', 'C'],
        ['G', 'E'],
        ['G', 'F']
      ]);
      const engine = new RelationshipEngine(graph);
      const fileA = (graph as any).graph.get('A')!.file;

      const descendants = engine.getDescendants(fileA, 3);

      // Verify all descendants at correct generation levels
      expect(descendants).toHaveLength(3);

      // Generation 1: B, C
      expect(descendants[0]).toHaveLength(2);
      const gen1 = descendants[0].map(f => f.basename).sort();
      expect(gen1).toEqual(['B', 'C']);

      // Generation 2: D, E, F
      expect(descendants[1]).toHaveLength(3);
      const gen2 = descendants[1].map(f => f.basename).sort();
      expect(gen2).toEqual(['D', 'E', 'F']);

      // Generation 3: G
      expect(descendants[2]).toHaveLength(1);
      expect(descendants[2][0].basename).toBe('G');
    });
  });

  describe('Cycle Protection', () => {
    it('should stop at cycle without infinite loop: A → B → C → B', () => {
      // Setup: A → B → C → B (cycle between B and C)
      const graph = createMockGraph([
        ['B', 'A'],
        ['C', 'B'],
        ['B', 'C']
      ]);
      const engine = new RelationshipEngine(graph);
      const fileA = (graph as any).graph.get('A')!.file;

      const descendants = engine.getDescendants(fileA, 10);

      // Should complete without hanging
      // Should not include B twice
      expect(descendants).toBeDefined();
      expect(descendants.length).toBeGreaterThan(0);

      // B should appear in generation 1
      expect(descendants[0].some(f => f.basename === 'B')).toBe(true);

      // C should appear in generation 2
      expect(descendants[1].some(f => f.basename === 'C')).toBe(true);

      // No more generations (cycle prevents further traversal)
      expect(descendants.length).toBe(2);
    });

    it('should handle self-loop: A → B → B', () => {
      // Setup: A has child B, B has child B (self-loop)
      const graph = createMockGraph([
        ['B', 'A'],
        ['B', 'B']
      ]);
      const engine = new RelationshipEngine(graph);
      const fileA = (graph as any).graph.get('A')!.file;

      const descendants = engine.getDescendants(fileA);

      // Expect: [[B]]
      // Should not infinitely loop on B
      expect(descendants).toHaveLength(1);
      expect(descendants[0]).toHaveLength(1);
      expect(descendants[0][0].basename).toBe('B');
    });

    it('should handle cycle to starting node: A → B → A', () => {
      // Setup: A has child B, B has child A
      const graph = createMockGraph([
        ['B', 'A'],
        ['A', 'B']
      ]);
      const engine = new RelationshipEngine(graph);
      const fileA = (graph as any).graph.get('A')!.file;

      const descendants = engine.getDescendants(fileA);

      // Expect: [[B]]
      // Should not include A again
      expect(descendants).toHaveLength(1);
      expect(descendants[0]).toHaveLength(1);
      expect(descendants[0][0].basename).toBe('B');
    });

    it('should handle long cycle: A → B → C → D → E → C', () => {
      // Setup: Cycle exists at generation 4
      const graph = createMockGraph([
        ['B', 'A'],
        ['C', 'B'],
        ['D', 'C'],
        ['E', 'D'],
        ['C', 'E']
      ]);
      const engine = new RelationshipEngine(graph);
      const fileA = (graph as any).graph.get('A')!.file;

      const descendants = engine.getDescendants(fileA, 10);

      // Should stop when cycle detected
      // Should include each node only once
      expect(descendants).toBeDefined();

      // Collect all unique descendants
      const allDescendants = descendants.flat();
      const uniqueNames = new Set(allDescendants.map(f => f.basename));

      // Should have B, C, D, E (each once)
      expect(uniqueNames.size).toBe(4);
      expect(uniqueNames.has('B')).toBe(true);
      expect(uniqueNames.has('C')).toBe(true);
      expect(uniqueNames.has('D')).toBe(true);
      expect(uniqueNames.has('E')).toBe(true);
    });

    it('should handle cycle in wide tree', () => {
      // Setup: A → B, A → C, A → D; B → E, C → E, D → E; E → B (cycle back)
      const graph = createMockGraph([
        ['B', 'A'],
        ['C', 'A'],
        ['D', 'A'],
        ['E', 'B'],
        ['E', 'C'],
        ['E', 'D'],
        ['B', 'E']
      ]);
      const engine = new RelationshipEngine(graph);
      const fileA = (graph as any).graph.get('A')!.file;

      const descendants = engine.getDescendants(fileA, 5);

      // Should detect cycle and not hang
      expect(descendants).toBeDefined();
      expect(descendants.length).toBeGreaterThan(0);

      // Verify no duplicates
      const allDescendants = descendants.flat();
      const paths = allDescendants.map(f => f.path);
      const uniquePaths = new Set(paths);
      expect(paths.length).toBe(uniquePaths.size);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty graph', () => {
      // Setup: Empty graph
      const graph = createMockGraph([]);
      const engine = new RelationshipEngine(graph);
      const fileA = createMockFile('A', 'A');

      const descendants = engine.getDescendants(fileA);

      // Expect: []
      expect(descendants).toHaveLength(0);
    });

    it('should handle single node with no children', () => {
      // Setup: Isolated node A
      const graph = createMockGraph([]);
      const engine = new RelationshipEngine(graph);
      const fileA = createMockFile('A', 'A');

      const descendants = engine.getDescendants(fileA);

      // Expect: []
      expect(descendants).toHaveLength(0);
    });

    it('should handle maxDepth = 0', () => {
      // Setup: A → B → C
      const { graph, files } = createDescendantChain(3);
      const engine = new RelationshipEngine(graph);

      const descendants = engine.getDescendants(files.get('A')!, 0);

      // Expect: []
      expect(descendants).toHaveLength(0);
    });

    it('should handle maxDepth larger than tree depth', () => {
      // Setup: A → B → C (depth 2)
      const { graph, files } = createDescendantChain(3);
      const engine = new RelationshipEngine(graph);

      const descendants = engine.getDescendants(files.get('A')!, 100);

      // Expect: [[B], [C]]
      // Should not error or return undefined generations
      expect(descendants).toHaveLength(2);
      expect(descendants[0][0].basename).toBe('B');
      expect(descendants[1][0].basename).toBe('C');
    });

    it('should use default maxDepth from settings when not provided', () => {
      // Setup: Settings has maxDepth = 3, tree has depth 10
      const { graph, files } = createDescendantChain(10, 3);
      const engine = new RelationshipEngine(graph);

      const descendants = engine.getDescendants(files.get('A')!);

      // Expect: Should only traverse 3 levels
      expect(descendants).toHaveLength(3);
    });

    it('should handle node with many children (wide tree)', () => {
      // Setup: A has 100 children
      const edges: [string, string][] = [];
      for (let i = 0; i < 100; i++) {
        edges.push([`C${i}`, 'A']);
      }

      const graph = createMockGraph(edges, 1);
      const engine = new RelationshipEngine(graph);
      const fileA = (graph as any).graph.get('A')!.file;

      const descendants = engine.getDescendants(fileA, 1);

      // Expect: [[100 children]]
      // Should complete quickly
      expect(descendants).toHaveLength(1);
      expect(descendants[0]).toHaveLength(100);
    });
  });

  describe('Generation Ordering', () => {
    it('should maintain consistent ordering within generation', () => {
      // Setup: A → B, A → C, A → D (multiple children)
      const graph = createMockGraph([
        ['B', 'A'],
        ['C', 'A'],
        ['D', 'A']
      ]);
      const engine = new RelationshipEngine(graph);
      const fileA = (graph as any).graph.get('A')!.file;

      // Test multiple times
      const descendants1 = engine.getDescendants(fileA, 1);
      const descendants2 = engine.getDescendants(fileA, 1);
      const descendants3 = engine.getDescendants(fileA, 1);

      // Same order each time (deterministic)
      const order1 = descendants1[0].map(f => f.basename).join(',');
      const order2 = descendants2[0].map(f => f.basename).join(',');
      const order3 = descendants3[0].map(f => f.basename).join(',');

      expect(order1).toBe(order2);
      expect(order2).toBe(order3);
    });

    it('should maintain breadth-first order', () => {
      // Setup:
      //     A
      //    /|\
      //   B C D
      //   |   |
      //   E   F
      const graph = createMockGraph([
        ['B', 'A'],
        ['C', 'A'],
        ['D', 'A'],
        ['E', 'B'],
        ['F', 'D']
      ]);
      const engine = new RelationshipEngine(graph);
      const fileA = (graph as any).graph.get('A')!.file;

      const descendants = engine.getDescendants(fileA, 2);

      // Expect: [[B, C, D], [E, F]]
      // E and F should appear in breadth-first order
      expect(descendants).toHaveLength(2);
      expect(descendants[0]).toHaveLength(3);
      expect(descendants[1]).toHaveLength(2);

      const gen2Names = descendants[1].map(f => f.basename).sort();
      expect(gen2Names).toEqual(['E', 'F']);
    });

    it('should not have duplicates within same generation', () => {
      // Setup: Complex graph with multiple paths to same descendant
      const { graph, files } = createDescendantDiamond();
      const engine = new RelationshipEngine(graph);

      const descendants = engine.getDescendants(files.A);

      // Each descendant should appear exactly once per generation
      descendants.forEach((generation, idx) => {
        const names = generation.map(f => f.basename);
        const uniqueNames = new Set(names);
        expect(names.length).toBe(uniqueNames.size);
      });
    });
  });

  describe('Symmetry with getAncestors', () => {
    it('should mirror getAncestors for simple chain', () => {
      // ancestorChain: A → B → C → D (A has parent B, etc.)
      // descendantChain: A → B → C → D (A has child B, etc.)
      const ancestorChain = createLinearChain(4);
      const descendantChain = createDescendantChain(4);

      const ancestorEngine = new RelationshipEngine(ancestorChain.graph);
      const descendantEngine = new RelationshipEngine(descendantChain.graph);

      const fileA_ancestors = ancestorChain.files.get('A')!;
      const fileA_descendants = descendantChain.files.get('A')!;

      // Test:
      //   - getAncestors(A) in ancestor chain returns [[B], [C], [D]]
      const ancestors = ancestorEngine.getAncestors(fileA_ancestors, 3);
      //   - getDescendants(A) in descendant chain returns [[B], [C], [D]]
      const descendants = descendantEngine.getDescendants(fileA_descendants, 3);

      // Verify: Both should return the same structure (parallel, not mirror)
      expect(ancestors).toHaveLength(3);
      expect(descendants).toHaveLength(3);

      expect(ancestors[0][0].basename).toBe('B');
      expect(ancestors[1][0].basename).toBe('C');
      expect(ancestors[2][0].basename).toBe('D');

      expect(descendants[0][0].basename).toBe('B');
      expect(descendants[1][0].basename).toBe('C');
      expect(descendants[2][0].basename).toBe('D');
    });

    it('should have same behavior for cycles', () => {
      // Setup: A → B → C → A (cycle)
      const graph = createMockGraph([
        ['A', 'B'],
        ['B', 'C'],
        ['C', 'A']
      ]);
      const engine = new RelationshipEngine(graph);
      const fileA = (graph as any).graph.get('A')!.file;

      // Test both getAncestors(A) and getDescendants(A)
      const ancestors = engine.getAncestors(fileA, 10);
      const descendants = engine.getDescendants(fileA, 10);

      // Expect: Both should handle cycle gracefully without hanging
      expect(ancestors).toBeDefined();
      expect(descendants).toBeDefined();

      // Both should complete and find the cycle
      expect(ancestors.length).toBeGreaterThan(0);
      expect(descendants.length).toBeGreaterThan(0);
    });

    it('should respect same maxDepth setting', () => {
      // Setup: Long chain structure
      const { graph, files } = createLinearChain(10, 3);
      const engine = new RelationshipEngine(graph);
      const fileA = files.get('A')!;

      // Test: Both methods with same maxDepth (default from settings = 3)
      const ancestors = engine.getAncestors(fileA);
      const descendants = engine.getDescendants(fileA);

      // Expect: Both respect depth limit equally
      expect(ancestors).toHaveLength(3);
      expect(descendants).toHaveLength(0); // A is at the start, has no descendants in ancestor chain
    });
  });

  describe('Performance', () => {
    it('should process 1000-node lineage in reasonable time', () => {
      // Setup: Linear chain of 1000 nodes
      const { graph, files } = createDescendantChain(1000, 1000);
      const engine = new RelationshipEngine(graph);

      const startTime = Date.now();
      const descendants = engine.getDescendants(files.get('A')!, 1000);
      const endTime = Date.now();

      // Measure: Execution time
      const duration = endTime - startTime;

      // Should complete in reasonable time
      expect(duration).toBeLessThan(1000); // Less than 1 second

      // Verify correctness
      expect(descendants).toHaveLength(999); // A has 999 descendants
    });

    it('should handle wide tree (many children per level)', () => {
      // Setup: Node with many children
      const edges: [string, string][] = [];

      // A has 50 children (C0, C1, C2, ... C49)
      for (let i = 0; i < 50; i++) {
        edges.push([`C${i}`, 'A']);
      }

      // Each child has 50 children (GC0, GC1, ... GC49)
      for (let i = 0; i < 50; i++) {
        for (let j = 0; j < 50; j++) {
          edges.push([`GC${j}`, `C${i}`]);
        }
      }

      const graph = createMockGraph(edges, 2);
      const engine = new RelationshipEngine(graph);
      const fileA = (graph as any).graph.get('A')!.file;

      const startTime = Date.now();
      const descendants = engine.getDescendants(fileA, 2);
      const endTime = Date.now();

      // Should complete quickly
      const duration = endTime - startTime;
      expect(duration).toBeLessThan(500); // Less than 500ms

      // Generation 1: 50 children
      expect(descendants[0]).toHaveLength(50);

      // Generation 2: 50 grandchildren (merged from all paths)
      expect(descendants[1]).toHaveLength(50);
    });

    it('should handle deep tree (100 levels)', () => {
      // Setup: Linear chain of 100 nodes
      const { graph, files } = createDescendantChain(100, 100);
      const engine = new RelationshipEngine(graph);

      const startTime = Date.now();
      const descendants = engine.getDescendants(files.get('A')!, 100);
      const endTime = Date.now();

      // Should complete quickly
      const duration = endTime - startTime;
      expect(duration).toBeLessThan(500); // Less than 500ms

      // Verify correctness
      expect(descendants).toHaveLength(99);
    });

    it('should perform similarly to getAncestors', () => {
      // Setup: Two graph structures with same size
      const ancestorChain = createLinearChain(500, 500);
      const descendantChain = createDescendantChain(500, 500);

      const ancestorEngine = new RelationshipEngine(ancestorChain.graph);
      const descendantEngine = new RelationshipEngine(descendantChain.graph);

      const fileA_ancestors = ancestorChain.files.get('A')!;
      const fileA_descendants = descendantChain.files.get('A')!;

      // Benchmark getAncestors
      const startAncestors = Date.now();
      const ancestorsResult = ancestorEngine.getAncestors(fileA_ancestors, 500);
      const durationAncestors = Date.now() - startAncestors;

      // Benchmark getDescendants
      const startDescendants = Date.now();
      const descendantsResult = descendantEngine.getDescendants(fileA_descendants, 500);
      const durationDescendants = Date.now() - startDescendants;

      // Verify both methods return results
      expect(ancestorsResult.length).toBeGreaterThan(0);
      expect(descendantsResult.length).toBeGreaterThan(0);

      // Expect: Similar performance characteristics
      // If both durations are 0 (too fast to measure), that's fine
      // Otherwise, allow 2x difference in either direction, with minimum threshold
      if (durationAncestors > 0 && durationDescendants > 0) {
        expect(durationDescendants).toBeLessThan(Math.max(durationAncestors * 2, 100));
        expect(durationAncestors).toBeLessThan(Math.max(durationDescendants * 2, 100));
      }
      // If both complete in <1ms, consider that a pass (both are fast enough)
      expect(durationAncestors + durationDescendants).toBeLessThan(1000); // Total under 1 second
    });
  });
});
