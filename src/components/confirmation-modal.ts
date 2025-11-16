import { App, Modal } from 'obsidian';

/**
 * Simple confirmation modal for destructive actions.
 *
 * Displays a title, message, and Cancel/Confirm buttons.
 * Calls the callback with true/false based on user choice.
 */
export class ConfirmationModal extends Modal {
	private title: string;
	private message: string;
	private onConfirm: (confirmed: boolean) => void;

	/**
	 * Creates a new confirmation modal.
	 *
	 * @param app - The Obsidian app instance
	 * @param title - The modal title
	 * @param message - The confirmation message
	 * @param onConfirm - Callback with user's choice (true = confirmed, false = cancelled)
	 *
	 * @example
	 * const modal = new ConfirmationModal(
	 *   app,
	 *   'Remove Parent',
	 *   'Are you sure you want to remove this parent relationship?',
	 *   (confirmed) => {
	 *     if (confirmed) {
	 *       // Perform destructive action
	 *     }
	 *   }
	 * );
	 * modal.open();
	 */
	constructor(
		app: App,
		title: string,
		message: string,
		onConfirm: (confirmed: boolean) => void
	) {
		super(app);
		this.title = title;
		this.message = message;
		this.onConfirm = onConfirm;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		contentEl.addClass('relation-confirmation-modal');

		// Title
		contentEl.createEl('h2', { text: this.title });

		// Message
		contentEl.createEl('p', { text: this.message, cls: 'relation-confirmation-message' });

		// Button container
		const buttonContainer = contentEl.createDiv('modal-button-container');

		// Cancel button
		const cancelButton = buttonContainer.createEl('button', {
			text: 'Cancel',
			cls: 'mod-secondary'
		});
		cancelButton.addEventListener('click', () => {
			this.onConfirm(false);
			this.close();
		});

		// Confirm button
		const confirmButton = buttonContainer.createEl('button', {
			text: 'Confirm',
			cls: 'mod-warning'
		});
		confirmButton.addEventListener('click', () => {
			this.onConfirm(true);
			this.close();
		});

		// Focus confirm button by default
		confirmButton.focus();

		// Handle escape key
		this.scope.register([], 'Escape', () => {
			this.onConfirm(false);
			this.close();
			return false;
		});

		// Handle enter key
		this.scope.register([], 'Enter', () => {
			this.onConfirm(true);
			this.close();
			return false;
		});
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
