import { App, TFile } from 'obsidian';

/**
 * Result of a frontmatter modification operation
 */
export interface FrontmatterEditResult {
	/** Whether the operation succeeded */
	success: boolean;

	/** Error message if operation failed */
	error?: string;

	/** The modified file */
	file: TFile;

	/** The field that was modified */
	field: string;

	/** The value that was added/removed */
	value: string;

	/** Type of operation performed */
	operation: 'add' | 'remove';
}

/**
 * Options for frontmatter modification
 */
export interface FrontmatterEditOptions {
	/** Whether to create field if it doesn't exist */
	createIfMissing?: boolean;

	/** Whether to remove field if it becomes empty */
	removeIfEmpty?: boolean;

	/** Whether to validate the value before adding */
	validate?: boolean;

	/** Custom validator function */
	validator?: (value: string) => boolean;
}

/**
 * Safely modifies note frontmatter for relationship management.
 *
 * Uses Obsidian's processFrontMatter API to ensure safe, atomic updates
 * with automatic undo/redo support.
 */
export class FrontmatterEditor {
	private app: App;

	constructor(app: App) {
		this.app = app;
	}

	/**
	 * Adds a value to a frontmatter field array.
	 *
	 * @param file - The file to modify
	 * @param fieldName - The frontmatter field name
	 * @param value - The value to add (wiki-link format)
	 * @param options - Modification options
	 * @returns Result of the operation
	 *
	 * @example
	 * await editor.addToField(currentFile, 'parent', '[[Project A]]');
	 */
	async addToField(
		file: TFile,
		fieldName: string,
		value: string,
		options: FrontmatterEditOptions = {}
	): Promise<FrontmatterEditResult> {
		try {
			await this.app.fileManager.processFrontMatter(file, (frontmatter) => {
				// Get current field value
				let fieldValue = frontmatter[fieldName];

				// Initialize as array if missing
				if (fieldValue === undefined || fieldValue === null) {
					if (!options.createIfMissing) {
						throw new Error(`Field "${fieldName}" does not exist`);
					}
					fieldValue = [];
				}

				// Ensure array format
				const fieldArray = Array.isArray(fieldValue)
					? fieldValue
					: [fieldValue];

				// Validate value if validator provided
				if (options.validator && !options.validator(value)) {
					throw new Error(`Invalid value: ${value}`);
				}

				// Check for duplicates
				if (fieldArray.includes(value)) {
					throw new Error(`Value already exists: ${value}`);
				}

				// Add value
				fieldArray.push(value);

				// Update frontmatter
				frontmatter[fieldName] = fieldArray;
			});

			return {
				success: true,
				file,
				field: fieldName,
				value,
				operation: 'add'
			};

		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : String(error),
				file,
				field: fieldName,
				value,
				operation: 'add'
			};
		}
	}

	/**
	 * Removes a value from a frontmatter field array.
	 *
	 * @param file - The file to modify
	 * @param fieldName - The frontmatter field name
	 * @param value - The value to remove
	 * @param options - Modification options
	 * @returns Result of the operation
	 *
	 * @example
	 * await editor.removeFromField(currentFile, 'parent', '[[Old Parent]]');
	 */
	async removeFromField(
		file: TFile,
		fieldName: string,
		value: string,
		options: FrontmatterEditOptions = {}
	): Promise<FrontmatterEditResult> {
		try {
			await this.app.fileManager.processFrontMatter(file, (frontmatter) => {
				const fieldValue = frontmatter[fieldName];

				// Field doesn't exist - nothing to remove
				if (fieldValue === undefined || fieldValue === null) {
					throw new Error(`Field "${fieldName}" does not exist`);
				}

				// Ensure array format
				const fieldArray = Array.isArray(fieldValue)
					? fieldValue
					: [fieldValue];

				// Check if value exists
				if (!fieldArray.includes(value)) {
					throw new Error(`Value not found: ${value}`);
				}

				// Remove value
				const filtered = fieldArray.filter(v => v !== value);

				// Update frontmatter
				if (filtered.length === 0 && options.removeIfEmpty) {
					// Remove field entirely if empty
					delete frontmatter[fieldName];
				} else if (filtered.length === 1) {
					// Convert to single value if only one remains
					frontmatter[fieldName] = filtered[0];
				} else {
					// Keep as array
					frontmatter[fieldName] = filtered;
				}
			});

			return {
				success: true,
				file,
				field: fieldName,
				value,
				operation: 'remove'
			};

		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : String(error),
				file,
				field: fieldName,
				value,
				operation: 'remove'
			};
		}
	}

	/**
	 * Checks if a file has a specific value in a frontmatter field.
	 *
	 * @param file - The file to check
	 * @param fieldName - The frontmatter field name
	 * @param value - The value to look for
	 * @returns Whether the value exists in the field
	 */
	hasFieldValue(file: TFile, fieldName: string, value: string): boolean {
		const cache = this.app.metadataCache.getFileCache(file);
		if (!cache?.frontmatter) return false;

		const fieldValue = cache.frontmatter[fieldName];
		if (!fieldValue) return false;

		const fieldArray = Array.isArray(fieldValue) ? fieldValue : [fieldValue];
		return fieldArray.includes(value);
	}

	/**
	 * Gets all values from a frontmatter field.
	 *
	 * @param file - The file to check
	 * @param fieldName - The frontmatter field name
	 * @returns Array of values (empty if field doesn't exist)
	 */
	getFieldValues(file: TFile, fieldName: string): string[] {
		const cache = this.app.metadataCache.getFileCache(file);
		if (!cache?.frontmatter) return [];

		const fieldValue = cache.frontmatter[fieldName];
		if (!fieldValue) return [];

		return Array.isArray(fieldValue) ? fieldValue : [fieldValue];
	}
}
