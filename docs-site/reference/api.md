---
title: API Reference
description: Comprehensive API reference for Relation Explorer plugin developers
---

# API Reference

This reference documents the complete public API for the Relation Explorer plugin, enabling developers to programmatically access and manipulate relationship graphs in Obsidian vaults.

## Overview

The Relations Obsidian Plugin exposes a comprehensive TypeScript API for querying relationship graphs. All methods are type-safe and provide detailed metadata for building custom integrations, commands, and workflows.

## Getting Started

### Accessing the Plugin

```typescript
// Get the plugin instance
const plugin = this.app.plugins.getPlugin('relations-obsidian');

// Get the current active file
const currentFile = this.app.workspace.getActiveFile();

// Now you can use any API method
const ancestors = plugin.getAncestors(currentFile);
```

### Type Safety

All API methods are fully typed. Import types as needed:

```typescript
import {
  AncestorQueryResult,
  DescendantQueryResult,
  RelationshipQueryOptions
} from 'obsidian-relations-plugin';
```

## Multi-Field API

The plugin supports multiple parent fields simultaneously. You can access field-specific graphs and engines for advanced querying.

### Field-Specific Access Methods

The plugin provides two types of field-specific access:

#### `getGraphForField(fieldName)` - Basic Graph Operations
Returns a `RelationGraph` instance for low-level graph operations:

```typescript
// Get graph for a specific parent field
const projectGraph = plugin.getGraphForField('project');
const categoryGraph = plugin.getGraphForField('category');

// Basic operations
const projectParents = projectGraph.getParents(currentFile);
const categoryChildren = categoryGraph.getChildren(currentFile);
const hasCycle = projectGraph.detectCycle(currentFile);
```

**Available methods on RelationGraph:**
- `getParents(file)` - Get immediate parents
- `getChildren(file)` - Get immediate children
- `detectCycle(file)` - Check for cycles involving this file
- `hasCycles()` - Check if graph contains any cycles
- `getAllFiles()` - Get all files in the graph

#### `getEngineForField(fieldName)` - Advanced Query Operations
Returns a `RelationshipEngine` instance for complex relationship queries:

```typescript
// Get engine for a specific parent field
const projectEngine = plugin.getEngineForField('project');
const categoryEngine = plugin.getEngineForField('category');

// Advanced queries
const projectAncestors = projectEngine.getAncestors(currentFile);
const categoryDescendants = categoryEngine.getDescendants(currentFile);
const topicSiblings = topicEngine.getSiblings(currentFile);
```

**Available methods on RelationshipEngine:**
- `getAncestors(file, maxDepth?)` - Get ancestors by generation
- `getDescendants(file, maxDepth?)` - Get descendants by generation
- `getSiblings(file, includeSelf?)` - Get sibling files
- `getCousins(file, degree?)` - Get cousin files

### Default Field Methods

For backward compatibility, methods without field specification use the configured default parent field:

```typescript
// These use the default parent field
const ancestors = plugin.getAncestors(currentFile);
const descendants = plugin.getDescendants(currentFile);
const siblings = plugin.getSiblings(currentFile);
```

### Complete Field-Specific Example

```typescript
// Access both graph and engine for comprehensive operations
const projectGraph = plugin.getGraphForField('project');
const projectEngine = plugin.getEngineForField('project');

// Basic operations with graph
const parents = projectGraph.getParents(currentFile);
const hasCycle = projectGraph.detectCycle(currentFile);

// Advanced queries with engine
const ancestors = projectEngine.getAncestors(currentFile);
const descendants = projectEngine.getDescendants(currentFile);
const siblings = projectEngine.getSiblings(currentFile);
```

## Ancestor Queries

Methods for querying ancestors (parents, grandparents, etc.).

### `getAncestors(file, options?)`

Gets ancestors with detailed metadata, organized by generation.

**Parameters:**
- `file: TFile` - The file to query
- `options?: RelationshipQueryOptions` - Optional query options

**Returns:** `AncestorQueryResult`

**Example:**
```typescript
const result = plugin.getAncestors(currentFile);

console.log(`Found ${result.totalCount} ancestors in ${result.depth} generations`);

result.generations.forEach((generation, index) => {
  console.log(`Generation ${index + 1}:`, generation.map(f => f.basename));
});

if (result.wasTruncated) {
  console.log('More ancestors exist beyond max depth');
}
```

### `getParents(file)`

Gets immediate parents only.

**Parameters:**
- `file: TFile` - The file to query

**Returns:** `TFile[]` - Array of parent files

**Example:**
```typescript
const parents = plugin.getParents(currentFile);
console.log('Parents:', parents.map(f => f.basename));
```

### `getAllAncestors(file, options?)`

Gets all ancestors as a flat array.

**Parameters:**
- `file: TFile` - The file to query
- `options?: RelationshipQueryOptions` - Optional query options

**Returns:** `TFile[]` - Flat array of all ancestor files

## Descendant Queries

Methods for querying descendants (children, grandchildren, etc.).

### `getDescendants(file, options?)`

Gets descendants with detailed metadata, organized by generation.

**Parameters:**
- `file: TFile` - The file to query
- `options?: RelationshipQueryOptions` - Optional query options

**Returns:** `DescendantQueryResult`

**Example:**
```typescript
const result = plugin.getDescendants(currentFile);

console.log(`Found ${result.totalCount} descendants in ${result.depth} generations`);

result.generations.forEach((generation, index) => {
  console.log(`Generation ${index + 1}:`, generation.map(f => f.basename));
});
```

### `getChildren(file)`

Gets immediate children only.

**Parameters:**
- `file: TFile` - The file to query

**Returns:** `TFile[]` - Array of child files

### `getAllDescendants(file, options?)`

Gets all descendants as a flat array.

**Parameters:**
- `file: TFile` - The file to query
- `options?: RelationshipQueryOptions` - Optional query options

**Returns:** `TFile[]` - Flat array of all descendant files

## Sibling Queries

Methods for querying siblings (notes sharing the same parent).

### `getSiblings(file, options?)`

Gets siblings with detailed metadata.

**Parameters:**
- `file: TFile` - The file to query
- `options?: RelationshipQueryOptions` - Optional query options

**Returns:** `SiblingQueryResult`

**Example:**
```typescript
const result = plugin.getSiblings(currentFile);
console.log(`Found ${result.totalCount} siblings`);

result.siblings.forEach(sibling => {
  console.log('- ' + sibling.basename);
});
```

## Cousin Queries

Methods for querying cousins (notes at the same hierarchical level in different branches).

### `getCousins(file, options?)`

Gets cousins with detailed metadata.

**Parameters:**
- `file: TFile` - The file to query
- `options?: RelationshipQueryOptions` - Optional query options (includes `degree`)

**Returns:** `CousinQueryResult`

**Example:**
```typescript
// Get first cousins (degree 1)
const firstCousins = plugin.getCousins(currentFile, { degree: 1 });
console.log(`Found ${firstCousins.totalCount} first cousins`);

// Get second cousins (degree 2)
const secondCousins = plugin.getCousins(currentFile, { degree: 2 });
console.log(`Found ${secondCousins.totalCount} second cousins`);
```

## Combined Queries

Methods for querying multiple relationship types simultaneously.

### `getFullLineage(file, options?)`

Gets complete lineage (ancestors + descendants + siblings).

**Parameters:**
- `file: TFile` - The file to query
- `options?: RelationshipQueryOptions` - Optional query options

**Returns:** `FullLineageResult`

**Example:**
```typescript
const lineage = plugin.getFullLineage(currentFile);

console.log('=== Full Lineage ===');
console.log(`Ancestors: ${lineage.stats.totalAncestors} (${lineage.stats.ancestorDepth} generations)`);
console.log(`Descendants: ${lineage.stats.totalDescendants} (${lineage.stats.descendantDepth} generations)`);
console.log(`Siblings: ${lineage.stats.totalSiblings}`);
```

## Cycle Detection

Methods for detecting circular relationships.

### `detectCycle(file)`

Checks if a file is part of a cycle.

**Parameters:**
- `file: TFile` - The file to check

**Returns:** `CycleInfo | null` - Cycle information if cycle exists, null otherwise

**Example:**
```typescript
const cycleInfo = plugin.detectCycle(currentFile);

if (cycleInfo) {
  console.warn('⚠️ Cycle detected!');
  console.warn('Cycle path:', cycleInfo.cyclePath.map(f => f.basename).join(' → '));
  console.warn('Description:', cycleInfo.description);
} else {
  console.log('✅ No cycles detected');
}
```

### `hasCycles()`

Checks if the graph contains any cycles.

**Returns:** `boolean` - True if any cycle exists

## Type Definitions

### Core Result Types

#### `AncestorQueryResult`
```typescript
interface AncestorQueryResult {
  file: TFile;              // The queried file
  generations: TFile[][];   // Ancestors by generation
  totalCount: number;       // Total number of ancestors
  depth: number;            // Number of generations
  wasTruncated: boolean;    // Whether limited by maxDepth
}
```

#### `DescendantQueryResult`
```typescript
interface DescendantQueryResult {
  file: TFile;              // The queried file
  generations: TFile[][];   // Descendants by generation
  totalCount: number;       // Total number of descendants
  depth: number;            // Number of generations
  wasTruncated: boolean;    // Whether limited by maxDepth
}
```

#### `SiblingQueryResult`
```typescript
interface SiblingQueryResult {
  file: TFile;              // The queried file
  siblings: TFile[];        // Sibling files
  totalCount: number;       // Total number of siblings
  includesSelf: boolean;    // Whether self was included
}
```

#### `CousinQueryResult`
```typescript
interface CousinQueryResult {
  file: TFile;              // The queried file
  cousins: TFile[];         // Cousin files
  totalCount: number;       // Total number of cousins
  degree: number;           // Degree of cousinship
}
```

#### `FullLineageResult`
```typescript
interface FullLineageResult {
  file: TFile;              // The queried file
  ancestors: TFile[][];     // Ancestors by generation
  descendants: TFile[][];   // Descendants by generation
  siblings: TFile[];        // Sibling files
  stats: {
    totalAncestors: number;
    totalDescendants: number;
    totalSiblings: number;
    ancestorDepth: number;
    descendantDepth: number;
  };
}
```

### Option Types

#### `RelationshipQueryOptions`
```typescript
interface RelationshipQueryOptions {
  maxDepth?: number;        // Maximum depth to traverse
  includeSelf?: boolean;    // Include queried file in results
  degree?: number;          // Cousin degree (1 = first, 2 = second, etc.)
  detectCycles?: boolean;   // Include cycle information
}
```

#### `CycleInfo`
```typescript
interface CycleInfo {
  cyclePath: TFile[];       // Files in the cycle
  description: string;      // Human-readable description
  length: number;           // Number of unique nodes in cycle
}
```

## Usage Examples

### Building a Family Tree Display

```typescript
function displayFamilyTree(file: TFile) {
  const plugin = this.app.plugins.getPlugin('relations-obsidian');
  const lineage = plugin.getFullLineage(file);

  const lines: string[] = [];

  // Ancestors (top of tree)
  for (let i = lineage.ancestors.length - 1; i >= 0; i--) {
    const gen = lineage.ancestors[i];
    const indent = '  '.repeat(lineage.ancestors.length - i - 1);
    lines.push(`${indent}Gen -${i + 1}: ${gen.map(f => f.basename).join(', ')}`);
  }

  // Current file
  lines.push(`>>> ${file.basename} <<<`);

  // Siblings
  if (lineage.siblings.length > 0) {
    lines.push(`  Siblings: ${lineage.siblings.map(f => f.basename).join(', ')}`);
  }

  // Descendants
  lineage.descendants.forEach((gen, i) => {
    const indent = '  '.repeat(i + 1);
    lines.push(`${indent}Gen +${i + 1}: ${gen.map(f => f.basename).join(', ')}`);
  });

  return lines.join('\n');
}
```

### Finding Related Notes

```typescript
function findRelatedNotes(file: TFile) {
  const plugin = this.app.plugins.getPlugin('relations-obsidian');

  // Get all directly related notes
  const parents = plugin.getParents(file);
  const children = plugin.getChildren(file);
  const siblings = plugin.getSiblings(file).siblings;

  // Combine into single list
  const related = new Set<TFile>();
  parents.forEach(f => related.add(f));
  children.forEach(f => related.add(f));
  siblings.forEach(f => related.add(f));

  return Array.from(related);
}
```

### Analyzing Vault Structure

```typescript
function analyzeVaultStructure() {
  const plugin = this.app.plugins.getPlugin('relations-obsidian');
  const files = this.app.vault.getMarkdownFiles();

  let totalAncestors = 0;
  let totalDescendants = 0;
  let filesWithCycles = 0;

  files.forEach(file => {
    const ancestors = plugin.getAncestors(file);
    const descendants = plugin.getDescendants(file);

    totalAncestors += ancestors.totalCount;
    totalDescendants += descendants.totalCount;

    if (plugin.detectCycle(file)) {
      filesWithCycles++;
    }
  });

  console.log('=== Vault Structure Analysis ===');
  console.log(`Total files: ${files.length}`);
  console.log(`Average ancestors per file: ${(totalAncestors / files.length).toFixed(2)}`);
  console.log(`Average descendants per file: ${(totalDescendants / files.length).toFixed(2)}`);
  console.log(`Files in cycles: ${filesWithCycles}`);
}
```

## Error Handling

All API methods handle errors gracefully:

- **Missing files:** Return empty arrays/results
- **Invalid options:** Use default values
- **Cycles:** Detected and handled without infinite loops
- **Null files:** Check for null/undefined and return safe defaults

```typescript
const file = this.app.workspace.getActiveFile();

if (!file) {
  console.warn('No active file');
  return;
}

const result = plugin.getAncestors(file);

if (result.totalCount === 0) {
  console.log('No ancestors found');
} else {
  // Process ancestors
}
```

## Best Practices

1. **Always check for null files** before querying
2. **Use options to limit depth** for large graphs
3. **Cache results** if querying the same file repeatedly
4. **Check for cycles** before deep traversals
5. **Use appropriate query method** for your use case:
   - Simple arrays: `getParents()`, `getChildren()`
   - Detailed metadata: `getAncestors()`, `getDescendants()`
   - Combined data: `getFullLineage()`

## Performance Considerations

- **Immediate relations** (parents, children): O(1) - Very fast
- **Traversals** (ancestors, descendants): O(V + E) - Bounded by depth
- **Siblings**: O(P * C) - Fast for typical graphs
- **Cousins**: O(V + E) - May be slower for deep graphs
- **Full lineage**: 3x traversal cost - Use sparingly

**Tips:**
- Limit `maxDepth` for better performance
- Cache results when querying same file multiple times
- Use simple methods (`getParents`) when metadata not needed

## Need Help?

- Check the [Getting Started](../getting-started.md) guide for installation
- Visit the [Configuration](../guide/configuration.md) page for settings
- Report issues on [GitHub](https://github.com/bright-fakl/relations-obsidian/issues)