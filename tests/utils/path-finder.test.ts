import { describe, it, expect, beforeEach } from 'vitest';
import { TFile } from 'obsidian';
import { findShortestPath, findAllPaths } from '../../src/utils/path-finder';
import { RelationGraph } from '../../src/relation-graph';
import { FrontmatterCache } from '../../src/frontmatter-cache';

/**
 * Helper to create mock TFile objects for testing
 */
function createMockFile(basename: string): TFile {
	const file = new TFile();
	file.path = `${basename}.md`;
	file.basename = basename;
	file.name = `${basename}.md`;
	return file;
}

/**
 * Helper to create a mock RelationGraph with specified relationships
 */
function createMockGraph(
	relationships: Array<[string, string]>
): { graph: RelationGraph; files: Map<string, TFile> } {
	const files = new Map<string, TFile>();
	const uniqueNames = new Set<string>();

	// Collect all unique file names
	relationships.forEach(([child, parent]) => {
		uniqueNames.add(child);
		uniqueNames.add(parent);
	});

	// Create TFile objects
	uniqueNames.forEach(name => {
		files.set(name, createMockFile(name));
	});

	// Create mock app and cache
	const mockApp = {
		vault: {
			getMarkdownFiles: () => Array.from(files.values())
		},
		metadataCache: {
			getFileCache: () => null,
			getFirstLinkpathDest: () => null
		}
	} as any;

	const frontmatterCache = new FrontmatterCache(mockApp);
	const graph = new RelationGraph(mockApp, 'parent', 5, frontmatterCache);

	// Manually build graph structure
	const graphData = (graph as any).graph;
	files.forEach(file => {
		graphData.set(file.path, { file, parents: [], children: [] });
	});

	// Add relationships
	relationships.forEach(([childName, parentName]) => {
		const childFile = files.get(childName)!;
		const parentFile = files.get(parentName)!;
		const childNode = graphData.get(childFile.path);
		const parentNode = graphData.get(parentFile.path);

		if (childNode && parentNode) {
			childNode.parents.push(parentFile);
			parentNode.children.push(childFile);
		}
	});

	return { graph, files };
}

describe('Path Finding', () => {
	describe('findShortestPath()', () => {
		it('should find shortest path in linear chain: A → B → C → D', () => {
			// Setup: A → B → C → D
			const { graph, files } = createMockGraph([
				['A', 'B'],
				['B', 'C'],
				['C', 'D']
			]);

			const A = files.get('A')!;
			const D = files.get('D')!;

			// Test
			const path = findShortestPath(A, D, graph);

			// Verify
			expect(path).not.toBeNull();
			expect(path!.length).toBe(3); // 3 edges
			expect(path!.path.length).toBe(4); // 4 nodes
			expect(path!.path.map(f => f.basename)).toEqual(['A', 'B', 'C', 'D']);
			expect(path!.direction).toBe('up');
		});

		it('should find shortest path in diamond: A → B, A → C; B → D, C → D', () => {
			// Setup diamond structure
			const { graph, files } = createMockGraph([
				['A', 'B'],
				['A', 'C'],
				['B', 'D'],
				['C', 'D']
			]);

			const A = files.get('A')!;
			const D = files.get('D')!;

			// Test
			const path = findShortestPath(A, D, graph);

			// Verify
			expect(path).not.toBeNull();
			expect(path!.length).toBe(2); // 2 edges (shortest path)
			expect(path!.path.length).toBe(3); // 3 nodes
			// Path should be either A → B → D or A → C → D
			expect(path!.path[0].basename).toBe('A');
			expect(path!.path[2].basename).toBe('D');
			expect(['B', 'C']).toContain(path!.path[1].basename);
		});

		it('should return null when no path exists', () => {
			// Setup: Disconnected graphs (A → B) and (C → D)
			const { graph, files } = createMockGraph([
				['A', 'B'],
				['C', 'D']
			]);

			const A = files.get('A')!;
			const D = files.get('D')!;

			// Test
			const path = findShortestPath(A, D, graph);

			// Verify
			expect(path).toBeNull();
		});

		it('should return zero-length path when start equals end', () => {
			// Setup
			const { graph, files } = createMockGraph([
				['A', 'B']
			]);

			const A = files.get('A')!;

			// Test
			const path = findShortestPath(A, A, graph);

			// Verify
			expect(path).not.toBeNull();
			expect(path!.length).toBe(0);
			expect(path!.path.length).toBe(1);
			expect(path!.path[0].basename).toBe('A');
			expect(path!.direction).toBe('mixed');
		});

		it('should handle bidirectional paths correctly', () => {
			// Setup: A → B → C
			const { graph, files } = createMockGraph([
				['A', 'B'],
				['B', 'C']
			]);

			const A = files.get('A')!;
			const C = files.get('C')!;

			// Test path from A to C (upward)
			const pathUp = findShortestPath(A, C, graph);
			expect(pathUp).not.toBeNull();
			expect(pathUp!.direction).toBe('up');
			expect(pathUp!.path.map(f => f.basename)).toEqual(['A', 'B', 'C']);

			// Test path from C to A (downward)
			const pathDown = findShortestPath(C, A, graph);
			expect(pathDown).not.toBeNull();
			expect(pathDown!.direction).toBe('down');
			expect(pathDown!.path.map(f => f.basename)).toEqual(['C', 'B', 'A']);
		});

		it('should handle cycles without infinite loops', () => {
			// Setup: A → B → C → B (cycle between B and C)
			const { graph, files } = createMockGraph([
				['A', 'B'],
				['B', 'C'],
				['C', 'B'] // Cycle
			]);

			const A = files.get('A')!;
			const C = files.get('C')!;

			// Test - should find path without hanging
			const path = findShortestPath(A, C, graph);

			// Verify path found
			expect(path).not.toBeNull();
			expect(path!.path.map(f => f.basename)).toEqual(['A', 'B', 'C']);
		});

		it('should find path through multiple branches', () => {
			// Setup: Complex structure
			//       E
			//      /
			//  A → B → C
			//       \
			//        D
			const { graph, files } = createMockGraph([
				['A', 'B'],
				['B', 'C'],
				['B', 'D'],
				['B', 'E']
			]);

			const A = files.get('A')!;
			const E = files.get('E')!;

			// Test
			const path = findShortestPath(A, E, graph);

			// Verify
			expect(path).not.toBeNull();
			expect(path!.length).toBe(2);
			expect(path!.path.map(f => f.basename)).toEqual(['A', 'B', 'E']);
		});
	});

	describe('findAllPaths()', () => {
		it('should find all paths within max length', () => {
			// Setup: Diamond with two paths of equal length
			const { graph, files } = createMockGraph([
				['A', 'B'],
				['A', 'C'],
				['B', 'D'],
				['C', 'D']
			]);

			const A = files.get('A')!;
			const D = files.get('D')!;

			// Test
			const paths = findAllPaths(A, D, graph, 5);

			// Verify
			expect(paths.length).toBe(2); // Two paths: A→B→D and A→C→D
			expect(paths[0].length).toBe(2);
			expect(paths[1].length).toBe(2);
		});

		it('should limit paths to max length', () => {
			// Setup: Long chain A → B → C → D → E
			const { graph, files } = createMockGraph([
				['A', 'B'],
				['B', 'C'],
				['C', 'D'],
				['D', 'E']
			]);

			const A = files.get('A')!;
			const E = files.get('E')!;

			// Test with maxLength = 3
			const paths = findAllPaths(A, E, graph, 3);

			// Verify - should find no paths because shortest is 4 edges
			expect(paths.length).toBe(0);
		});

		it('should return paths sorted by length', () => {
			// Setup: Multiple paths of different lengths
			//     D
			//    /
			//  B → E
			// /     \
			// A      F
			// \     /
			//  C → G
			const { graph, files } = createMockGraph([
				['A', 'B'],
				['A', 'C'],
				['B', 'D'],
				['B', 'E'],
				['E', 'F'],
				['C', 'G'],
				['G', 'F']
			]);

			const A = files.get('A')!;
			const F = files.get('F')!;

			// Test
			const paths = findAllPaths(A, F, graph, 10);

			// Verify paths are sorted by length
			expect(paths.length).toBeGreaterThan(0);
			for (let i = 1; i < paths.length; i++) {
				expect(paths[i].length).toBeGreaterThanOrEqual(paths[i - 1].length);
			}
		});

		it('should return empty array when no paths exist', () => {
			// Setup: Disconnected nodes
			const { graph, files } = createMockGraph([
				['A', 'B'],
				['C', 'D']
			]);

			const A = files.get('A')!;
			const D = files.get('D')!;

			// Test
			const paths = findAllPaths(A, D, graph, 10);

			// Verify
			expect(paths.length).toBe(0);
		});
	});
});
