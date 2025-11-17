import { Notice, TFile } from 'obsidian';
import type ParentRelationPlugin from '../main';
import { findRootNotes, findLeafNotes, computeGraphStatistics } from '../utils/graph-analyzer';
import { showResults } from '../modals/results-modal';

/**
 * Registers graph analysis commands.
 *
 * These commands analyze the relationship graph structure,
 * finding special nodes like roots and leaves.
 */
export function registerGraphAnalysisCommands(
	plugin: ParentRelationPlugin
): void {
	const { app } = plugin;

	// Command: Show all root notes
	plugin.addCommand({
		id: 'show-root-notes',
		name: 'Show all root notes',
		callback: () => {
			showRootNotes(plugin);
		}
	});

	// Command: Show all leaf notes
	plugin.addCommand({
		id: 'show-leaf-notes',
		name: 'Show all leaf notes',
		callback: () => {
			showLeafNotes(plugin);
		}
	});

	// Command: Show graph statistics
	plugin.addCommand({
		id: 'show-graph-statistics',
		name: 'Show graph statistics',
		callback: () => {
			showGraphStatistics(plugin);
		}
	});
}

/**
 * Shows all root notes in a modal.
 *
 * Root notes are notes with no parents in the relationship graph.
 *
 * @param plugin - Plugin instance
 */
function showRootNotes(plugin: ParentRelationPlugin): void {
	const fieldName = plugin.settings.defaultParentField;
	const graph = plugin.getGraphForField(fieldName);

	if (!graph) {
		new Notice(`Parent field "${fieldName}" not found`);
		return;
	}

	const roots = findRootNotes(graph);

	if (roots.length === 0) {
		new Notice('No root notes found (all notes have parents)');
		return;
	}

	showResults(
		plugin.app,
		roots,
		`Root Notes (${roots.length})`,
		(note) => {
			// Open note when selected
			plugin.app.workspace.getLeaf().openFile(note);
		}
	);
}

/**
 * Shows all leaf notes in a modal.
 *
 * Leaf notes are notes with no children in the relationship graph.
 *
 * @param plugin - Plugin instance
 */
function showLeafNotes(plugin: ParentRelationPlugin): void {
	const fieldName = plugin.settings.defaultParentField;
	const graph = plugin.getGraphForField(fieldName);

	if (!graph) {
		new Notice(`Parent field "${fieldName}" not found`);
		return;
	}

	const leaves = findLeafNotes(graph);

	if (leaves.length === 0) {
		new Notice('No leaf notes found (all notes have children)');
		return;
	}

	showResults(
		plugin.app,
		leaves,
		`Leaf Notes (${leaves.length})`,
		(note) => {
			// Open note when selected
			plugin.app.workspace.getLeaf().openFile(note);
		}
	);
}

/**
 * Shows graph statistics in a notice and console.
 *
 * Computes and displays various metrics about the relationship graph.
 *
 * @param plugin - Plugin instance
 */
function showGraphStatistics(plugin: ParentRelationPlugin): void {
	const fieldName = plugin.settings.defaultParentField;
	const graph = plugin.getGraphForField(fieldName);

	if (!graph) {
		new Notice(`Parent field "${fieldName}" not found`);
		return;
	}

	const stats = computeGraphStatistics(graph);

	// Log to console
	console.log('=== Graph Statistics ===');
	console.log(`Field: ${fieldName}`);
	console.log(`Total nodes: ${stats.totalNodes}`);
	console.log(`Total edges: ${stats.totalEdges}`);
	console.log(`Root notes: ${stats.rootCount}`);
	console.log(`Leaf notes: ${stats.leafCount}`);
	console.log(`Max depth: ${stats.maxDepth}`);
	console.log(`Max breadth: ${stats.maxBreadth}`);
	console.log(`Cycles: ${stats.cycleCount}`);
	console.log(`Average children: ${stats.averageChildren.toFixed(2)}`);

	// Show summary notice
	const message = [
		`Graph Statistics (${fieldName}):`,
		`Nodes: ${stats.totalNodes}, Edges: ${stats.totalEdges}`,
		`Roots: ${stats.rootCount}, Leaves: ${stats.leafCount}`,
		`Max Depth: ${stats.maxDepth}, Max Breadth: ${stats.maxBreadth}`,
		`Cycles: ${stats.cycleCount}`
	].join('\n');

	new Notice(message, 8000); // Show for 8 seconds
}
