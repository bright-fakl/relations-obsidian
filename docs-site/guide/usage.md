---
title: Basic Usage
description: Learn the fundamentals of using Relation Explorer in your Obsidian vault
---

# Basic Usage Guide

This guide covers the fundamental concepts and workflows for using Relation Explorer in your Obsidian vault. After [installing](../getting-started.md) and [configuring](./configuration.md) the plugin, you'll learn how to create relationships, navigate your vault, and make the most of the sidebar interface.

## Setting Up Relationships

The foundation of Relation Explorer is defining parent-child relationships between your notes using frontmatter fields.

### Adding Parent Relationships

To establish a relationship, add a parent field to your note's frontmatter:

```yaml
---
parent: "[[Parent Note]]"
---

# Your note content here
```

### Multiple Parents

A note can have multiple parents:

```yaml
---
parent:
  - "[[Parent Note 1]]"
  - "[[Parent Note 2]]"
---
```

### Multiple Parent Fields

Track different types of relationships using different fields:

```yaml
---
parent: "[[General Parent]]"
project: "[[Project Alpha]]"
category: "[[Research]]"
---
```

## Understanding the Sidebar

The Relation Explorer sidebar is your primary interface for viewing and navigating relationships.

### Opening the Sidebar

- **Ribbon Icon**: Click the Relation Explorer icon in Obsidian's left ribbon
- **Command Palette**: Search for "Toggle relation sidebar"
- **Keyboard Shortcut**: Assign a custom shortcut in Settings → Hotkeys

### Sidebar Sections

The sidebar displays three main sections for the current note:

#### Ancestors (↑ Up)
Shows the parent chain leading to the current note:
```
Grandparent
└── Parent
    └── Current Note
```

#### Descendants (↓ Down)
Shows all notes that have the current note as a parent:
```
Current Note
├── Child 1
├── Child 2
│   └── Grandchild
└── Child 3
```

#### Siblings (→ Related)
Shows other notes that share the same parent(s):
```
Current Note
Sibling 1
Sibling 2
Sibling 3
```

### Section Controls

- **Expand/Collapse**: Click section headers to toggle visibility
- **Pin Button**: Keep the sidebar focused on a specific note while navigating
- **Field Selector**: Switch between different parent fields (if configured)

## Basic Navigation

### Using the Sidebar for Navigation

Click any note name in the sidebar to navigate to that note. The sidebar will automatically update to show relationships for the newly selected note.

### Quick Navigation Commands

Access these commands via the command palette (Ctrl/Cmd+P):

- **Go to parent note**: Navigate to the current note's parent
- **Go to child note**: Navigate to one of the current note's children
- **Show parent tree in sidebar**: Focus sidebar on ancestors only
- **Show child tree in sidebar**: Focus sidebar on descendants only
- **Show full lineage in sidebar**: Show all relationships
- **Toggle relation sidebar**: Show/hide the sidebar

### Keyboard Shortcuts

Set up keyboard shortcuts for faster navigation:

1. Go to **Settings** → **Hotkeys**
2. Search for "relation"
3. Click the **+** icon next to any command
4. Press your desired key combination

**Recommended shortcuts:**
- `Ctrl+Shift+P` - Go to parent note
- `Ctrl+Shift+C` - Go to child note
- `Ctrl+Shift+R` - Toggle relation sidebar

## Working with Multiple Parent Fields

If you've configured multiple parent fields, you can switch between them to view different relationship hierarchies.

### Field Selector

Use the dropdown or segmented control at the top of the sidebar to switch between parent fields. Each field maintains:

- Its own relationship graph
- Independent pinning state
- Separate configuration settings

### Field-Specific Commands

Advanced navigation commands are registered per field:

- Show siblings [Parent]
- Show siblings [Project]
- Find shortest path [Category]

## Creating and Modifying Relationships

### Using Frontmatter

The most direct way to create relationships is by editing frontmatter:

```yaml
---
parent: "[[New Parent Note]]"
---
```

### Using the Context Menu

Right-click any note in the sidebar to access relationship modification options:

- **Set as Parent**: Make the clicked note a parent of the current note
- **Set as Child**: Make the clicked note a child of the current note
- **Remove as Parent/Child**: Remove existing relationships

::: tip Context Menu Tips
- The context menu adapts based on the current section and existing relationships
- Confirmation dialogs prevent accidental changes
- All changes support undo (Ctrl/Cmd+Z)
:::

## Embedding Relationship Trees

Display relationship visualizations directly in your notes using codeblocks.

### Basic Codeblock

```markdown
```relation-tree
type: ancestors
```
```

### Common Parameters

```markdown
```relation-tree
type: descendants
depth: 3
field: project
```
```

**Available types:** `ancestors`, `descendants`, `siblings`, `cousins`

## Understanding Relationship Types

### Direct Relationships
- **Parent**: Immediate parent note
- **Child**: Immediate child note

### Extended Relationships
- **Ancestor**: Any note in the parent chain (grandparent, great-grandparent, etc.)
- **Descendant**: Any note in the child chain (grandchild, great-grandchild, etc.)
- **Sibling**: Notes sharing the same parent
- **Cousin**: Notes at the same hierarchical level in different branches

## Troubleshooting Common Issues

### Sidebar Not Showing Relationships

**Possible causes:**
- No parent field configured in settings
- Note doesn't have the configured field in frontmatter
- Field name mismatch between settings and frontmatter

**Solutions:**
- Check Settings → Relation Explorer for configured fields
- Verify frontmatter field names match exactly
- Ensure wiki-links are properly formatted: `[[Note Name]]`

### Navigation Commands Not Available

**Cause:** Commands only appear when relationships exist for the current note

**Check:**
- Does the current note have parents/children in the configured field?
- Is the correct parent field selected?

### Codeblock Not Rendering

**Common issues:**
- Invalid parameter syntax
- Note not found (check wiki-link formatting)
- Field not configured

**Debug:** Check the developer console for error messages

## Best Practices

### Consistent Field Names
Use consistent field names across your vault. Decide on your parent field names early and stick to them.

### Meaningful Relationships
Create relationships that reflect how you actually think about your notes. Don't force artificial hierarchies.

### Regular Review
Periodically review your relationship graphs using analysis commands to ensure they remain useful and accurate.

### Start Small
Begin with a few notes to understand how relationships work, then expand gradually.

## Next Steps

Now that you understand the basics:

- [Configure](./configuration.md) the plugin for your workflow
- Learn about [sidebar features](./sidebar.md) in detail
- Explore [navigation commands](./navigation.md) for advanced movement
- Try [embedding trees](./codeblocks.md) in your notes
- Discover the [context menu](./context-menu.md) for relationship editing

## Need Help?

- Check the [Getting Started](../getting-started.md) guide for installation
- Visit the [Support](../support.md) page for additional help
- Report issues on [GitHub](https://github.com/bright-fakl/relations-obsidian/issues)