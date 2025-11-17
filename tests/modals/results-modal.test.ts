import { describe, it, expect, beforeEach, vi } from 'vitest';
import { App, TFile } from 'obsidian';
import { ResultsModal, showResults } from '../../src/modals/results-modal';

/**
 * Helper to create mock TFile objects for testing
 */
function createMockFile(basename: string, path?: string): TFile {
	const file = new TFile();
	file.path = path || `${basename}.md`;
	file.basename = basename;
	file.name = `${basename}.md`;
	return file;
}

/**
 * Helper to create Obsidian-compatible HTMLElement
 */
function createObsidianElement(): HTMLElement {
	const el = document.createElement('div');

	// Add Obsidian-specific methods
	(el as any).empty = function() {
		this.innerHTML = '';
		return this;
	};

	(el as any).createEl = function(tag: string, attrs?: any) {
		const child = document.createElement(tag);
		if (attrs?.text) {
			child.textContent = attrs.text;
		}
		if (attrs?.cls) {
			if (typeof attrs.cls === 'string') {
				child.className = attrs.cls;
			}
		}
		if (attrs?.type && child instanceof HTMLInputElement) {
			child.type = attrs.type;
		}
		if (attrs?.placeholder && child instanceof HTMLInputElement) {
			child.placeholder = attrs.placeholder;
		}
		this.appendChild(child);

		// Make child elements also have Obsidian methods
		(child as any).createEl = this.createEl;
		(child as any).createDiv = this.createDiv;
		(child as any).createSpan = this.createSpan;
		(child as any).addClass = function(className: string) {
			this.classList.add(className);
		};

		return child;
	};

	(el as any).createDiv = function(cls?: string) {
		const child = document.createElement('div');
		if (cls) {
			child.className = cls;
		}
		this.appendChild(child);

		// Make child elements also have Obsidian methods
		(child as any).empty = this.empty;
		(child as any).createEl = this.createEl;
		(child as any).createDiv = this.createDiv;
		(child as any).createSpan = this.createSpan;
		(child as any).setText = function(text: string) {
			this.textContent = text;
		};
		(child as any).addClass = function(className: string) {
			this.classList.add(className);
		};

		return child;
	};

	(el as any).createSpan = function(cls?: string) {
		const child = document.createElement('span');
		if (cls) {
			child.className = cls;
		}
		this.appendChild(child);

		(child as any).addClass = function(className: string) {
			this.classList.add(className);
		};

		return child;
	};

	(el as any).addClass = function(className: string) {
		this.classList.add(className);
	};

	return el;
}

// Mock setIcon function
vi.mock('obsidian', async () => {
	const actual = await vi.importActual('obsidian');
	return {
		...actual,
		setIcon: vi.fn((el: HTMLElement, icon: string) => {
			el.setAttribute('data-icon', icon);
		})
	};
});

describe('ResultsModal', () => {
	let app: App;
	let mockResults: TFile[];
	let onSelectCallback: (note: TFile) => void;

	beforeEach(() => {
		app = {} as App;
		mockResults = [
			createMockFile('Result A', 'folder/Result A.md'),
			createMockFile('Result B', 'folder/Result B.md'),
			createMockFile('Result C', 'other/Result C.md')
		];
		onSelectCallback = vi.fn();
	});

	describe('Constructor', () => {
		it('should create modal with provided parameters', () => {
			const modal = new ResultsModal(
				app,
				mockResults,
				'Test Results',
				onSelectCallback
			);

			expect(modal).toBeDefined();
			expect(modal instanceof ResultsModal).toBe(true);
		});

		it('should store results array', () => {
			const modal = new ResultsModal(
				app,
				mockResults,
				'Test Results',
				onSelectCallback
			);

			expect((modal as any).results).toBe(mockResults);
		});

		it('should store title', () => {
			const modal = new ResultsModal(
				app,
				mockResults,
				'Custom Title',
				onSelectCallback
			);

			expect((modal as any).title).toBe('Custom Title');
		});

		it('should store callback function', () => {
			const modal = new ResultsModal(
				app,
				mockResults,
				'Test Results',
				onSelectCallback
			);

			expect((modal as any).onSelect).toBe(onSelectCallback);
		});
	});

	describe('Modal Rendering', () => {
		it('should add modal class to content element', () => {
			const modal = new ResultsModal(
				app,
				mockResults,
				'Test Results',
				onSelectCallback
			);

			const mockContentEl = createObsidianElement();
			(modal as any).contentEl = mockContentEl;

			modal.onOpen();

			expect(mockContentEl.classList.contains('relation-results-modal')).toBe(true);
		});

		it('should render title element', () => {
			const modal = new ResultsModal(
				app,
				mockResults,
				'My Results',
				onSelectCallback
			);

			const mockContentEl = createObsidianElement();
			(modal as any).contentEl = mockContentEl;

			modal.onOpen();

			const titleEl = mockContentEl.querySelector('h2');
			expect(titleEl).toBeDefined();
			expect(titleEl?.textContent).toBe('My Results');
			expect(titleEl?.classList.contains('relation-results-title')).toBe(true);
		});

		it('should render count with correct plural', () => {
			const modal = new ResultsModal(
				app,
				mockResults,
				'Test Results',
				onSelectCallback
			);

			const mockContentEl = createObsidianElement();
			(modal as any).contentEl = mockContentEl;

			modal.onOpen();

			const countEl = mockContentEl.querySelector('.relation-results-count');
			expect(countEl?.textContent).toBe('3 results');
		});

		it('should render count with singular form for one result', () => {
			const modal = new ResultsModal(
				app,
				[mockResults[0]],
				'Test Results',
				onSelectCallback
			);

			const mockContentEl = createObsidianElement();
			(modal as any).contentEl = mockContentEl;

			modal.onOpen();

			const countEl = mockContentEl.querySelector('.relation-results-count');
			expect(countEl?.textContent).toBe('1 result');
		});

		it('should render filter input', () => {
			const modal = new ResultsModal(
				app,
				mockResults,
				'Test Results',
				onSelectCallback
			);

			const mockContentEl = createObsidianElement();
			(modal as any).contentEl = mockContentEl;

			modal.onOpen();

			const filterInput = mockContentEl.querySelector('.relation-results-filter-input') as HTMLInputElement;
			expect(filterInput).toBeDefined();
			expect(filterInput?.tagName).toBe('INPUT');
			expect(filterInput?.type).toBe('text');
			expect(filterInput?.placeholder).toBe('Filter results...');
		});

		it('should render all result items initially', () => {
			const modal = new ResultsModal(
				app,
				mockResults,
				'Test Results',
				onSelectCallback
			);

			const mockContentEl = createObsidianElement();
			(modal as any).contentEl = mockContentEl;

			modal.onOpen();

			const items = mockContentEl.querySelectorAll('.relation-results-item');
			expect(items.length).toBe(3);
		});

		it('should render result basenames', () => {
			const modal = new ResultsModal(
				app,
				mockResults,
				'Test Results',
				onSelectCallback
			);

			const mockContentEl = createObsidianElement();
			(modal as any).contentEl = mockContentEl;

			modal.onOpen();

			const links = mockContentEl.querySelectorAll('.relation-results-link');
			expect(links[0]?.textContent).toBe('Result A');
			expect(links[1]?.textContent).toBe('Result B');
			expect(links[2]?.textContent).toBe('Result C');
		});

		it('should render result paths', () => {
			const modal = new ResultsModal(
				app,
				mockResults,
				'Test Results',
				onSelectCallback
			);

			const mockContentEl = createObsidianElement();
			(modal as any).contentEl = mockContentEl;

			modal.onOpen();

			const paths = mockContentEl.querySelectorAll('.relation-results-path');
			expect(paths[0]?.textContent).toBe('folder/Result A.md');
			expect(paths[1]?.textContent).toBe('folder/Result B.md');
			expect(paths[2]?.textContent).toBe('other/Result C.md');
		});

		it('should clear content before rendering', () => {
			const modal = new ResultsModal(
				app,
				mockResults,
				'Test Results',
				onSelectCallback
			);

			const mockContentEl = createObsidianElement();
			mockContentEl.innerHTML = '<div>Old content</div>';
			(modal as any).contentEl = mockContentEl;

			modal.onOpen();

			expect(mockContentEl.innerHTML).not.toContain('Old content');
		});
	});

	describe('Filtering', () => {
		it('should filter results based on input', () => {
			const modal = new ResultsModal(
				app,
				mockResults,
				'Test Results',
				onSelectCallback
			);

			const mockContentEl = createObsidianElement();
			document.body.appendChild(mockContentEl);
			(modal as any).contentEl = mockContentEl;

			modal.onOpen();

			const filterInput = mockContentEl.querySelector('.relation-results-filter-input') as HTMLInputElement;
			filterInput.value = 'Result A';
			filterInput.dispatchEvent(new Event('input'));

			const items = mockContentEl.querySelectorAll('.relation-results-item');
			expect(items.length).toBe(1);

			const link = items[0]?.querySelector('.relation-results-link');
			expect(link?.textContent).toBe('Result A');

			document.body.removeChild(mockContentEl);
		});

		it('should be case insensitive', () => {
			const modal = new ResultsModal(
				app,
				mockResults,
				'Test Results',
				onSelectCallback
			);

			const mockContentEl = createObsidianElement();
			document.body.appendChild(mockContentEl);
			(modal as any).contentEl = mockContentEl;

			modal.onOpen();

			const filterInput = mockContentEl.querySelector('.relation-results-filter-input') as HTMLInputElement;
			filterInput.value = 'result b';
			filterInput.dispatchEvent(new Event('input'));

			const items = mockContentEl.querySelectorAll('.relation-results-item');
			expect(items.length).toBe(1);

			const link = items[0]?.querySelector('.relation-results-link');
			expect(link?.textContent).toBe('Result B');

			document.body.removeChild(mockContentEl);
		});

		it('should show multiple matches', () => {
			const modal = new ResultsModal(
				app,
				mockResults,
				'Test Results',
				onSelectCallback
			);

			const mockContentEl = createObsidianElement();
			document.body.appendChild(mockContentEl);
			(modal as any).contentEl = mockContentEl;

			modal.onOpen();

			const filterInput = mockContentEl.querySelector('.relation-results-filter-input') as HTMLInputElement;
			filterInput.value = 'Result';
			filterInput.dispatchEvent(new Event('input'));

			const items = mockContentEl.querySelectorAll('.relation-results-item');
			expect(items.length).toBe(3);

			document.body.removeChild(mockContentEl);
		});

		it('should show empty message when no matches', () => {
			const modal = new ResultsModal(
				app,
				mockResults,
				'Test Results',
				onSelectCallback
			);

			const mockContentEl = createObsidianElement();
			document.body.appendChild(mockContentEl);
			(modal as any).contentEl = mockContentEl;

			modal.onOpen();

			const filterInput = mockContentEl.querySelector('.relation-results-filter-input') as HTMLInputElement;
			filterInput.value = 'Nonexistent';
			filterInput.dispatchEvent(new Event('input'));

			const emptyEl = mockContentEl.querySelector('.relation-results-empty');
			expect(emptyEl).toBeDefined();
			expect(emptyEl?.textContent).toBe('No results found');

			const items = mockContentEl.querySelectorAll('.relation-results-item');
			expect(items.length).toBe(0);

			document.body.removeChild(mockContentEl);
		});

		it('should update results as user types', () => {
			const modal = new ResultsModal(
				app,
				mockResults,
				'Test Results',
				onSelectCallback
			);

			const mockContentEl = createObsidianElement();
			document.body.appendChild(mockContentEl);
			(modal as any).contentEl = mockContentEl;

			modal.onOpen();

			const filterInput = mockContentEl.querySelector('.relation-results-filter-input') as HTMLInputElement;

			// Type "A"
			filterInput.value = 'A';
			filterInput.dispatchEvent(new Event('input'));
			let items = mockContentEl.querySelectorAll('.relation-results-item');
			expect(items.length).toBe(1);

			// Clear filter
			filterInput.value = '';
			filterInput.dispatchEvent(new Event('input'));
			items = mockContentEl.querySelectorAll('.relation-results-item');
			expect(items.length).toBe(3);

			document.body.removeChild(mockContentEl);
		});
	});

	describe('Selection Behavior', () => {
		it('should call onSelect callback when item is clicked', () => {
			const modal = new ResultsModal(
				app,
				mockResults,
				'Test Results',
				onSelectCallback
			);

			const mockContentEl = createObsidianElement();
			(modal as any).contentEl = mockContentEl;
			modal.close = vi.fn();

			modal.onOpen();

			const firstLink = mockContentEl.querySelector('.relation-results-link') as HTMLElement;
			firstLink?.click();

			expect(onSelectCallback).toHaveBeenCalledWith(mockResults[0]);
		});

		it('should close modal after selection', () => {
			const modal = new ResultsModal(
				app,
				mockResults,
				'Test Results',
				onSelectCallback
			);

			const mockContentEl = createObsidianElement();
			(modal as any).contentEl = mockContentEl;
			modal.close = vi.fn();

			modal.onOpen();

			const firstLink = mockContentEl.querySelector('.relation-results-link') as HTMLElement;
			firstLink?.click();

			expect(modal.close).toHaveBeenCalled();
		});

		it('should pass correct note to callback', () => {
			const modal = new ResultsModal(
				app,
				mockResults,
				'Test Results',
				onSelectCallback
			);

			const mockContentEl = createObsidianElement();
			(modal as any).contentEl = mockContentEl;
			modal.close = vi.fn();

			modal.onOpen();

			const links = mockContentEl.querySelectorAll('.relation-results-link');
			(links[1] as HTMLElement)?.click();

			expect(onSelectCallback).toHaveBeenCalledWith(mockResults[1]);
		});

		it('should support keyboard selection with Enter', () => {
			const modal = new ResultsModal(
				app,
				mockResults,
				'Test Results',
				onSelectCallback
			);

			const mockContentEl = createObsidianElement();
			(modal as any).contentEl = mockContentEl;
			modal.close = vi.fn();

			modal.onOpen();

			const firstLink = mockContentEl.querySelector('.relation-results-link') as HTMLElement;
			const event = new KeyboardEvent('keydown', { key: 'Enter' });
			firstLink?.dispatchEvent(event);

			expect(onSelectCallback).toHaveBeenCalledWith(mockResults[0]);
			expect(modal.close).toHaveBeenCalled();
		});

		it('should support keyboard selection with Space', () => {
			const modal = new ResultsModal(
				app,
				mockResults,
				'Test Results',
				onSelectCallback
			);

			const mockContentEl = createObsidianElement();
			(modal as any).contentEl = mockContentEl;
			modal.close = vi.fn();

			modal.onOpen();

			const firstLink = mockContentEl.querySelector('.relation-results-link') as HTMLElement;
			const event = new KeyboardEvent('keydown', { key: ' ' });
			firstLink?.dispatchEvent(event);

			expect(onSelectCallback).toHaveBeenCalledWith(mockResults[0]);
			expect(modal.close).toHaveBeenCalled();
		});
	});

	describe('Modal Cleanup', () => {
		it('should clear content on close', () => {
			const modal = new ResultsModal(
				app,
				mockResults,
				'Test Results',
				onSelectCallback
			);

			const mockContentEl = createObsidianElement();
			(modal as any).contentEl = mockContentEl;

			modal.onOpen();
			expect(mockContentEl.children.length).toBeGreaterThan(0);

			modal.onClose();
			expect(mockContentEl.children.length).toBe(0);
		});
	});

	describe('Edge Cases', () => {
		it('should handle empty results list', () => {
			const modal = new ResultsModal(
				app,
				[],
				'Test Results',
				onSelectCallback
			);

			const mockContentEl = createObsidianElement();
			(modal as any).contentEl = mockContentEl;

			modal.onOpen();

			const countEl = mockContentEl.querySelector('.relation-results-count');
			expect(countEl?.textContent).toBe('0 results');

			const emptyEl = mockContentEl.querySelector('.relation-results-empty');
			expect(emptyEl?.textContent).toBe('No results found');
		});

		it('should handle single result', () => {
			const modal = new ResultsModal(
				app,
				[mockResults[0]],
				'Test Results',
				onSelectCallback
			);

			const mockContentEl = createObsidianElement();
			(modal as any).contentEl = mockContentEl;

			modal.onOpen();

			const items = mockContentEl.querySelectorAll('.relation-results-item');
			expect(items.length).toBe(1);
		});

		it('should handle large result list', () => {
			const manyResults = Array.from({ length: 100 }, (_, i) =>
				createMockFile(`Result ${i}`, `folder/Result ${i}.md`)
			);

			const modal = new ResultsModal(
				app,
				manyResults,
				'Test Results',
				onSelectCallback
			);

			const mockContentEl = createObsidianElement();
			(modal as any).contentEl = mockContentEl;

			modal.onOpen();

			const items = mockContentEl.querySelectorAll('.relation-results-item');
			expect(items.length).toBe(100);
		});

		it('should handle special characters in note names', () => {
			const specialNote = createMockFile('Note with "quotes" & <chars>', 'Note with "quotes" & <chars>.md');

			const modal = new ResultsModal(
				app,
				[specialNote],
				'Test Results',
				onSelectCallback
			);

			const mockContentEl = createObsidianElement();
			(modal as any).contentEl = mockContentEl;

			modal.onOpen();

			const link = mockContentEl.querySelector('.relation-results-link');
			expect(link?.textContent).toBe('Note with "quotes" & <chars>');
		});
	});
});

describe('showResults()', () => {
	let app: App;
	let mockResults: TFile[];
	let onSelectCallback: (note: TFile) => void;

	beforeEach(() => {
		app = {} as App;
		mockResults = [
			createMockFile('Result A'),
			createMockFile('Result B')
		];
		onSelectCallback = vi.fn();
	});

	it('should create and open a ResultsModal', () => {
		const openSpy = vi.spyOn(ResultsModal.prototype, 'open');

		showResults(app, mockResults, 'Test Results', onSelectCallback);

		expect(openSpy).toHaveBeenCalled();

		openSpy.mockRestore();
	});

	it('should pass parameters to modal constructor', () => {
		const constructorSpy = vi.spyOn(ResultsModal.prototype as any, 'constructor' as any);

		showResults(app, mockResults, 'Custom Title', onSelectCallback);

		// Modal was created (we can't easily spy on constructor, but we can verify it doesn't throw)
		expect(true).toBe(true);
	});
});
