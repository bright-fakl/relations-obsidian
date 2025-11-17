import { describe, it, expect, beforeEach, vi } from 'vitest';
import { App, TFile } from 'obsidian';

// Mock FuzzySuggestModal before importing our modal
vi.mock('obsidian', async () => {
	const actual = await vi.importActual('obsidian');
	return {
		...actual,
		FuzzySuggestModal: class FuzzySuggestModal {
			app: any;
			scope: any = { register: vi.fn() };
			contentEl: any = {};

			constructor(app: any) {
				this.app = app;
			}

			setPlaceholder(placeholder: string) {}
			setInstructions(instructions: any[]) {}
			open() {}
			close() {}
			onClose() {}
		}
	};
});

import { NoteSelectionModal, selectNote } from '../../src/modals/note-selection-modal';

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

describe('NoteSelectionModal', () => {
	let app: App;
	let mockNotes: TFile[];
	let onSelectCallback: (note: TFile) => void;

	beforeEach(() => {
		// Create mock app
		app = {} as App;

		// Create mock notes
		mockNotes = [
			createMockFile('Note A'),
			createMockFile('Note B'),
			createMockFile('Note C')
		];

		onSelectCallback = vi.fn();
	});

	describe('Constructor', () => {
		it('should create modal with provided parameters', () => {
			const modal = new NoteSelectionModal(
				app,
				mockNotes,
				'Select a note',
				onSelectCallback
			);

			expect(modal).toBeDefined();
			expect(modal instanceof NoteSelectionModal).toBe(true);
		});

		it('should store notes array', () => {
			const modal = new NoteSelectionModal(
				app,
				mockNotes,
				'Select a note',
				onSelectCallback
			);

			// Access private property for testing
			expect((modal as any).notes).toBe(mockNotes);
		});

		it('should store callback function', () => {
			const modal = new NoteSelectionModal(
				app,
				mockNotes,
				'Select a note',
				onSelectCallback
			);

			expect((modal as any).onSelect).toBe(onSelectCallback);
		});
	});

	describe('getItems()', () => {
		it('should return all notes', () => {
			const modal = new NoteSelectionModal(
				app,
				mockNotes,
				'Select a note',
				onSelectCallback
			);

			const items = modal.getItems();
			expect(items).toBe(mockNotes);
			expect(items.length).toBe(3);
		});

		it('should return empty array for empty notes', () => {
			const modal = new NoteSelectionModal(
				app,
				[],
				'Select a note',
				onSelectCallback
			);

			const items = modal.getItems();
			expect(items).toEqual([]);
		});
	});

	describe('getItemText()', () => {
		it('should return note basename', () => {
			const modal = new NoteSelectionModal(
				app,
				mockNotes,
				'Select a note',
				onSelectCallback
			);

			expect(modal.getItemText(mockNotes[0])).toBe('Note A');
			expect(modal.getItemText(mockNotes[1])).toBe('Note B');
			expect(modal.getItemText(mockNotes[2])).toBe('Note C');
		});

		it('should handle special characters in basename', () => {
			const specialNote = createMockFile('Note with "quotes" & <chars>');
			const modal = new NoteSelectionModal(
				app,
				[specialNote],
				'Select a note',
				onSelectCallback
			);

			expect(modal.getItemText(specialNote)).toBe('Note with "quotes" & <chars>');
		});
	});

	describe('onChooseItem()', () => {
		it('should call callback with selected note on mouse event', () => {
			const modal = new NoteSelectionModal(
				app,
				mockNotes,
				'Select a note',
				onSelectCallback
			);

			const mouseEvent = new MouseEvent('click');
			modal.onChooseItem(mockNotes[0], mouseEvent);

			expect(onSelectCallback).toHaveBeenCalledWith(mockNotes[0]);
		});

		it('should call callback with selected note on keyboard event', () => {
			const modal = new NoteSelectionModal(
				app,
				mockNotes,
				'Select a note',
				onSelectCallback
			);

			const keyboardEvent = new KeyboardEvent('keydown', { key: 'Enter' });
			modal.onChooseItem(mockNotes[1], keyboardEvent);

			expect(onSelectCallback).toHaveBeenCalledWith(mockNotes[1]);
		});

		it('should pass correct note to callback', () => {
			const modal = new NoteSelectionModal(
				app,
				mockNotes,
				'Select a note',
				onSelectCallback
			);

			modal.onChooseItem(mockNotes[2], new MouseEvent('click'));
			expect(onSelectCallback).toHaveBeenCalledWith(mockNotes[2]);
		});
	});

	describe('Edge Cases', () => {
		it('should handle single note', () => {
			const modal = new NoteSelectionModal(
				app,
				[mockNotes[0]],
				'Select a note',
				onSelectCallback
			);

			const items = modal.getItems();
			expect(items.length).toBe(1);
		});

		it('should handle large note list', () => {
			const manyNotes = Array.from({ length: 100 }, (_, i) =>
				createMockFile(`Note ${i}`)
			);

			const modal = new NoteSelectionModal(
				app,
				manyNotes,
				'Select a note',
				onSelectCallback
			);

			const items = modal.getItems();
			expect(items.length).toBe(100);
		});

		it('should handle notes with similar names', () => {
			const similarNotes = [
				createMockFile('Note'),
				createMockFile('Note 1'),
				createMockFile('Note 10'),
				createMockFile('Note 2')
			];

			const modal = new NoteSelectionModal(
				app,
				similarNotes,
				'Select a note',
				onSelectCallback
			);

			const items = modal.getItems();
			expect(items.length).toBe(4);
			items.forEach((item, index) => {
				expect(modal.getItemText(item)).toBe(similarNotes[index].basename);
			});
		});
	});

	describe('Multiple Modals', () => {
		it('should support multiple independent modals', () => {
			const callback1 = vi.fn();
			const callback2 = vi.fn();

			const modal1 = new NoteSelectionModal(app, [mockNotes[0]], 'Modal 1', callback1);
			const modal2 = new NoteSelectionModal(app, [mockNotes[1]], 'Modal 2', callback2);

			expect(modal1).not.toBe(modal2);
			expect((modal1 as any).onSelect).toBe(callback1);
			expect((modal2 as any).onSelect).toBe(callback2);
		});
	});
});

describe('selectNote()', () => {
	let app: App;
	let mockNotes: TFile[];

	beforeEach(() => {
		app = {} as App;
		mockNotes = [
			createMockFile('Note A'),
			createMockFile('Note B'),
			createMockFile('Note C')
		];
	});

	it('should return a promise', () => {
		const result = selectNote(app, mockNotes, 'Select a note');
		expect(result).toBeInstanceOf(Promise);
	});

	it('should use default placeholder when not provided', () => {
		// This tests that the function can be called without placeholder
		const result = selectNote(app, mockNotes);
		expect(result).toBeInstanceOf(Promise);
	});

	// Note: Testing the full Promise resolution is complex in this environment
	// The core functionality is tested through the NoteSelectionModal tests above
});
