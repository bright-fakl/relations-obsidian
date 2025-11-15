# Relation Explorer

An Obsidian plugin for visualizing parent-child relationships between notes based on user-defined frontmatter fields.

## Features

- **Flexible Relationship Tracking**: Define custom frontmatter fields to establish parent-child relationships between notes
- **Automatic Graph Building**: Automatically builds and maintains a relationship graph as you create and modify notes
- **Cycle Detection**: Detects and reports circular relationships to prevent infinite traversals
- **Configurable Settings**: Customize the parent field name and maximum traversal depth

## Installation

### Manual Installation

1. Download the latest release
2. Extract the files to your Obsidian vault's plugins folder: `<vault>/.obsidian/plugins/relations-obsidian/`
3. Reload Obsidian
4. Enable the plugin in Settings → Community Plugins

## Usage

### Setting Up Relationships

Add a frontmatter field to your notes to define parent relationships:

```yaml
---
parent: "[[Parent Note]]"
---
```

You can also specify multiple parents:

```yaml
---
parent:
  - "[[Parent Note 1]]"
  - "[[Parent Note 2]]"
---
```

### Configuration

Access plugin settings via Settings → Relation Explorer:

- **Parent Field**: The frontmatter field name used to identify parent links (default: `parent`)
- **Max Depth**: Maximum depth for relationship tree traversal (default: `5`)

## How It Works

The plugin:
1. Scans all markdown files in your vault
2. Extracts parent relationships from the configured frontmatter field
3. Builds a bidirectional graph of parent-child relationships
4. Detects cycles in the relationship graph
5. Automatically updates the graph when notes are modified or renamed

### Cycle Detection

The plugin includes built-in cycle detection to identify circular parent-child relationships. Cycles occur when a note is its own ancestor through a chain of parent relationships (e.g., Note A → Note B → Note C → Note A).

**API Methods:**

```typescript
// Check if a specific file has a cycle
const cycleInfo = plugin.relationGraph.detectCycle(file);
if (cycleInfo) {
  console.log(cycleInfo.description); // e.g., "Cycle detected: A → B → C → A"
  console.log(cycleInfo.cyclePath);   // Array of files in the cycle
  console.log(cycleInfo.length);      // Number of unique nodes in cycle
}

// Check if the entire graph has any cycles
if (plugin.relationGraph.hasCycles()) {
  console.log('Warning: Graph contains cycles');
}
```

The cycle detector uses a three-color depth-first search algorithm to efficiently detect cycles while preserving the user-defined graph structure.

## Development

### Building the Plugin

```bash
# Install dependencies
npm install

# Build once
npm run build

# Build and watch for changes
npm run dev
```

### Project Structure

- `src/main.ts` - Main plugin entry point and settings
- `src/relation-graph.ts` - Core relationship graph logic
- `src/cycle-detector.ts` - Cycle detection implementation
- `tests/` - Test suite (Vitest)
- `docs/` - Implementation plans and documentation
- `manifest.json` - Plugin manifest
- `rollup.config.mjs` - Build configuration

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui
```

## License

MIT License - see [LICENSE](LICENSE) file for details

## Author

Fabian Kloosterman
- GitHub: [@fkloosterman](https://github.com/fkloosterman)

## Support

If you encounter any issues or have feature requests, please open an issue on the [GitHub repository](https://github.com/fkloosterman/relations-obsidian).