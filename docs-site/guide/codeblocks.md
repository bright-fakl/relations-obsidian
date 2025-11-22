---
title: Embedding Trees
description: Learn how to embed relationship trees directly in your notes using codeblocks
---

# Embedding Relationship Trees

Relation Explorer allows you to embed interactive relationship trees directly in your notes using `relation-tree` codeblocks. This feature transforms static notes into dynamic relationship visualizations, perfect for documentation, project overviews, and knowledge sharing.

## Basic Usage

Create a codeblock with the `relation-tree` type to display relationships.

### Simple Ancestor Tree

````markdown
```relation-tree
type: ancestors
```
````

This displays the ancestor hierarchy for the current note.

### Simple Descendant Tree

````markdown
```relation-tree
type: descendants
```
````

This shows all notes that have the current note as a parent.

## Codeblock Parameters

Control tree display with YAML parameters within `relation-tree` codeblocks.

### Core Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `type` | string | `ancestors` | Relationship type: `ancestors`, `descendants`, `siblings`, `cousins` |
| `field` | string | default field | Parent field to use for relationships |
| `depth` | number | from settings | Maximum traversal depth |
| `note` | string | current note | Target note (wiki-link format) |

### Display Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `mode` | string | `tree` | Display mode: `tree`, `list`, `compact` |
| `style` | string | `detailed` | Visual style: `detailed`, `minimal`, `compact` |
| `collapsed` | boolean | `false` | Start with tree collapsed |
| `showCycles` | boolean | `true` | Show cycle indicators |

### Filtering Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `filterTag` | string | - | Filter by tag (e.g., `#project` or `project`) |
| `filterFolder` | string | - | Filter by folder path (e.g., `Projects/`) |
| `exclude` | string | - | Exclude notes (comma-separated wiki-links) |
| `maxNodes` | number | - | Maximum nodes to display |

### Title Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `title` | string | `none` | Title mode: `none`, `simple`, `detailed` |

## Relationship Types

Choose what type of relationships to display.

### Ancestors

Shows the hierarchical path upward from the target note.

````markdown
```relation-tree
type: ancestors
depth: 3
```
````

**Use cases:**
- Show project context or topic hierarchy
- Display organizational structure
- Illustrate knowledge dependencies

### Descendants

Shows all notes that descend from the target note.

````markdown
```relation-tree
type: descendants
depth: 2
```
````

**Use cases:**
- Show project breakdown or task hierarchy
- Display topic subcategories
- Illustrate implementation details

### Siblings

Shows notes that share the same parent(s) as the target note.

````markdown
```relation-tree
type: siblings
mode: list
```
````

**Use cases:**
- Show related work or parallel tasks
- Display similar topics or concepts
- Illustrate alternative approaches

### Cousins

Shows notes at the same hierarchical level in different branches.

````markdown
```relation-tree
type: cousins
depth: 1
```
````

**Use cases:**
- Show parallel projects or initiatives
- Display related research areas
- Illustrate alternative implementations

## Specifying Target Notes

Display relationships for notes other than the current one.

### Using Wiki-Links

````markdown
```relation-tree
note: [[Project Alpha]]
type: descendants
```
````

### Using Different Fields

````markdown
```relation-tree
note: [[Research Paper]]
field: topic
type: ancestors
```
````

**Use cases:**
- Create project overview pages
- Document research relationships
- Build knowledge maps

## Visual Customization

Control how your trees look and behave.

### Display Modes

#### Tree Mode (Default)

Hierarchical display with expand/collapse controls.

````markdown
```relation-tree
type: descendants
mode: tree
```
````

**Features:**
- Interactive expansion/collapse
- Proper indentation
- Clickable navigation

#### List Mode

Flat list display for siblings and cousins.

````markdown
```relation-tree
type: siblings
mode: list
```
````

**Features:**
- Compact display
- Easy scanning
- No hierarchy complexity

#### Compact Mode

Space-efficient tree display.

````markdown
```relation-tree
type: descendants
mode: compact
```
````

**Features:**
- Reduced padding
- Dense information display
- Space-efficient

### Visual Styles

#### Detailed Style

Full visual hierarchy with generous spacing.

````markdown
```relation-tree
type: ancestors
style: detailed
```
````

#### Minimal Style

Ultra-compact with minimal spacing.

````markdown
```relation-tree
type: ancestors
style: minimal
```
````

#### Compact Style

Balanced approach between detailed and minimal.

````markdown
```relation-tree
type: ancestors
style: compact
```
````

## Title Modes

Control title display above your relationship trees.

### No Title (Default)

Tree starts immediately without header.

````markdown
```relation-tree
type: ancestors
title: none
```
````

### Simple Title

Shows basic descriptive title.

````markdown
```relation-tree
type: descendants
title: simple
```
````

**Example:** "Descendants of Project Alpha"

### Detailed Title

Shows title with filter information.

````markdown
```relation-tree
type: descendants
filterTag: #active
title: detailed
```
````

**Example:**
```
Descendants of Project Alpha
tag: #active, folder: Projects/
```

## Advanced Filtering

Refine what appears in your relationship trees.

### Tag Filtering

Show only notes with specific tags.

````markdown
```relation-tree
type: descendants
filterTag: #project
```
````

**Features:**
- Supports nested tags (`#project` matches `#project/active`)
- Case-insensitive matching
- Checks both frontmatter and inline tags

### Folder Filtering

Show only notes in specific folders.

````markdown
```relation-tree
type: ancestors
filterFolder: Research/
```
````

**Features:**
- Includes subfolders automatically
- Path can omit trailing slash
- Matches partial paths

### Exclusion Filtering

Hide specific notes from results.

````markdown
```relation-tree
type: siblings
exclude: [[Template]], [[Archive]]
```
````

**Features:**
- Comma-separated wiki-links
- Silently ignores non-existent notes
- Useful for hiding utility notes

### Combined Filtering

Use multiple filters together with AND logic.

````markdown
```relation-tree
type: descendants
filterTag: #active
filterFolder: Projects/
exclude: [[Old Project]]
title: detailed
```
````

**Result:** Shows only active project notes, excluding the old project.

## Node Limiting

Control tree size for better performance and readability.

### Max Nodes Parameter

````markdown
```relation-tree
type: descendants
depth: 10
maxNodes: 20
```
````

**Behavior:**
- Limits total displayed nodes
- Shows truncation indicator: "(+N more...)"
- Preserves tree structure up to limit

**Use cases:**
- Large project hierarchies
- Overview displays
- Performance optimization

## Interactive Features

Embedded trees include interactive navigation.

### Tree Navigation

- **Click notes** to navigate to them
- **Expand/collapse** subtrees with ▶/▼ icons
- **Hover** for full path information

### Cycle Indicators

When cycles are detected, they're marked with 🔄.

````markdown
```relation-tree
type: ancestors
showCycles: true
```
````

**Features:**
- Visual cycle detection
- Prevents infinite loops
- Maintains graph integrity

## Practical Examples

### Project Documentation

````markdown
# Project Alpha Overview

## Project Hierarchy
```relation-tree
note: [[Project Alpha]]
type: descendants
depth: 3
title: simple
```

## Active Tasks
```relation-tree
note: [[Project Alpha]]
type: descendants
filterTag: #active
title: detailed
```
````

### Research Paper Organization

````markdown
# Research Topic: Machine Learning

## Topic Hierarchy
```relation-tree
note: [[Machine Learning]]
field: topic
type: ancestors
title: simple
```

## Related Papers
```relation-tree
note: [[Machine Learning]]
field: topic
type: cousins
mode: list
title: simple
```
````

### Personal Knowledge Management

````markdown
# Current Project Status

## Project Context
```relation-tree
type: ancestors
field: project
depth: 2
style: compact
```

## Related Tasks
```relation-tree
type: siblings
field: project
mode: list
sortOrder: modified
```
````

## Error Handling

Codeblocks provide helpful error messages for common issues.

### Common Errors

**"Note not found"**
```
Error: Note not found
Note: [[NonExistent Note]]
```
**Solution:** Check wiki-link spelling and note existence

**"Invalid field"**
```
Error: Invalid field
Field: nonexistent
```
**Solution:** Verify field is configured in settings

**"Invalid parameter format"**
```
Error: Invalid parameter format
Parameter: depth
Value: "invalid"
```
**Solution:** Check parameter syntax and types

### Debugging Tips

1. **Check console** for detailed error information
2. **Verify wiki-links** are properly formatted
3. **Confirm fields** are configured in settings
4. **Test parameters** individually when troubleshooting

## Performance Considerations

### Large Trees

- Use `maxNodes` to limit display size
- Set appropriate `depth` limits
- Consider `compact` or `minimal` styles

### Complex Filtering

- Combine filters strategically
- Use exclusion for known irrelevant notes
- Test with small datasets first

### Multiple Codeblocks

- Each codeblock processes independently
- Consider page load impact
- Use collapsed trees for initial load

## Integration Patterns

### Documentation Pages

Use codeblocks to create living documentation:

````markdown
# API Reference

## Class Hierarchy
```relation-tree
note: [[BaseClass]]
type: descendants
field: inheritance
title: simple
```

## Related Modules
```relation-tree
note: [[BaseClass]]
type: cousins
field: module
mode: list
```
````

### Project Dashboards

Create dynamic project overviews:

````markdown
# Project Dashboard

## Current Sprint
```relation-tree
note: [[Sprint 5]]
type: descendants
filterTag: #sprint
title: detailed
```

## Project Roadmap
```relation-tree
note: [[Project X]]
type: descendants
field: project
depth: 4
collapsed: true
```
````

### Knowledge Maps

Build interactive knowledge visualizations:

````markdown
# Knowledge Map: Artificial Intelligence

## Core Concepts
```relation-tree
note: [[AI]]
field: topic
type: descendants
depth: 2
style: detailed
```

## Related Fields
```relation-tree
note: [[AI]]
field: topic
type: cousins
mode: compact
```
````

## Best Practices

### Content Organization

1. **Use descriptive titles** for clarity
2. **Combine related trees** on single pages
3. **Link to source notes** for detailed information

### Performance Optimization

1. **Set reasonable depth limits** (3-5 levels typically)
2. **Use filtering** to reduce noise
3. **Consider collapsed state** for large trees

### User Experience

1. **Start with simple examples** when learning
2. **Use consistent styling** across similar pages
3. **Test navigation flow** between linked notes

## Next Steps

Now that you can embed relationship trees:

- Learn about [navigation commands](./navigation.md) for quick movement
- Explore [context menu features](./context-menu.md) for editing relationships
- Customize display in [Configuration](./configuration.md)
- Check the [Basic Usage](./usage.md) guide for fundamentals

Embedded trees transform your notes from static documents into interactive relationship maps, making your knowledge more discoverable and your work more connected.

## Need Help?

- Check the [Basic Usage](./usage.md) guide for fundamentals
- Visit the [Configuration](./configuration.md) page for settings
- Report issues on [GitHub](https://github.com/bright-fakl/relations-obsidian/issues)