import { TFile } from 'obsidian';
import { TreeNode } from '../tree-model';

/**
 * Options for markdown export.
 */
export interface MarkdownExportOptions {
  /** Use wiki-links [[Note]] or plain text */
  useWikiLinks?: boolean;

  /** Include cycle indicators */
  showCycles?: boolean;

  /** Indentation string (default: "  ") */
  indent?: string;

  /** Maximum depth to export (default: unlimited) */
  maxDepth?: number;

  /** Include header with export info */
  includeHeader?: boolean;
}

/**
 * Default export options.
 */
const DEFAULT_EXPORT_OPTIONS: MarkdownExportOptions = {
  useWikiLinks: true,
  showCycles: true,
  indent: '  ',
  includeHeader: true
};

/**
 * Exports a tree to markdown format.
 *
 * @param tree - Tree node to export (or array of trees)
 * @param title - Optional title for the export
 * @param options - Export options
 * @returns Markdown string
 *
 * @example
 * // Given tree: A → [B → D, C → E]
 * // exportTreeToMarkdown(tree, "My Ancestors") returns:
 * // # My Ancestors
 * //
 * // - [[A]]
 * //   - [[B]]
 * //     - [[D]]
 * //   - [[C]]
 * //     - [[E]]
 */
export function exportTreeToMarkdown(
  tree: TreeNode | TreeNode[],
  title?: string,
  options: MarkdownExportOptions = {}
): string {
  const opts = { ...DEFAULT_EXPORT_OPTIONS, ...options };
  const lines: string[] = [];

  // Add header if requested
  if (opts.includeHeader && title) {
    lines.push(`# ${title}`);
    lines.push('');
  }

  // Export tree(s)
  if (Array.isArray(tree)) {
    tree.forEach(node => {
      exportNode(node, 0, lines, opts);
    });
  } else {
    exportNode(tree, 0, lines, opts);
  }

  return lines.join('\n');
}

/**
 * Recursively exports a tree node to markdown lines.
 *
 * @param node - Tree node to export
 * @param depth - Current depth in tree
 * @param lines - Array to accumulate output lines
 * @param options - Export options
 */
function exportNode(
  node: TreeNode,
  depth: number,
  lines: string[],
  options: MarkdownExportOptions
): void {
  // Check max depth
  if (options.maxDepth !== undefined && depth > options.maxDepth) {
    return;
  }

  // Create indentation
  const indent = options.indent!.repeat(depth);

  // Format note name
  let noteName: string;
  if (options.useWikiLinks) {
    noteName = `[[${node.file.basename}]]`;
  } else {
    noteName = node.file.basename;
  }

  // Add cycle indicator if needed
  if (options.showCycles && node.isCycle) {
    noteName += ' 🔄';
  }

  // Add list item
  lines.push(`${indent}- ${noteName}`);

  // Recursively export children
  for (const child of node.children) {
    exportNode(child, depth + 1, lines, options);
  }
}

/**
 * Exports a flat list of notes to markdown.
 *
 * @param notes - Array of notes to export
 * @param title - Optional title
 * @param options - Export options
 * @returns Markdown string
 *
 * @example
 * const notes = [noteA, noteB, noteC];
 * const markdown = exportNotesToMarkdown(notes, "Root Notes");
 * // Returns:
 * // # Root Notes
 * //
 * // - [[Note A]]
 * // - [[Note B]]
 * // - [[Note C]]
 */
export function exportNotesToMarkdown(
  notes: TFile[],
  title?: string,
  options: MarkdownExportOptions = {}
): string {
  const opts = { ...DEFAULT_EXPORT_OPTIONS, ...options };
  const lines: string[] = [];

  // Add header if requested
  if (opts.includeHeader && title) {
    lines.push(`# ${title}`);
    lines.push('');
  }

  // Export each note as list item
  for (const note of notes) {
    const noteName = opts.useWikiLinks
      ? `[[${note.basename}]]`
      : note.basename;
    lines.push(`- ${noteName}`);
  }

  return lines.join('\n');
}

/**
 * Exports a path to markdown.
 *
 * @param path - Array of files representing a path
 * @param options - Export options
 * @returns Markdown string (path with arrows)
 *
 * @example
 * const path = [noteA, noteB, noteC];
 * const markdown = exportPathToMarkdown(path);
 * // Returns: "[[Note A]] → [[Note B]] → [[Note C]]"
 */
export function exportPathToMarkdown(
  path: TFile[],
  options: MarkdownExportOptions = {}
): string {
  const opts = { ...DEFAULT_EXPORT_OPTIONS, ...options };

  const noteNames = path.map(file =>
    opts.useWikiLinks ? `[[${file.basename}]]` : file.basename
  );

  return noteNames.join(' → ');
}
