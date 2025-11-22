---
title: Getting Started
description: Install and start using Relation Explorer to visualize note relationships in Obsidian
---

# Getting Started with Relation Explorer

Welcome to Relation Explorer! This guide will help you install the plugin and get started with visualizing parent-child relationships between your notes.

## Installation

### Option 1: Community Plugins (Recommended)

The easiest way to install Relation Explorer is through Obsidian's built-in Community Plugins browser:

1. Open Obsidian
2. Go to **Settings** → **Community Plugins**
3. Click **Browse** and search for "Relation Explorer"
4. Click **Install**
5. Enable the plugin by toggling it on

### Option 2: Manual Installation

If you prefer manual installation or want the latest development version:

1. Download the latest release from the [GitHub releases page](https://github.com/bright-fakl/relations-obsidian/releases)
2. Extract the downloaded files
3. Copy the extracted folder to your vault's `.obsidian/plugins/` directory
4. Reload Obsidian (or restart the app)
5. Go to **Settings** → **Community Plugins** and enable "Relation Explorer"

## Quick Start

### 1. Configure Your First Parent Field

After installation, let's set up your first relationship hierarchy:

1. Open **Settings** → **Relation Explorer**
2. Under "Parent Fields Configuration", you'll see the default "parent" field
3. Click the **Edit** button next to "parent" to customize it
4. Set a **Display Name** (e.g., "Parent" or "Hierarchy")
5. Configure the sidebar sections as desired
6. Click **Save**

### 2. Add Relationships to Your Notes

Start building relationships by adding parent fields to your notes:

```yaml
---
parent: "[[Parent Note]]"
---

# Your note content here
```

You can also specify multiple parents:

```yaml
---
parent:
  - "[[Parent Note 1]]"
  - "[[Parent Note 2]]"
---
```

### 3. View Relationships in the Sidebar

1. Open the Relation Explorer sidebar using the ribbon icon or run the "Toggle relation sidebar" command
2. The sidebar will show relationships for your current note
3. If you have multiple parent fields, use the field selector at the top to switch between them
4. Expand/collapse sections to explore the hierarchy

### 4. Try Navigation Commands

Use keyboard shortcuts for quick navigation:

- **Go to parent note**: Navigate to the parent of the current note
- **Go to child note**: Navigate to a child of the current note
- **Toggle relation sidebar**: Show/hide the relationship sidebar

Set up keyboard shortcuts in **Settings** → **Hotkeys** by searching for "relation".

## First Example

Let's create a simple hierarchy to see Relation Explorer in action:

1. Create three notes: `Project A.md`, `Task 1.md`, and `Task 2.md`

2. In `Task 1.md`, add:
   ```yaml
   ---
   parent: "[[Project A]]"
   ---
   # Task 1
   This is a task under Project A.
   ```

3. In `Task 2.md`, add:
   ```yaml
   ---
   parent: "[[Project A]]"
   ---
   # Task 2
   This is another task under Project A.
   ```

4. Open `Project A.md` and view the sidebar - you'll see Task 1 and Task 2 listed as children

5. Open `Task 1.md` and check the sidebar - you'll see Project A as the parent

## Next Steps

Now that you have the basics set up, explore these features:

- **Multiple Hierarchies**: Add different parent fields like `project`, `category`, or `topic`
- **Embedded Trees**: Use `relation-tree` codeblocks to embed relationship visualizations in your notes
- **Advanced Navigation**: Try commands like "Show siblings" or "Find shortest path"
- **Configuration**: Customize display names, visibility, and sorting in the settings

## Need Help?

- Check the [Guide](./guide/configuration.md) for detailed configuration options
- Visit the [Support](./support.md) page for additional help
- Report issues on [GitHub](https://github.com/bright-fakl/relations-obsidian/issues)

Happy exploring! 🌳