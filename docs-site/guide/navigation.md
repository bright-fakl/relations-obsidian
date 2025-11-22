---
title: Navigation Commands
description: Master advanced navigation commands for efficient note traversal in Relation Explorer
---

# Navigation Commands

Relation Explorer provides powerful navigation commands that go beyond basic sidebar interaction. These commands enable quick movement between related notes, graph analysis, and relationship discovery. This guide covers all navigation features and commands.

## Quick Navigation Commands

The most frequently used commands for immediate parent-child navigation.

### Go to Parent Note

Navigate to the parent of the current note.

**How it works:**
- If the current note has one parent: navigates directly
- If multiple parents exist: opens a selection modal
- Only available when the note has at least one parent

**Use cases:**
- Move up the hierarchy to see broader context
- Access parent documents or categories
- Navigate to source materials or foundational concepts

### Go to Child Note

Navigate to a child of the current note.

**How it works:**
- If the current note has one child: navigates directly
- If multiple children exist: opens a selection modal
- Only available when the note has at least one child

**Use cases:**
- Drill down into implementation details
- Access subtopics or subtasks
- Explore related work or examples

## Sidebar Control Commands

Commands that control sidebar display and focus.

### Show Parent Tree in Sidebar

Opens the sidebar and focuses on ancestor relationships.

**Behavior:**
- Automatically pins the sidebar to the current note
- Shows only the ancestors section
- Hides descendants and siblings sections

**Use cases:**
- Keep parent context visible while working
- Reference hierarchical position
- Maintain upward navigation context

### Show Child Tree in Sidebar

Opens the sidebar and focuses on descendant relationships.

**Behavior:**
- Automatically pins the sidebar to the current note
- Shows only the descendants section
- Hides ancestors and siblings sections

**Use cases:**
- Track project progress or task completion
- Monitor work breakdown structure
- Keep implementation overview visible

### Show Full Lineage in Sidebar

Opens the sidebar with complete relationship context.

**Behavior:**
- Automatically pins the sidebar to the current note
- Shows all sections: ancestors, descendants, and siblings
- Provides complete relationship overview

**Use cases:**
- Comprehensive relationship review
- Full context awareness
- Detailed relationship analysis

### Toggle Relation Sidebar

Simple show/hide toggle for the sidebar.

**Behavior:**
- Opens sidebar if closed
- Closes sidebar if open
- Quick access without specifying content

**Use cases:**
- Rapid sidebar access
- Clean up interface when not needed
- Toggle reference information

## Advanced Navigation Commands

Powerful commands for exploring extended relationships and graph analysis.

### Show Siblings [FieldName]

Discover notes that share the same parent(s).

**Features:**
- Opens an interactive results modal
- Shows count of siblings found
- Clickable list for easy navigation
- Real-time filtering capability

**Use cases:**
- Find related work or parallel tasks
- Discover similar topics or concepts
- Explore notes at the same hierarchical level

### Show Cousins [FieldName]

Find notes at the same level in different branches of the hierarchy.

**Features:**
- Displays first cousins (shared grandparent)
- Interactive modal with filtering
- Shows relationship through common ancestors
- Navigate to related but separate work streams

**Use cases:**
- Find parallel projects or initiatives
- Discover related research in different areas
- Cross-reference similar work in other contexts

### Find Shortest Path [FieldName]

Discover how any two notes are connected through relationships.

**Features:**
- Opens note selection modal to choose target
- Uses breadth-first search algorithm
- Displays connection path with direction indicators
- Shows path length and relationship type

**Example output:**
```
Note A → Note B → Note C → Target
Path length: 3 (up/mixed/down)
```

**Use cases:**
- Understand unexpected connections
- Trace relationship chains
- Validate knowledge graph connectivity

## Graph Analysis Commands

Commands for understanding your vault's overall structure.

### Show Root Notes [FieldName]

Find top-level notes that have no parents but have children.

**Features:**
- Displays hierarchical entry points
- Interactive results modal
- Shows notes that form the foundation of your graph
- Useful for understanding graph structure

**Use cases:**
- Identify main projects or topics
- Find starting points for exploration
- Understand vault organization

### Show Leaf Notes [FieldName]

Find bottom-level notes that have no children but have parents.

**Features:**
- Displays terminal notes in hierarchies
- Interactive modal with navigation
- Identifies notes that need expansion or completion
- Shows work that may be incomplete

**Use cases:**
- Find notes needing more detail
- Identify completed vs incomplete work
- Plan content expansion

### Show Graph Statistics [FieldName]

Comprehensive metrics about your relationship graph.

**Statistics include:**
- Total nodes (notes with relationships)
- Total edges (parent-child connections)
- Number of root notes
- Number of leaf notes
- Maximum depth from any root
- Maximum breadth (most children any note has)
- Number of cycles detected
- Average children per note

**Use cases:**
- Understand vault complexity
- Monitor graph health
- Plan optimization strategies

## Utility Commands

Commands for maintaining and exporting relationship data.

### Validate Graph [FieldName]

Comprehensive graph validation and health checking.

**Validation checks:**
- Cycles in relationship graphs
- Broken or orphaned references
- Invalid relationship structures

**Output:**
- Results displayed in developer console
- Severity levels: Errors, Warnings, Info
- Summary notice with issue counts

**Use cases:**
- Regular graph health maintenance
- Troubleshooting relationship issues
- Ensuring data integrity

### Export Ancestor Tree [FieldName]

Export hierarchical relationship data as markdown.

**Features:**
- Copies formatted tree to clipboard
- Uses wiki-link format for notes
- Includes cycle indicators when detected
- Ready to paste into any note

**Example output:**
```markdown
# Ancestors of Current Note [Parent]

- [[Current Note]]
  - [[Parent Note]]
    - [[Grandparent Note]]
```

**Use cases:**
- Document relationship structures
- Share hierarchical information
- Create relationship reports

## Multi-Field Support

All advanced commands work independently per parent field.

### Field-Specific Commands

When you have multiple parent fields configured (e.g., `parent`, `project`, `category`), you'll see separate commands for each:

```
Show siblings [Parent]
Show siblings [Project]
Show siblings [Category]

Find shortest path [Parent]
Find shortest path [Project]
Find shortest path [Category]
```

### Independent Analysis

Each field maintains its own:
- Relationship graph and connections
- Analysis results and statistics
- Command scope and context

**Benefits:**
- Analyze different relationship types separately
- Compare hierarchies across fields
- Focus on specific relationship contexts

## Interactive Modals

Most advanced commands use feature-rich result modals.

### Modal Features

**Real-time Filtering:**
- Type to filter results instantly
- See matching count updates
- Narrow down large result sets

**Navigation:**
- Click any note to open it
- Keyboard navigation support
- Full path display on hover

**Information Display:**
- Note names prominently shown
- Folder paths for context
- Relationship counts and statistics

### Example Workflow

1. Run "Show siblings [Project]" on a task note
2. See "42 Project Siblings" in modal header
3. Type "urgent" to filter to urgent related tasks
4. Click a high-priority sibling to navigate
5. Modal updates to show relationships for the new note

## Keyboard Shortcuts

Assign custom shortcuts for frequently used commands.

### Setting Up Shortcuts

1. Open **Settings** → **Hotkeys**
2. Search for "relation" to see all commands
3. Click **+** next to any command
4. Press your desired key combination

### Recommended Shortcuts

**Core Navigation:**
- `Ctrl+Shift+P` - Go to parent note
- `Ctrl+Shift+C` - Go to child note
- `Ctrl+Shift+R` - Toggle relation sidebar

**Advanced Features:**
- `Ctrl+Shift+S` - Show siblings
- `Ctrl+Shift+L` - Show full lineage
- `Ctrl+Shift+G` - Show graph statistics

## Practical Examples

### Project Management Workflow

1. **Start with overview**: Use "Show root notes [Project]" to see all projects
2. **Drill down**: Use "Go to child note" to explore project tasks
3. **Check progress**: Use "Show leaf notes [Project]" to find completed work
4. **Find related work**: Use "Show siblings [Project]" for parallel tasks

### Research Organization

1. **Explore connections**: Use "Find shortest path [Topic]" between related papers
2. **Find similar work**: Use "Show cousins [Topic]" for parallel research
3. **Validate structure**: Use "Validate graph [Topic]" for data integrity
4. **Document findings**: Use "Export ancestor tree [Topic]" for reports

### Knowledge Management

1. **Understand scope**: Use "Show graph statistics [Parent]" for vault overview
2. **Find gaps**: Use "Show leaf notes [Parent]" to identify expansion opportunities
3. **Navigate efficiently**: Use quick navigation commands for daily work
4. **Maintain health**: Regular validation and cleanup

## Command Availability

Commands appear in the command palette based on context:

- **Always available**: Sidebar controls, graph statistics
- **Context-dependent**: Parent/child navigation (only when relationships exist)
- **Field-specific**: All advanced commands (one per configured field)

## Performance Considerations

**Large Vaults:**
- Graph analysis commands may take time with thousands of notes
- Use filtering in result modals to manage large datasets
- Consider field-specific analysis for better performance

**Complex Hierarchies:**
- Path finding works best with acyclic graphs
- Cycle detection helps identify performance issues
- Export commands handle large trees gracefully

## Troubleshooting

### Commands Not Appearing

**Check field configuration:**
- Ensure parent fields are properly set up
- Verify field names match frontmatter
- Check that relationships exist for the current note

**Check command palette:**
- Search for "relation" to see all available commands
- Some commands only appear when applicable

### Modal Not Showing Results

**Check relationships:**
- Verify notes have proper parent field values
- Ensure wiki-links are correctly formatted
- Confirm field configuration matches usage

**Check filtering:**
- Try clearing filters to see all results
- Verify search terms match note names

### Performance Issues

**Large result sets:**
- Use filtering to reduce displayed items
- Consider field-specific analysis
- Check for unintended relationship cycles

## Integration with Sidebar

Navigation commands complement sidebar functionality:

- **Sidebar**: Visual relationship exploration
- **Commands**: Quick navigation and analysis
- **Combined**: Powerful relationship management

Use commands for quick movement, sidebar for detailed exploration.

## Next Steps

Now that you understand navigation commands:

- Learn about [context menu features](./context-menu.md) for relationship editing
- Try [embedding trees](./codeblocks.md) in your notes
- Explore [sidebar features](./sidebar.md) in detail
- Customize behavior in [Configuration](./configuration.md)

Navigation commands transform how you move through your note hierarchies, making relationship-aware navigation a natural part of your workflow.

## Need Help?

- Check the [Basic Usage](./usage.md) guide for fundamentals
- Visit the [Configuration](./configuration.md) page for settings
- Report issues on [GitHub](https://github.com/bright-fakl/relations-obsidian/issues)