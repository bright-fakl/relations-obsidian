import { App, Modal, TFile, setIcon } from 'obsidian';

/**
 * Modal for displaying a list of results with filtering.
 *
 * This modal displays a list of notes with a search filter,
 * allowing users to quickly find and navigate to specific results.
 * Used by commands that return multiple notes (e.g., siblings, cousins).
 *
 * @example
 * const modal = new ResultsModal(
 *   app,
 *   siblings,
 *   'Siblings of Note A',
 *   (note) => {
 *     app.workspace.openLinkText(note.path, '', false);
 *   }
 * );
 * modal.open();
 */
export class ResultsModal extends Modal {
	private results: TFile[];
	private title: string;
	private onSelect: (note: TFile) => void;
	private filterInput!: HTMLInputElement;
	private resultsContainer!: HTMLElement;

	/**
	 * Creates a new results modal.
	 *
	 * @param app - Obsidian app instance
	 * @param results - Array of result notes to display
	 * @param title - Modal title
	 * @param onSelect - Callback function called when a result is selected
	 */
	constructor(
		app: App,
		results: TFile[],
		title: string,
		onSelect: (note: TFile) => void
	) {
		super(app);
		this.results = results;
		this.title = title;
		this.onSelect = onSelect;
	}

	/**
	 * Called when the modal is opened.
	 *
	 * Renders the modal content with title, count, filter input,
	 * and the list of results.
	 */
	onOpen(): void {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass('relation-results-modal');

		// Title
		const titleEl = contentEl.createEl('h2', { text: this.title });
		titleEl.addClass('relation-results-title');

		// Count
		const countEl = contentEl.createDiv('relation-results-count');
		countEl.setText(`${this.results.length} result${this.results.length !== 1 ? 's' : ''}`);

		// Filter input
		const filterContainer = contentEl.createDiv('relation-results-filter');
		const filterIcon = filterContainer.createSpan('relation-results-filter-icon');
		setIcon(filterIcon, 'search');

		this.filterInput = filterContainer.createEl('input', {
			type: 'text',
			placeholder: 'Filter results...'
		});
		this.filterInput.addClass('relation-results-filter-input');

		this.filterInput.addEventListener('input', () => {
			this.renderResults();
		});

		// Results container
		this.resultsContainer = contentEl.createDiv('relation-results-container');

		// Initial render
		this.renderResults();

		// Focus filter input
		this.filterInput.focus();
	}

	/**
	 * Renders the list of results based on current filter.
	 *
	 * This method is called initially and whenever the filter input changes.
	 * It filters the results based on the search text and displays them.
	 */
	private renderResults(): void {
		this.resultsContainer.empty();

		const filterText = this.filterInput.value.toLowerCase();
		const filteredResults = this.results.filter(file =>
			file.basename.toLowerCase().includes(filterText)
		);

		if (filteredResults.length === 0) {
			const emptyEl = this.resultsContainer.createDiv('relation-results-empty');
			emptyEl.setText('No results found');
			return;
		}

		const listEl = this.resultsContainer.createEl('ul', {
			cls: 'relation-results-list'
		});

		for (const file of filteredResults) {
			const itemEl = listEl.createEl('li', {
				cls: 'relation-results-item'
			});

			const linkEl = itemEl.createDiv('relation-results-link');
			linkEl.setText(file.basename);

			// Click handler
			linkEl.addEventListener('click', () => {
				this.onSelect(file);
				this.close();
			});

			// Keyboard support
			linkEl.tabIndex = 0;
			linkEl.addEventListener('keydown', (e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					this.onSelect(file);
					this.close();
				}
			});

			// Add path hint
			const pathEl = itemEl.createDiv('relation-results-path');
			pathEl.setText(file.path);
		}
	}

	/**
	 * Called when the modal is closed.
	 *
	 * Cleans up the modal content.
	 */
	onClose(): void {
		const { contentEl } = this;
		contentEl.empty();
	}
}

/**
 * Shows a results modal.
 *
 * This is a convenience function that creates and opens a ResultsModal.
 *
 * @param app - Obsidian app instance
 * @param results - Results to display
 * @param title - Modal title
 * @param onSelect - Callback when a result is selected
 *
 * @example
 * showResults(
 *   app,
 *   siblings,
 *   'Siblings',
 *   (note) => app.workspace.openLinkText(note.path, '', false)
 * );
 */
export function showResults(
	app: App,
	results: TFile[],
	title: string,
	onSelect: (note: TFile) => void
): void {
	const modal = new ResultsModal(app, results, title, onSelect);
	modal.open();
}
