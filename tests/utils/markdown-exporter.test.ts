import { describe, it, expect } from 'vitest';
import { TFile } from 'obsidian';
import {
	exportTreeToMarkdown,
	exportNotesToMarkdown,
	exportPathToMarkdown,
	MarkdownExportOptions
} from '../../src/utils/markdown-exporter';
import { TreeNode } from '../../src/tree-model';

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
 * Helper to create a mock TreeNode
 */
function createMockTreeNode(
	basename: string,
	depth: number = 0,
	isCycle: boolean = false,
	children: TreeNode[] = []
): TreeNode {
	return {
		file: createMockFile(basename),
		children,
		depth,
		isCycle,
		metadata: {}
	};
}

describe('Markdown Export', () => {
	describe('exportTreeToMarkdown()', () => {
		it('should export simple tree with wiki-links', () => {
			// Setup: A → B → C
			const tree = createMockTreeNode('A', 0, false, [
				createMockTreeNode('B', 1, false, [
					createMockTreeNode('C', 2, false, [])
				])
			]);

			// Test
			const markdown = exportTreeToMarkdown(tree, undefined, {
				useWikiLinks: true,
				includeHeader: false
			});

			// Verify
			expect(markdown).toContain('- [[A]]');
			expect(markdown).toContain('  - [[B]]');
			expect(markdown).toContain('    - [[C]]');
		});

		it('should export tree with plain text (no wiki-links)', () => {
			// Setup: A → B
			const tree = createMockTreeNode('A', 0, false, [
				createMockTreeNode('B', 1, false, [])
			]);

			// Test
			const markdown = exportTreeToMarkdown(tree, undefined, {
				useWikiLinks: false,
				includeHeader: false
			});

			// Verify
			expect(markdown).toContain('- A');
			expect(markdown).toContain('  - B');
			expect(markdown).not.toContain('[[');
		});

		it('should include title header when requested', () => {
			// Setup
			const tree = createMockTreeNode('A', 0, false, []);

			// Test
			const markdown = exportTreeToMarkdown(tree, 'My Tree', {
				includeHeader: true
			});

			// Verify
			expect(markdown).toMatch(/^# My Tree\n/);
		});

		it('should respect max depth', () => {
			// Setup: A → B → C → D
			const tree = createMockTreeNode('A', 0, false, [
				createMockTreeNode('B', 1, false, [
					createMockTreeNode('C', 2, false, [
						createMockTreeNode('D', 3, false, [])
					])
				])
			]);

			// Test with maxDepth = 1
			const markdown = exportTreeToMarkdown(tree, undefined, {
				maxDepth: 1,
				includeHeader: false
			});

			// Verify - should only include A and B
			expect(markdown).toContain('- [[A]]');
			expect(markdown).toContain('  - [[B]]');
			expect(markdown).not.toContain('C');
			expect(markdown).not.toContain('D');
		});

		it('should include cycle indicators when showCycles is true', () => {
			// Setup: A → B (cycle)
			const tree = createMockTreeNode('A', 0, false, [
				createMockTreeNode('B', 1, true, []) // isCycle = true
			]);

			// Test
			const markdown = exportTreeToMarkdown(tree, undefined, {
				showCycles: true,
				includeHeader: false
			});

			// Verify
			expect(markdown).toContain('- [[A]]');
			expect(markdown).toContain('  - [[B]] 🔄');
		});

		it('should omit cycle indicators when showCycles is false', () => {
			// Setup: A → B (cycle)
			const tree = createMockTreeNode('A', 0, false, [
				createMockTreeNode('B', 1, true, [])
			]);

			// Test
			const markdown = exportTreeToMarkdown(tree, undefined, {
				showCycles: false,
				includeHeader: false
			});

			// Verify
			expect(markdown).toContain('- [[A]]');
			expect(markdown).toContain('  - [[B]]');
			expect(markdown).not.toContain('🔄');
		});

		it('should handle custom indentation', () => {
			// Setup: A → B
			const tree = createMockTreeNode('A', 0, false, [
				createMockTreeNode('B', 1, false, [])
			]);

			// Test with 4-space indent
			const markdown = exportTreeToMarkdown(tree, undefined, {
				indent: '    ',
				includeHeader: false
			});

			// Verify
			expect(markdown).toContain('- [[A]]');
			expect(markdown).toContain('    - [[B]]'); // 4 spaces
		});

		it('should export multiple trees (array input)', () => {
			// Setup: [A, B]
			const trees = [
				createMockTreeNode('A', 0, false, []),
				createMockTreeNode('B', 0, false, [])
			];

			// Test
			const markdown = exportTreeToMarkdown(trees, undefined, {
				includeHeader: false
			});

			// Verify
			expect(markdown).toContain('- [[A]]');
			expect(markdown).toContain('- [[B]]');
		});

		it('should export complex branching tree', () => {
			// Setup:
			//   A
			//  / \
			// B   C
			//     |
			//     D
			const tree = createMockTreeNode('A', 0, false, [
				createMockTreeNode('B', 1, false, []),
				createMockTreeNode('C', 1, false, [
					createMockTreeNode('D', 2, false, [])
				])
			]);

			// Test
			const markdown = exportTreeToMarkdown(tree, undefined, {
				includeHeader: false
			});

			// Verify
			const lines = markdown.split('\n');
			expect(lines[0]).toBe('- [[A]]');
			expect(lines[1]).toBe('  - [[B]]');
			expect(lines[2]).toBe('  - [[C]]');
			expect(lines[3]).toBe('    - [[D]]');
		});
	});

	describe('exportNotesToMarkdown()', () => {
		it('should export flat list with wiki-links', () => {
			// Setup
			const notes = [
				createMockFile('Note A'),
				createMockFile('Note B'),
				createMockFile('Note C')
			];

			// Test
			const markdown = exportNotesToMarkdown(notes, undefined, {
				useWikiLinks: true,
				includeHeader: false
			});

			// Verify
			expect(markdown).toContain('- [[Note A]]');
			expect(markdown).toContain('- [[Note B]]');
			expect(markdown).toContain('- [[Note C]]');
		});

		it('should export flat list with plain text', () => {
			// Setup
			const notes = [
				createMockFile('Note A'),
				createMockFile('Note B')
			];

			// Test
			const markdown = exportNotesToMarkdown(notes, undefined, {
				useWikiLinks: false,
				includeHeader: false
			});

			// Verify
			expect(markdown).toContain('- Note A');
			expect(markdown).toContain('- Note B');
			expect(markdown).not.toContain('[[');
		});

		it('should include title header when requested', () => {
			// Setup
			const notes = [createMockFile('Note A')];

			// Test
			const markdown = exportNotesToMarkdown(notes, 'Root Notes', {
				includeHeader: true
			});

			// Verify
			expect(markdown).toMatch(/^# Root Notes\n/);
		});

		it('should handle empty array', () => {
			// Setup
			const notes: TFile[] = [];

			// Test
			const markdown = exportNotesToMarkdown(notes, undefined, {
				includeHeader: false
			});

			// Verify
			expect(markdown).toBe('');
		});
	});

	describe('exportPathToMarkdown()', () => {
		it('should format path with arrows and wiki-links', () => {
			// Setup: A → B → C
			const path = [
				createMockFile('A'),
				createMockFile('B'),
				createMockFile('C')
			];

			// Test
			const markdown = exportPathToMarkdown(path, {
				useWikiLinks: true
			});

			// Verify
			expect(markdown).toBe('[[A]] → [[B]] → [[C]]');
		});

		it('should format path with arrows and plain text', () => {
			// Setup: A → B → C
			const path = [
				createMockFile('A'),
				createMockFile('B'),
				createMockFile('C')
			];

			// Test
			const markdown = exportPathToMarkdown(path, {
				useWikiLinks: false
			});

			// Verify
			expect(markdown).toBe('A → B → C');
		});

		it('should handle single-node path', () => {
			// Setup: [A]
			const path = [createMockFile('A')];

			// Test
			const markdown = exportPathToMarkdown(path, {
				useWikiLinks: true
			});

			// Verify
			expect(markdown).toBe('[[A]]');
		});

		it('should handle two-node path', () => {
			// Setup: A → B
			const path = [
				createMockFile('A'),
				createMockFile('B')
			];

			// Test
			const markdown = exportPathToMarkdown(path, {
				useWikiLinks: true
			});

			// Verify
			expect(markdown).toBe('[[A]] → [[B]]');
		});

		it('should handle empty path', () => {
			// Setup
			const path: TFile[] = [];

			// Test
			const markdown = exportPathToMarkdown(path);

			// Verify
			expect(markdown).toBe('');
		});

		it('should handle long path', () => {
			// Setup: A → B → C → D → E
			const path = [
				createMockFile('A'),
				createMockFile('B'),
				createMockFile('C'),
				createMockFile('D'),
				createMockFile('E')
			];

			// Test
			const markdown = exportPathToMarkdown(path, {
				useWikiLinks: false
			});

			// Verify
			expect(markdown).toBe('A → B → C → D → E');
		});
	});
});
