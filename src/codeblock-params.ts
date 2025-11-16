/**
 * Codeblock parameter parsing and validation for relation-tree codeblocks.
 */

/**
 * Relationship type for the tree.
 */
export type RelationType = 'ancestors' | 'descendants' | 'siblings' | 'cousins';

/**
 * Display mode for the tree.
 * - tree: Full hierarchical tree with expand/collapse
 * - list: Flat list of results
 * - compact: Condensed tree with minimal spacing
 */
export type DisplayMode = 'tree' | 'list' | 'compact';

/**
 * Parameters for relation-tree codeblock.
 */
export interface CodeblockParams {
	/** Target note (wiki-link or file path) */
	note?: string;

	/** Type of relationship to display */
	type: RelationType;

	/** Maximum depth to traverse (default: from settings) */
	depth?: number;

	/** Display mode (default: tree) */
	mode?: DisplayMode;

	/** Parent field to use (default: first field from settings) */
	field?: string;

	/** Whether to show cycle indicators (default: true) */
	showCycles?: boolean;

	/** Whether tree should be initially collapsed (default: false) */
	collapsed?: boolean;
}

/**
 * Default parameter values.
 */
export const DEFAULT_PARAMS: Partial<CodeblockParams> = {
	type: 'ancestors',
	mode: 'tree',
	showCycles: true,
	collapsed: false
};

/**
 * Validation error for codeblock parameters.
 */
export class CodeblockValidationError extends Error {
	constructor(message: string, public field?: string) {
		super(message);
		this.name = 'CodeblockValidationError';
	}
}

/**
 * Parses YAML content from codeblock into typed parameters.
 *
 * @param source - Raw codeblock content
 * @returns Parsed parameters
 * @throws CodeblockValidationError if parsing fails
 *
 * @example
 * ```typescript
 * const source = `
 * note: [[My Note]]
 * type: ancestors
 * depth: 3
 * `;
 * const params = parseCodeblockParams(source);
 * // params.note === '[[My Note]]'
 * // params.type === 'ancestors'
 * // params.depth === 3
 * ```
 */
export function parseCodeblockParams(source: string): CodeblockParams {
	const lines = source.trim().split('\n');
	const params: any = {};

	for (const line of lines) {
		const trimmed = line.trim();

		// Skip empty lines and comments
		if (!trimmed || trimmed.startsWith('#')) continue;

		// Parse key: value format
		const colonIndex = trimmed.indexOf(':');
		if (colonIndex === -1) {
			throw new CodeblockValidationError(
				`Invalid parameter format: "${trimmed}". Expected "key: value"`,
				undefined
			);
		}

		const key = trimmed.substring(0, colonIndex).trim();
		const value = trimmed.substring(colonIndex + 1).trim();

		// Parse value based on key
		switch (key) {
			case 'note':
				params.note = value;
				break;

			case 'type':
				if (!['ancestors', 'descendants', 'siblings', 'cousins'].includes(value)) {
					throw new CodeblockValidationError(
						`Invalid type: "${value}". Must be one of: ancestors, descendants, siblings, cousins`,
						'type'
					);
				}
				params.type = value as RelationType;
				break;

			case 'depth':
				const depth = parseInt(value);
				if (isNaN(depth) || depth < 0) {
					throw new CodeblockValidationError(
						`Invalid depth: "${value}". Must be a positive number`,
						'depth'
					);
				}
				params.depth = depth;
				break;

			case 'mode':
				if (!['tree', 'list', 'compact'].includes(value)) {
					throw new CodeblockValidationError(
						`Invalid mode: "${value}". Must be one of: tree, list, compact`,
						'mode'
					);
				}
				params.mode = value as DisplayMode;
				break;

			case 'field':
				params.field = value;
				break;

			case 'showCycles':
				params.showCycles = value === 'true';
				break;

			case 'collapsed':
				params.collapsed = value === 'true';
				break;

			default:
				throw new CodeblockValidationError(
					`Unknown parameter: "${key}"`,
					key
				);
		}
	}

	// Merge with defaults
	const result = { ...DEFAULT_PARAMS, ...params };

	return result as CodeblockParams;
}

/**
 * Validates codeblock parameters.
 *
 * @param params - Parameters to validate
 * @param availableFields - List of available parent field names
 * @throws CodeblockValidationError if validation fails
 *
 * @example
 * ```typescript
 * const params = { type: 'ancestors', field: 'parent' };
 * validateCodeblockParams(params, ['parent', 'project']);
 * // No error - validation passes
 *
 * const invalidParams = { type: 'ancestors', field: 'nonexistent' };
 * validateCodeblockParams(invalidParams, ['parent', 'project']);
 * // Throws: Invalid field: "nonexistent"...
 * ```
 */
export function validateCodeblockParams(
	params: CodeblockParams,
	availableFields: string[]
): void {
	// Validate field exists if specified
	if (params.field && !availableFields.includes(params.field)) {
		throw new CodeblockValidationError(
			`Invalid field: "${params.field}". Available fields: ${availableFields.join(', ')}`,
			'field'
		);
	}

	// Validate depth is reasonable
	if (params.depth !== undefined && params.depth > 100) {
		throw new CodeblockValidationError(
			`Depth too large: ${params.depth}. Maximum is 100`,
			'depth'
		);
	}
}
