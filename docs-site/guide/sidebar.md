---
title: Using the Sidebar
description: Master the Relation Explorer sidebar for visualizing and navigating note relationships
---

# Using the Sidebar

The Relation Explorer sidebar is your primary interface for viewing, navigating, and understanding note relationships. This guide covers all sidebar features and functionality in detail.

## Opening the Sidebar

### Methods to Open

**Ribbon Icon:**
- Look for the Relation Explorer icon in Obsidian's left ribbon
- Click to toggle the sidebar open/closed

**Command Palette:**
- Press `Ctrl/Cmd+P` to open command palette
- Search for "Toggle relation sidebar"
- Select the command to toggle visibility

**Keyboard Shortcuts:**
- Assign a custom shortcut in Settings → Hotkeys
- Search for "relation" to find the toggle command
- Recommended: `Ctrl+Shift+R`

### Sidebar Layout

The sidebar consists of several key components:

```
┌─────────────────────────────────────┐
│ Field Selector ▼                    │
├─────────────────────────────────────┤
│ 📌 Pin Button                       │
├─────────────────────────────────────┤
│ ▼ Ancestors (↑ Up)                  │
│   ├── Grandparent                    │
│   └── Parent                         │
│       └── Current Note               │
├─────────────────────────────────────┤
│ ▼ Descendants (↓ Down)               │
│   ├── Child 1                        │
│   ├── Child 2                        │
│   │   └── Grandchild                 │
│   └── Child 3                        │
├─────────────────────────────────────┤
│ ▼ Siblings (→ Related)               │
│   ├── Sibling 1                      │
│   ├── Sibling 2                      │
│   └── Sibling 3                      │
└─────────────────────────────────────┘
```

## Field Selector

When you have multiple parent fields configured, the field selector appears at the top of the sidebar.

### Switching Between Fields

- Click the dropdown or use segmented controls
- Each field shows relationships for that specific hierarchy
- Field selection is remembered per note when pinned

### Field-Specific Behavior

Each parent field maintains:
- **Independent relationships**: Different hierarchies for different fields
- **Separate pinning**: Pin state is per-field
- **Custom configuration**: Display names, visibility, depth settings
- **Unique graphs**: Relationships are tracked separately

### Example Usage

If you have `parent`, `project`, and `category` fields:

- **Parent field**: Shows general note hierarchies
- **Project field**: Shows project-specific relationships
- **Category field**: Shows categorization relationships

Switch between them to view different relationship contexts for the same note.

## Pinning Functionality

The pin button (📌) controls whether the sidebar stays focused on a specific note or follows your cursor.

### Pin States

**Unpinned (Default):**
- Sidebar updates automatically when you switch notes
- Shows relationships for the currently active note
- Dynamic navigation as you browse

**Pinned:**
- Sidebar stays focused on the pinned note
- Useful for reference while working on other notes
- Maintains context across navigation

### Per-Field Pinning

- Pinning state is independent for each parent field
- Pin one field while keeping others unpinned
- Switch fields without losing pin state

### Practical Uses

**Keep reference visible:**
- Pin a project overview while working on tasks
- Keep methodology notes visible while writing
- Reference parent concepts while editing children

**Multi-tasking:**
- Pin different fields for different contexts
- Maintain multiple reference points simultaneously

## Section Management

The sidebar displays relationships in three main sections, each configurable and independently controllable.

### Section Controls

**Expand/Collapse:**
- Click section headers to toggle visibility
- Double-click for quick collapse/expand
- State persists during your session

**Section Headers:**
- Show relationship counts when applicable
- Display configured custom names
- Indicate loading states

### Section Visibility

Each section can be shown/hidden per field in configuration:
- Go to Settings → Relation Explorer
- Select a parent field
- Toggle section visibility
- Changes apply immediately

## Ancestors Section (↑ Up)

Shows the hierarchical path from the current note up to root notes.

### Visual Structure

```
Ancestors
├── Root Note
│   └── Intermediate Note
│       └── Parent Note
│           └── Current Note
```

### Navigation

- Click any ancestor to navigate to that note
- Sidebar updates to show relationships for the selected note
- Maintains hierarchical context

### Configuration Options

**Display Name:** Customize the section header (default: "Ancestors")

**Max Depth:** Limit how far up the hierarchy to show
- Prevents overwhelming displays in deep hierarchies
- Default: 5 levels

**Initial Unfold Depth:** How many levels to expand by default
- Balances overview vs detail
- Default: 2 levels

### Use Cases

**Understanding Context:**
- See how current note fits into larger structure
- Trace back to foundational concepts
- Identify root causes or sources

**Navigation Aid:**
- Quick access to parent documents
- Jump to higher-level overviews
- Find related foundational material

## Descendants Section (↓ Down)

Shows all notes that have the current note as an ancestor.

### Visual Structure

```
Descendants
├── Child Note 1
├── Child Note 2
│   ├── Grandchild 1
│   └── Grandchild 2
└── Child Note 3
```

### Tree Interaction

**Expand/Collapse Nodes:**
- Click ▶/▼ icons to expand subtrees
- Double-click note names for quick toggle
- Maintains user's exploration state

**Navigation:**
- Click any descendant to navigate
- Sidebar updates to show new relationships
- Preserves exploration context

### Configuration Options

**Display Name:** Customize section header (default: "Descendants")

**Max Depth:** Limit descendant traversal depth
- Manages performance in large hierarchies
- Default: 5 levels

**Initial Unfold Depth:** Starting expansion level
- Controls initial information density
- Default: 2 levels

### Use Cases

**Project Management:**
- See all tasks under a project
- Track work breakdown structure
- Identify completion status

**Knowledge Exploration:**
- Discover related subtopics
- Find implementation details
- Navigate to specific examples

## Siblings Section (→ Related)

Shows notes that share the same parent(s) as the current note.

### Visual Structure

```
Siblings
├── Current Note (highlighted)
├── Sibling Note 1
├── Sibling Note 2
└── Sibling Note 3
```

### Sorting Options

**Alphabetical:** Sort by note name (A-Z)

**Created:** Sort by file creation date (oldest first)

**Modified:** Sort by last modification date (newest first)

### Configuration Options

**Display Name:** Customize section header (default: "Siblings")

**Sort Order:** Choose sorting method

**Include Self:** Whether to show current note in the list
- Useful for seeing position among siblings
- Default: Off (excluded)

### Use Cases

**Finding Related Work:**
- Discover parallel tasks or topics
- Find similar notes in same category
- Explore related concepts

**Navigation Efficiency:**
- Quick access to related documents
- Switch between similar items
- Maintain context within a group

## Advanced Sidebar Features

### Real-time Updates

The sidebar automatically updates when:
- You switch to a different note
- Relationships are modified via context menu
- Notes are created, renamed, or deleted
- Frontmatter is changed

### Performance Considerations

**Large Hierarchies:**
- Deep trees may take time to load initially
- Use depth limits to improve performance
- Consider hiding unused sections

**Many Siblings:**
- Large sibling lists can be overwhelming
- Use sorting to find relevant items quickly
- Consider excluding self if not needed

### Keyboard Navigation

**Within Sidebar:**
- `Tab` / `Shift+Tab` - Navigate between interactive elements
- `Enter` / `Space` - Activate buttons or links
- `↑` / `↓` - Navigate within expanded sections

**Obsidian Integration:**
- Sidebar respects Obsidian's accessibility settings
- Works with screen readers and keyboard-only navigation

## Troubleshooting

### Sidebar Not Showing Relationships

**Check Configuration:**
- Ensure parent fields are properly configured
- Verify field names match frontmatter exactly
- Check that sections are visible in settings

**Check Frontmatter:**
- Ensure notes have the correct parent field
- Verify wiki-link format: `[[Note Name]]`
- Check for typos in field names

### Performance Issues

**Large Vaults:**
- Increase depth limits gradually
- Hide unused sections
- Consider using pinning strategically

**Slow Loading:**
- Reduce max depth settings
- Use collapsed sections by default
- Check for circular relationships

### Display Issues

**Missing Sections:**
- Check visibility settings per field
- Ensure sections are enabled in configuration

**Incorrect Relationships:**
- Verify frontmatter syntax
- Check for broken wiki-links
- Validate relationship logic

## Best Practices

### Layout Optimization

**For Deep Hierarchies:**
- Set lower initial unfold depths
- Use higher max depths for exploration
- Keep ancestors collapsed by default

**For Broad Hierarchies:**
- Limit sibling display
- Use alphabetical sorting
- Consider hiding self in siblings

### Workflow Integration

**Research Workflows:**
- Keep ancestors visible for context
- Use siblings for related research
- Pin important reference notes

**Project Management:**
- Focus on descendants for task tracking
- Use siblings for parallel work streams
- Pin project overview notes

**Knowledge Management:**
- Balance all three sections
- Use custom display names
- Configure per field preferences

## Next Steps

Now that you understand the sidebar:

- Learn about [navigation commands](./navigation.md) for advanced movement
- Explore [context menu features](./context-menu.md) for relationship editing
- Try [embedding trees](./codeblocks.md) in your notes
- Customize the sidebar in [Configuration](./configuration.md)

The sidebar is your central hub for understanding and navigating note relationships. Experiment with different configurations to find what works best for your workflow.

## Need Help?

- Check the [Basic Usage](./usage.md) guide for fundamentals
- Visit the [Configuration](./configuration.md) page for settings
- Report issues on [GitHub](https://github.com/bright-fakl/relations-obsidian/issues)