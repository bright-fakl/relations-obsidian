---
title: Context Menu
description: Learn how to modify relationships directly from the sidebar using context menu actions
---

# Context Menu Guide

Relation Explorer's context menu provides powerful relationship modification capabilities directly from the sidebar. Right-click any note in the relationship tree to access context-sensitive actions for adding, removing, and managing parent-child relationships.

## Overview

The context menu adapts based on:
- **Current section** (Ancestors, Descendants, Siblings)
- **Existing relationships** between notes
- **Your configured parent fields**

This ensures you only see relevant actions for each situation.

## Basic Usage

### Accessing the Context Menu

1. **Open the sidebar** with relationship information
2. **Right-click any note** in the tree
3. **Select an action** from the context menu

### Confirmation Dialogs

Most relationship changes require confirmation to prevent accidental modifications. Click **Confirm** to proceed or **Cancel** to abort.

## Relationship Modification Actions

### Set as Parent

**Available in:** Descendants and Siblings sections

**Action:** Makes the clicked note a parent of the current note

**Example:**
- Current note: "Task 1"
- Right-click: "Project Alpha"
- Result: "Task 1" now has "Project Alpha" as a parent

**Use cases:**
- Organize existing notes into hierarchies
- Add project or category relationships
- Create parent-child links between related notes

### Set as Child

**Available in:** Ancestors and Siblings sections

**Action:** Makes the clicked note a child of the current note

**Example:**
- Current note: "Project Alpha"
- Right-click: "Task 1"
- Result: "Task 1" now has "Project Alpha" as a parent

**Use cases:**
- Add subtasks to projects
- Create subtopics under main topics
- Organize notes under categories

### Remove as Parent

**Available in:** Ancestors section

**Action:** Removes the parent relationship between the clicked note and current note

**Conditions:** Only appears when the clicked note is actually a parent of the current note

**Use cases:**
- Correct mistaken relationships
- Reorganize note hierarchies
- Remove outdated parent links

### Remove as Child

**Available in:** Descendants section

**Action:** Removes the child relationship between the clicked note and current note

**Conditions:** Only appears when the clicked note is actually a child of the current note

**Use cases:**
- Remove completed subtasks
- Reorganize project structures
- Clean up relationship errors

## Advanced Actions

### Set as Ancestor

**Available in:** Descendants section (when deeper relationships exist)

**Action:** Creates a multi-level parent relationship

**Example:**
- Current note: "Implementation Detail"
- Right-click: "Project Alpha" (2 levels up)
- Result: Creates intermediate relationship if needed

**Use cases:**
- Build deep hierarchies quickly
- Skip intermediate organizational levels
- Create direct links to high-level concepts

### Set as Descendant

**Available in:** Ancestors section (when deeper relationships exist)

**Action:** Creates a multi-level child relationship

**Example:**
- Current note: "Project Alpha"
- Right-click: "Implementation Detail" (2 levels down)
- Result: Creates intermediate relationship if needed

**Use cases:**
- Add deep subtopics to main categories
- Create project subtask hierarchies
- Build complex organizational structures

## Tree Manipulation Actions

### Expand All Subtrees

**Available in:** Any section with collapsible items

**Action:** Expands all collapsed subtrees under the clicked note

**Use cases:**
- Quickly explore entire branches
- Get overview of complex hierarchies
- Prepare for detailed work

### Collapse All Subtrees

**Available in:** Any section with expanded items

**Action:** Collapses all expanded subtrees under the clicked note

**Use cases:**
- Clean up cluttered views
- Focus on high-level structure
- Improve performance with large trees

## Context Sensitivity

The context menu intelligently adapts to show only relevant actions.

### Section-Based Logic

**Ancestors Section:**
- Remove as Parent (if applicable)
- Set as Child (for non-ancestors)
- Set as Descendant (for deeper relationships)
- Tree manipulation actions

**Descendants Section:**
- Remove as Child (if applicable)
- Set as Parent (for non-descendants)
- Set as Ancestor (for deeper relationships)
- Tree manipulation actions

**Siblings Section:**
- Set as Parent/Child (for non-relatives)
- No removal actions (siblings don't have direct parent-child relationships)
- Tree manipulation actions

### Relationship-Based Filtering

**Existing Relationships:**
- Shows removal actions for current relationships
- Hides creation actions for existing relationships

**Field-Specific Context:**
- Actions respect the current parent field
- Different fields can have different relationships for the same notes

## Undo Support

All relationship modifications support undo/redo.

### How to Undo

- **Keyboard:** `Ctrl+Z` (or `Cmd+Z` on Mac)
- **Menu:** Edit → Undo
- **Command:** Use the undo command

### What Gets Undone

- Parent field modifications in frontmatter
- Relationship graph updates
- Sidebar display changes

### Limitations

- Undo only works within the current Obsidian session
- Closing and reopening the vault clears the undo history
- Complex multi-note changes may require manual reversal

## Practical Examples

### Project Organization

**Scenario:** You have loose notes and want to organize them under projects

1. Open a note you want to categorize
2. Right-click the project name in siblings section
3. Select "Set as Parent"
4. Confirm the relationship
5. Note now appears under the project in the hierarchy

### Task Management

**Scenario:** Adding subtasks to existing tasks

1. Open the parent task
2. Right-click a related note in the sidebar
3. Select "Set as Child"
4. Confirm to create the subtask relationship
5. New hierarchy appears immediately

### Knowledge Base Cleanup

**Scenario:** Removing outdated topic relationships

1. Navigate to a note with incorrect categorization
2. Right-click the wrong parent in ancestors section
3. Select "Remove as Parent"
4. Confirm the removal
5. Note is removed from that hierarchy

### Research Paper Organization

**Scenario:** Building citation networks

1. Open a research note
2. Right-click foundational papers in the sidebar
3. Use "Set as Ancestor" for indirect relationships
4. Build complex citation hierarchies
5. Visualize research dependencies

## Multi-Field Support

Context menu actions work with multiple parent fields.

### Field Selection

- Actions apply to the currently selected field in the sidebar
- Switch fields to modify different relationship types
- Each field maintains independent relationships

### Cross-Field Relationships

- Same notes can have different relationships in different fields
- Context menu respects field boundaries
- Actions only affect the active field

## Confirmation Dialogs

Relationship changes require explicit confirmation.

### Dialog Information

**What it shows:**
- Action being performed
- Notes involved
- Parent field affected
- Potential impact warning

**Confirmation Options:**
- **Confirm:** Proceed with the change
- **Cancel:** Abort without changes

### Safety Features

- Prevents accidental modifications
- Shows clear before/after state
- Allows review of complex changes

## Error Handling

The context menu provides helpful feedback for invalid operations.

### Common Errors

**"Cannot modify relationship"**
- Cause: Permission or file system issues
- Solution: Check file permissions, ensure notes are editable

**"Relationship already exists"**
- Cause: Attempting to create duplicate relationships
- Solution: Check existing relationships first

**"Invalid target note"**
- Cause: Note doesn't exist or is invalid
- Solution: Verify note exists and is accessible

### Troubleshooting

1. **Check field configuration** - Ensure parent fields are properly set up
2. **Verify note permissions** - Make sure files are editable
3. **Check existing relationships** - Avoid duplicate or conflicting relationships
4. **Use undo** - Reverse accidental changes immediately

## Performance Considerations

### Large Hierarchies

- Context menu operations are fast and local
- Changes only affect modified relationships
- Sidebar updates incrementally

### Complex Relationships

- Multi-level operations may take longer
- Confirmation dialogs provide processing feedback
- Large changes show progress indicators

## Integration with Other Features

### Sidebar Synchronization

- Context menu changes update sidebar immediately
- Relationship modifications reflect in real-time
- No need to refresh or reload

### Command Palette Integration

- Context menu actions complement navigation commands
- Use commands for bulk operations, context menu for precision
- Both update the relationship graph consistently

### Frontmatter Editing

- Context menu changes modify frontmatter directly
- Changes are immediately saved to disk
- Compatible with manual frontmatter editing

## Best Practices

### Workflow Integration

1. **Use context menu for precision** - Individual relationship modifications
2. **Combine with navigation** - Move between notes while editing relationships
3. **Regular cleanup** - Use removal actions to maintain graph health

### Organization Strategies

1. **Start with broad relationships** - Use "Set as Ancestor" for high-level organization
2. **Refine with specific links** - Use "Set as Parent/Child" for detailed hierarchies
3. **Regular review** - Check and clean up relationships periodically

### Safety Measures

1. **Confirm before major changes** - Review confirmation dialogs carefully
2. **Use undo immediately** - Reverse mistakes while they're fresh
3. **Test with small changes** - Verify behavior before large reorganizations

## Advanced Techniques

### Bulk Relationship Creation

While the context menu works one relationship at a time, you can:

1. Use it repeatedly for similar patterns
2. Combine with navigation commands
3. Plan relationship changes systematically

### Complex Hierarchy Building

For building deep hierarchies:

1. Start with top-level relationships
2. Use "Set as Ancestor" to skip levels
3. Fill in intermediate relationships as needed
4. Use tree expansion to verify structure

### Relationship Auditing

Use the context menu to audit and fix relationship issues:

1. Check each note's relationships
2. Remove incorrect parent/child links
3. Add missing relationships
4. Verify hierarchy integrity

## Next Steps

Now that you can modify relationships:

- Learn about [navigation commands](./navigation.md) for quick movement
- Try [embedding trees](./codeblocks.md) in your notes
- Explore [sidebar features](./sidebar.md) in detail
- Customize behavior in [Configuration](./configuration.md)

The context menu transforms the sidebar from a read-only view into a powerful relationship editing tool, making hierarchy management intuitive and efficient.

## Need Help?

- Check the [Basic Usage](./usage.md) guide for fundamentals
- Visit the [Configuration](./configuration.md) page for settings
- Report issues on [GitHub](https://github.com/bright-fakl/relations-obsidian/issues)