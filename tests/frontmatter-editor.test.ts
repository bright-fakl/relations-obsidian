import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FrontmatterEditor } from '../src/frontmatter-editor';
import { App, TFile } from 'obsidian';

describe('FrontmatterEditor', () => {
	let editor: FrontmatterEditor;
	let mockApp: App;
	let mockFile: TFile;

	beforeEach(() => {
		// Create mock file
		mockFile = {
			path: 'test.md',
			basename: 'test',
			extension: 'md'
		} as TFile;

		// Create mock app with fileManager
		mockApp = {
			fileManager: {
				processFrontMatter: vi.fn()
			},
			metadataCache: {
				getFileCache: vi.fn()
			}
		} as unknown as App;

		editor = new FrontmatterEditor(mockApp);
	});

	describe('addToField', () => {
		it('should add value to existing frontmatter field array', async () => {
			// Setup: Mock processFrontMatter to simulate existing field
			vi.mocked(mockApp.fileManager.processFrontMatter).mockImplementation(
				async (file, fn) => {
					const frontmatter = {
						parent: ['[[Parent A]]']
					};
					fn(frontmatter);
					// Verify the field was updated correctly
					expect(frontmatter.parent).toEqual(['[[Parent A]]', '[[Parent B]]']);
				}
			);

			const result = await editor.addToField(
				mockFile,
				'parent',
				'[[Parent B]]',
				{ createIfMissing: true }
			);

			expect(result.success).toBe(true);
			expect(result.operation).toBe('add');
			expect(result.field).toBe('parent');
			expect(result.value).toBe('[[Parent B]]');
		});

		it('should create new field when createIfMissing is true', async () => {
			vi.mocked(mockApp.fileManager.processFrontMatter).mockImplementation(
				async (file, fn) => {
					const frontmatter: Record<string, unknown> = {};
					fn(frontmatter);
					expect(frontmatter.parent).toEqual(['[[Parent A]]']);
				}
			);

			const result = await editor.addToField(
				mockFile,
				'parent',
				'[[Parent A]]',
				{ createIfMissing: true }
			);

			expect(result.success).toBe(true);
		});

		it('should fail when field does not exist and createIfMissing is false', async () => {
			vi.mocked(mockApp.fileManager.processFrontMatter).mockImplementation(
				async (file, fn) => {
					const frontmatter: Record<string, unknown> = {};
					fn(frontmatter);
				}
			);

			const result = await editor.addToField(
				mockFile,
				'parent',
				'[[Parent A]]',
				{ createIfMissing: false }
			);

			expect(result.success).toBe(false);
			expect(result.error).toContain('does not exist');
		});

		it('should reject duplicate values', async () => {
			vi.mocked(mockApp.fileManager.processFrontMatter).mockImplementation(
				async (file, fn) => {
					const frontmatter = {
						parent: ['[[Parent A]]']
					};
					fn(frontmatter);
				}
			);

			const result = await editor.addToField(
				mockFile,
				'parent',
				'[[Parent A]]',
				{ createIfMissing: true }
			);

			expect(result.success).toBe(false);
			expect(result.error).toContain('already exists');
		});

		it('should handle single value as array', async () => {
			vi.mocked(mockApp.fileManager.processFrontMatter).mockImplementation(
				async (file, fn) => {
					const frontmatter = {
						parent: '[[Parent A]]'  // Single value, not array
					};
					fn(frontmatter);
					expect(frontmatter.parent).toEqual(['[[Parent A]]', '[[Parent B]]']);
				}
			);

			const result = await editor.addToField(
				mockFile,
				'parent',
				'[[Parent B]]'
			);

			expect(result.success).toBe(true);
		});

		it('should validate value with custom validator', async () => {
			const validator = (value: string) => value.startsWith('[[');

			vi.mocked(mockApp.fileManager.processFrontMatter).mockImplementation(
				async (file, fn) => {
					const frontmatter: Record<string, unknown> = {};
					fn(frontmatter);
				}
			);

			const result = await editor.addToField(
				mockFile,
				'parent',
				'Invalid',
				{ createIfMissing: true, validator }
			);

			expect(result.success).toBe(false);
			expect(result.error).toContain('Invalid value');
		});
	});

	describe('removeFromField', () => {
		it('should remove value from frontmatter field array', async () => {
			vi.mocked(mockApp.fileManager.processFrontMatter).mockImplementation(
				async (file, fn) => {
					const frontmatter = {
						parent: ['[[Parent A]]', '[[Parent B]]', '[[Parent C]]']
					};
					fn(frontmatter);
					expect(frontmatter.parent).toEqual(['[[Parent A]]', '[[Parent C]]']);
				}
			);

			const result = await editor.removeFromField(
				mockFile,
				'parent',
				'[[Parent B]]'
			);

			expect(result.success).toBe(true);
			expect(result.operation).toBe('remove');
		});

		it('should convert to single value when only one remains', async () => {
			vi.mocked(mockApp.fileManager.processFrontMatter).mockImplementation(
				async (file, fn) => {
					const frontmatter = {
						parent: ['[[Parent A]]', '[[Parent B]]']
					};
					fn(frontmatter);
					expect(frontmatter.parent).toBe('[[Parent A]]');
				}
			);

			const result = await editor.removeFromField(
				mockFile,
				'parent',
				'[[Parent B]]'
			);

			expect(result.success).toBe(true);
		});

		it('should remove field entirely when removeIfEmpty is true', async () => {
			vi.mocked(mockApp.fileManager.processFrontMatter).mockImplementation(
				async (file, fn) => {
					const frontmatter = {
						parent: ['[[Parent A]]']
					};
					fn(frontmatter);
					expect(frontmatter.parent).toBeUndefined();
				}
			);

			const result = await editor.removeFromField(
				mockFile,
				'parent',
				'[[Parent A]]',
				{ removeIfEmpty: true }
			);

			expect(result.success).toBe(true);
		});

		it('should fail when field does not exist', async () => {
			vi.mocked(mockApp.fileManager.processFrontMatter).mockImplementation(
				async (file, fn) => {
					const frontmatter: Record<string, unknown> = {};
					fn(frontmatter);
				}
			);

			const result = await editor.removeFromField(
				mockFile,
				'parent',
				'[[Parent A]]'
			);

			expect(result.success).toBe(false);
			expect(result.error).toContain('does not exist');
		});

		it('should fail when value not found in field', async () => {
			vi.mocked(mockApp.fileManager.processFrontMatter).mockImplementation(
				async (file, fn) => {
					const frontmatter = {
						parent: ['[[Parent A]]']
					};
					fn(frontmatter);
				}
			);

			const result = await editor.removeFromField(
				mockFile,
				'parent',
				'[[Parent B]]'
			);

			expect(result.success).toBe(false);
			expect(result.error).toContain('not found');
		});

		it('should handle single value field', async () => {
			vi.mocked(mockApp.fileManager.processFrontMatter).mockImplementation(
				async (file, fn) => {
					const frontmatter = {
						parent: '[[Parent A]]'  // Single value
					};
					fn(frontmatter);
					expect(frontmatter.parent).toBeUndefined();
				}
			);

			const result = await editor.removeFromField(
				mockFile,
				'parent',
				'[[Parent A]]',
				{ removeIfEmpty: true }
			);

			expect(result.success).toBe(true);
		});
	});

	describe('hasFieldValue', () => {
		it('should return true when value exists in array field', () => {
			vi.mocked(mockApp.metadataCache.getFileCache).mockReturnValue({
				frontmatter: {
					parent: ['[[Parent A]]', '[[Parent B]]']
				}
			} as any);

			const result = editor.hasFieldValue(mockFile, 'parent', '[[Parent A]]');

			expect(result).toBe(true);
		});

		it('should return true when value exists in single value field', () => {
			vi.mocked(mockApp.metadataCache.getFileCache).mockReturnValue({
				frontmatter: {
					parent: '[[Parent A]]'
				}
			} as any);

			const result = editor.hasFieldValue(mockFile, 'parent', '[[Parent A]]');

			expect(result).toBe(true);
		});

		it('should return false when value does not exist', () => {
			vi.mocked(mockApp.metadataCache.getFileCache).mockReturnValue({
				frontmatter: {
					parent: ['[[Parent A]]']
				}
			} as any);

			const result = editor.hasFieldValue(mockFile, 'parent', '[[Parent B]]');

			expect(result).toBe(false);
		});

		it('should return false when field does not exist', () => {
			vi.mocked(mockApp.metadataCache.getFileCache).mockReturnValue({
				frontmatter: {}
			} as any);

			const result = editor.hasFieldValue(mockFile, 'parent', '[[Parent A]]');

			expect(result).toBe(false);
		});

		it('should return false when no frontmatter', () => {
			vi.mocked(mockApp.metadataCache.getFileCache).mockReturnValue(null);

			const result = editor.hasFieldValue(mockFile, 'parent', '[[Parent A]]');

			expect(result).toBe(false);
		});
	});

	describe('getFieldValues', () => {
		it('should return array of values from array field', () => {
			vi.mocked(mockApp.metadataCache.getFileCache).mockReturnValue({
				frontmatter: {
					parent: ['[[Parent A]]', '[[Parent B]]', '[[Parent C]]']
				}
			} as any);

			const result = editor.getFieldValues(mockFile, 'parent');

			expect(result).toEqual(['[[Parent A]]', '[[Parent B]]', '[[Parent C]]']);
		});

		it('should return array with single value from single value field', () => {
			vi.mocked(mockApp.metadataCache.getFileCache).mockReturnValue({
				frontmatter: {
					parent: '[[Parent A]]'
				}
			} as any);

			const result = editor.getFieldValues(mockFile, 'parent');

			expect(result).toEqual(['[[Parent A]]']);
		});

		it('should return empty array when field does not exist', () => {
			vi.mocked(mockApp.metadataCache.getFileCache).mockReturnValue({
				frontmatter: {}
			} as any);

			const result = editor.getFieldValues(mockFile, 'parent');

			expect(result).toEqual([]);
		});

		it('should return empty array when no frontmatter', () => {
			vi.mocked(mockApp.metadataCache.getFileCache).mockReturnValue(null);

			const result = editor.getFieldValues(mockFile, 'parent');

			expect(result).toEqual([]);
		});
	});

	describe('error handling', () => {
		it('should handle processFrontMatter errors gracefully', async () => {
			vi.mocked(mockApp.fileManager.processFrontMatter).mockRejectedValue(
				new Error('File is locked')
			);

			const result = await editor.addToField(
				mockFile,
				'parent',
				'[[Parent A]]'
			);

			expect(result.success).toBe(false);
			expect(result.error).toContain('File is locked');
		});

		it('should handle non-Error exceptions', async () => {
			vi.mocked(mockApp.fileManager.processFrontMatter).mockRejectedValue(
				'String error'
			);

			const result = await editor.addToField(
				mockFile,
				'parent',
				'[[Parent A]]'
			);

			expect(result.success).toBe(false);
			expect(result.error).toBe('String error');
		});
	});
});
