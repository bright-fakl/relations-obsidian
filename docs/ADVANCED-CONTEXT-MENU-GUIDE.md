# Advanced Context Menu Guide

**Milestone 4.3B - User Guide**

This guide covers the advanced context menu features added in Milestone 4.3B, enabling relationship modification and tree manipulation directly from the sidebar.

---

## Overview

The advanced context menu provides quick access to relationship modification and tree manipulation actions. Right-click (or use Shift+F10) on any node in the relation tree to access these features.

---

## Relationship Modification

### Set as Parent / Ancestor

**Location:** Ancestors, Siblings sections
**Action:** Adds the clicked note as a parent to the current note

When you click "Set as Ancestor" (or "Set as Parent"), the plugin:
1. Adds the clicked note to your current note's parent field
2. Updates the sidebar view automatically
3. Shows a success notification

**Example:**
- Current note: `Projects/Website`
- Clicked note in ancestors: `Work`
- Action: "Set as Ancestor"
- Result: `[[Work]]` is added to `Projects/Website.md` frontmatter

```yaml
---
parent: [[Work]]
---
```

### Remove as Parent / Ancestor

**Location:** Ancestors section
**Action:** Removes the clicked note from your current note's parent field

**Confirmation:** A dialog asks you to confirm removal of parent relationships.

When you click "Remove as Ancestor":
1. A confirmation dialog appears
2. If confirmed, removes the clicked note from current note's parent field
3. Updates the sidebar view
4. Shows a success notification

### Set as Child / Descendant

**Location:** Descendants, Siblings sections
**Action:** Adds the current note as a parent to the clicked note

This is the **inverse** of "Set as Parent" - it modifies the clicked note's frontmatter instead of the current note.

**Example:**
- Current note: `Work`
- Clicked note in descendants: `Projects/Website`
- Action: "Set as Descendant"
- Result: `[[Work]]` is added to `Projects/Website.md` frontmatter

### Remove as Child / Descendant

**Location:** Descendants section
**Action:** Removes the current note from the clicked note's parent field

**Confirmation:** A dialog asks you to confirm removal of child relationships.

---

## Section-Specific Behavior

The context menu adapts based on which section you're viewing:

### Ancestors Section

Shows relationship actions for moving notes up the hierarchy:
- **Set as Ancestor** - Only shown if NOT already a parent
- **Remove as Ancestor** - Only shown if IS already a parent

### Descendants Section

Shows relationship actions for moving notes down the hierarchy:
- **Set as Descendant** - Only shown if NOT already a child
- **Remove as Descendant** - Only shown if current note IS the parent

### Siblings Section

Shows both ancestor and descendant actions using appropriate labels:
- **Set as Ancestor** - Adds sibling as parent
- **Remove as Ancestor** - Removes sibling from parents (if applicable)
- **Set as Descendant** - Adds current note as parent to sibling

---

## Tree Manipulation

### Expand All Children

**Action:** Expands the clicked node and all its descendants recursively

**Use case:** Quickly view an entire subtree without manually expanding each level

**How to use:**
1. Right-click on a node
2. Select "Expand all children"
3. The node and all descendants expand instantly

### Collapse All Children

**Action:** Collapses all descendants of the clicked node, then collapses the node itself

**Use case:** Clean up view after exploring a subtree

**How to use:**
1. Right-click on a node
2. Select "Collapse all children"
3. All descendants collapse, then the node collapses

### Expand to Node

**Action:** Expands all ancestors to make a specific node visible and scrolls to it

**Use case:** Navigate to a deeply nested node

**Note:** This feature is available via the tree renderer API but not yet exposed in the context menu.

---

## Command Palette Integration

All advanced features are available via the command palette (Ctrl/Cmd+P), enabling keyboard-driven workflows.

### Available Commands

1. **Pin clicked note in sidebar**
   - Pins the last clicked note
   - Requires: A note was recently clicked in the tree

2. **Copy link to clicked note**
   - Copies `[[Note Name]]` to clipboard
   - Requires: A note was recently clicked in the tree

3. **Expand all children of clicked note**
   - Expands entire subtree of last clicked note
   - Requires: A note was recently clicked in the tree

4. **Collapse all children of clicked note**
   - Collapses entire subtree of last clicked note
   - Requires: A note was recently clicked in the tree

### Assigning Keyboard Shortcuts

You can assign keyboard shortcuts to these commands:

1. Open Settings → Hotkeys
2. Search for "Relations" or "clicked note"
3. Click the (+) icon to assign a shortcut
4. Choose your preferred key combination

**Recommended shortcuts:**
- Pin clicked note: `Ctrl/Cmd+Shift+P`
- Copy link: `Ctrl/Cmd+Shift+C`
- Expand all: `Ctrl/Cmd+Shift+E`
- Collapse all: `Ctrl/Cmd+Shift+R`

### How Click Tracking Works

The plugin remembers the last note you clicked in the tree. This enables command palette commands to operate on that note even when the context menu isn't open.

**Click tracking triggers:**
- Left-clicking a note name to navigate
- Right-clicking to open context menu
- Pressing Shift+F10 to open context menu with keyboard

---

## Smart Menu Logic

The context menu shows only relevant actions based on current relationships:

### Conditional Display

**"Set as Ancestor"** appears only if:
- The clicked note is NOT already in your current note's parent field

**"Remove as Ancestor"** appears only if:
- The clicked note IS in your current note's parent field

**"Set as Descendant"** appears only if:
- The current note is NOT in the clicked note's parent field

**"Remove as Descendant"** appears only if:
- The current note IS in the clicked note's parent field

This prevents duplicate relationships and ensures actions make sense in context.

---

## Confirmation Dialogs

Destructive actions require confirmation to prevent accidental changes:

### Actions Requiring Confirmation

- **Remove as Parent/Ancestor** - Removing parent relationships
- **Remove as Child/Descendant** - Removing child relationships

### Confirmation Dialog

The dialog shows:
- Action being performed
- Notes involved
- Warning about the change
- Cancel / Confirm buttons

**Keyboard navigation:**
- Tab: Switch between buttons
- Enter: Confirm
- Escape: Cancel

---

## Display Name Customization

The context menu uses your custom display names for parent fields and sections:

### Parent Field Display Names

If you've configured custom display names in settings:
- Field: `parent` → Display: "Project"
- Menu shows: "Set as Project" instead of "Set as Parent"

### Section Display Names

If you've configured custom section names:
- Section: `ancestors` → Display: "Projects"
- Menu shows: "Set as Project" (singular form)

The plugin automatically singularizes plural display names for menu items.

---

## Frontmatter Safety

All relationship modifications use Obsidian's built-in `processFrontMatter` API:

### Safety Features

✅ **Atomic writes** - Changes are applied all-at-once or not-at-all
✅ **Undo/redo support** - All changes can be undone with Ctrl/Cmd+Z
✅ **Format preservation** - YAML formatting is preserved
✅ **Conflict handling** - Built-in conflict detection
✅ **Validation** - Prevents duplicate relationships

### Error Handling

If an error occurs:
- No changes are saved to files
- An error notice is displayed
- The sidebar shows the current state (unchanged)

Common errors:
- "Value already exists" - Trying to add a duplicate parent
- "Value not found" - Trying to remove a non-existent parent
- "Field does not exist" - Parent field not present in frontmatter

---

## Tips & Best Practices

### Workflow Tips

1. **Use siblings section for lateral moves** - When reorganizing notes at the same level
2. **Pin notes before bulk changes** - Pin a note to keep it visible while modifying relationships
3. **Collapse before reorganizing** - Collapse subtrees to reduce visual clutter
4. **Assign keyboard shortcuts** - Speed up repetitive actions with hotkeys

### Avoiding Common Mistakes

❌ **Don't create cycles** - A note can't be its own ancestor
✅ **Check relationships first** - Use the tree view to understand current structure

❌ **Don't remove parents accidentally** - Pay attention to confirmation dialogs
✅ **Use undo if needed** - Ctrl/Cmd+Z reverses relationship changes

### Performance

- Tree manipulation (expand/collapse) operates on the DOM only - no file changes
- Relationship modifications trigger sidebar refresh and graph rebuild
- Large hierarchies (100+ nodes) may take a moment to refresh

---

## Troubleshooting

### Context Menu Not Appearing

**Problem:** Right-click doesn't show context menu
**Solution:** Ensure context menu is enabled in TreeRenderer options (enabled by default)

### Commands Not Available

**Problem:** Commands are grayed out in command palette
**Solution:** Click a note in the tree first to enable click tracking

### Relationships Not Updating

**Problem:** Frontmatter changed but tree didn't update
**Solution:** The sidebar should auto-refresh; if not, close and reopen the sidebar

### Confirmation Dialogs Not Showing

**Problem:** Remove actions happen immediately
**Solution:** This shouldn't happen - report as a bug if it does

---

## Related Documentation

- [Context Menu Builder](../src/context-menu-builder.ts) - Implementation details
- [Frontmatter Editor](../src/frontmatter-editor.ts) - Frontmatter modification API
- [Tree Renderer](../src/tree-renderer.ts) - Tree manipulation methods
- [Milestone 4.3B Plan](./milestone-4.3B-advanced-context-menu.md) - Full implementation plan

---

## Keyboard Reference

| Action | Default | Customizable |
|--------|---------|--------------|
| Open context menu | Right-click or Shift+F10 | No |
| Navigate to note | Click | No |
| Open in new pane | Ctrl/Cmd+Click | No |
| Pin clicked note | - | Yes (via Settings → Hotkeys) |
| Copy link | - | Yes (via Settings → Hotkeys) |
| Expand all children | - | Yes (via Settings → Hotkeys) |
| Collapse all children | - | Yes (via Settings → Hotkeys) |

---

*This guide covers features added in Milestone 4.3B. For basic context menu features (navigation, copy, pin), see the main documentation.*
