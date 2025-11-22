---
title: Configuration
description: Learn how to configure Relation Explorer to match your workflow and preferences
---

# Configuration Guide

This guide explains how to configure the Relation Explorer plugin to match your workflow and preferences. Whether you're managing projects, building a knowledge base, or organizing research notes, you can customize the plugin to work exactly how you need it to.

## Quick Start with Presets

The easiest way to get started is to use one of the built-in presets. These provide ready-made configurations for common use cases.

### Available Presets

#### 1. Simple Hierarchy
**Best for:** Basic note hierarchies, general note-taking

**Configuration:**
- Single `parent` field
- All sections visible (Ancestors, Descendants, Siblings)
- Standard depth limits (5 levels)
- Alphabetical sibling sorting

**Use case:** Perfect for simple parent-child note structures where you want to see the full relationship tree.

#### 2. Project Management
**Best for:** Project planning, task management, portfolio tracking

**Configuration:**
- Two fields: `project` and `category`
- Project field with program/portfolio hierarchies
- Category field with parent/sub-category organization
- Optimized for project workflows

**Use case:** Track project hierarchies and categorize notes within a project management workflow.

#### 3. Knowledge Base
**Best for:** Zettelkasten, research notes, deep knowledge hierarchies

**Configuration:**
- Single `parent` field with display name "Parent Topic"
- Deep traversal (max depth: 10 levels)
- Higher initial unfold depth (3 levels)
- Siblings sorted by modification date (most recent first)

**Use case:** Ideal for knowledge management systems with deep topic hierarchies.

#### 4. Compact
**Best for:** Minimalist workflows, focused work sessions

**Configuration:**
- Single `parent` field
- Minimal interface with essential relationships only
- Ancestors section: "Up" (compact view)
- Descendants section: "Down" (collapsed by default)
- Siblings section hidden

**Use case:** Clean, minimal interface for focused work.

#### 5. Multi-Field Explorer
**Best for:** Complex workflows with multiple organizational dimensions

**Configuration:**
- Three fields: `parent`, `project`, and `topic`
- Each field independently configured
- Different depth and visibility settings per field
- Different sibling sorting per field

**Use case:** Comprehensive organization where notes can be categorized along multiple dimensions simultaneously.

### Loading a Preset

1. Open Obsidian Settings
2. Navigate to **Relation Explorer** settings
3. Scroll to **Configuration Presets** section
4. Select a preset from the dropdown
5. Click to confirm (you'll see a warning about overwriting current config)
6. The preset will load immediately

::: warning Important
Loading a preset will replace your current configuration. Export your current configuration first if you want to keep it.
:::

## Advanced Per-Field Configuration

For complete control, you can configure each parent field independently.

### Adding a New Parent Field

1. Go to Settings → Relation Explorer
2. Scroll to **Parent Fields** section
3. Click **+ Add Parent Field**
4. A new field configuration form will appear (collapsed)
5. Click the header to expand and configure

### Field-Level Settings

#### Field Name
- **What it is:** The frontmatter field name to track
- **Examples:** `parent`, `project`, `category`, `topic`
- **Rules:**
  - Must be unique across all fields
  - Cannot be empty
  - Used in frontmatter of your notes

#### Display Name (Optional)
- **What it is:** Friendly name shown in the UI
- **Examples:** "Parent Topic", "My Projects", "Categories"
- **Default:** If left empty, uses the field name

### Section Configuration

Each parent field has three sections you can configure: **Ancestors**, **Descendants**, and **Siblings**.

#### Common Section Settings

##### Display Name
The header text shown in the sidebar for this section
- **Examples:** "Parent Chain", "Subtopics", "Related Notes"
- **Default:** "Ancestors", "Descendants", or "Siblings"

##### Visible
Whether this section appears in the sidebar
- **Use case:** Hide sections you don't need

##### Initially Collapsed
Whether the section starts collapsed when the sidebar opens
- **Use case:** Keep less important sections collapsed by default

#### Tree Section Settings (Ancestors & Descendants)

##### Max Depth
Maximum number of levels to traverse in the relationship tree
- **Range:** 1 to unlimited (leave empty for unlimited)
- **Default:** 5
- **Examples:**
  - `3` - Show up to 3 levels
  - `10` - Show up to 10 levels (for deep hierarchies)

##### Initial Unfold Depth
How many levels to show expanded by default
- **Range:** 1 to max depth
- **Default:** 2
- **Validation:** Cannot exceed Max Depth

#### Siblings Section Settings

##### Sort Order
How to order the siblings list
- **Options:**
  - **Alphabetical** - Sort by note name (A-Z)
  - **Created** - Sort by creation date (oldest first)
  - **Modified** - Sort by modification date (most recent first)
- **Default:** Alphabetical

##### Include Self
Whether to include the current note in the siblings list
- **Default:** Off (excluded)
- **Use case:** Enable if you want to see the current note's position among its siblings

### Managing Parent Fields

#### Duplicate a Field
- Click **Duplicate Field** button at the bottom of a field configuration
- Creates a copy with "_copy" appended to the name
- Useful for creating variations of existing configurations

#### Remove a Field
- Click **Remove** button in the field header
- Confirmation required if it's the last field (at least one field must exist)

#### Collapse/Expand Forms
- Click the field header to toggle collapse state
- Collapsed forms show only the field name
- Useful for managing multiple field configurations

## Configuration Examples

### Academic Research Notes

**Goal:** Organize research notes by topic with deep hierarchies and recent work visibility.

```json
{
  "parentFields": [
    {
      "name": "topic",
      "displayName": "Research Topic",
      "ancestors": {
        "displayName": "Broader Topics",
        "visible": true,
        "collapsed": false,
        "maxDepth": 8,
        "initialDepth": 3
      },
      "descendants": {
        "displayName": "Subtopics & Specifics",
        "visible": true,
        "collapsed": false,
        "maxDepth": 8,
        "initialDepth": 2
      },
      "siblings": {
        "displayName": "Related Research",
        "visible": true,
        "collapsed": false,
        "sortOrder": "modified",
        "includeSelf": false
      }
    }
  ],
  "defaultParentField": "topic"
}
```

### Software Project Documentation

**Goal:** Track software components with modules and features, showing recent changes.

```json
{
  "parentFields": [
    {
      "name": "module",
      "displayName": "Module",
      "ancestors": {
        "displayName": "Parent Modules",
        "visible": true,
        "collapsed": false,
        "maxDepth": 4,
        "initialDepth": 2
      },
      "descendants": {
        "displayName": "Submodules & Components",
        "visible": true,
        "collapsed": false,
        "maxDepth": 4,
        "initialDepth": 2
      },
      "siblings": {
        "displayName": "Related Components",
        "visible": true,
        "collapsed": true,
        "sortOrder": "modified",
        "includeSelf": false
      }
    }
  ],
  "defaultParentField": "module"
}
```

### Personal Knowledge Management

**Goal:** Simple parent-child structure for personal notes with minimal UI.

```json
{
  "parentFields": [
    {
      "name": "parent",
      "displayName": "Parent",
      "ancestors": {
        "displayName": "↑ Up",
        "visible": true,
        "collapsed": false,
        "maxDepth": 5,
        "initialDepth": 2
      },
      "descendants": {
        "displayName": "↓ Down",
        "visible": true,
        "collapsed": false,
        "maxDepth": 5,
        "initialDepth": 2
      },
      "siblings": {
        "displayName": "→ Related",
        "visible": true,
        "collapsed": true,
        "sortOrder": "alphabetical",
        "includeSelf": false
      }
    }
  ],
  "defaultParentField": "parent"
}
```

## Import/Export Configuration

### Exporting Your Configuration

1. Go to Settings → Relation Explorer
2. Scroll to **Configuration Import/Export** section
3. Click **Export** button
4. Configuration is copied to your clipboard as JSON
5. Paste into a text file or note to save

**Use cases:**
- Backup before making changes
- Share configuration with team members
- Switch between different setups
- Version control your plugin configuration

### Importing a Configuration

1. Copy a valid configuration JSON to your clipboard
2. Go to Settings → Relation Explorer
3. Click **Import** button
4. If valid, configuration will be loaded immediately
5. If invalid, you'll see an error message

::: warning Important
Importing replaces your entire configuration. Export first if you want to keep the current setup.
:::

## Troubleshooting

### Common Issues

#### "Cannot remove the last parent field"
- **Cause:** At least one parent field is required
- **Solution:** Add a new field before removing the last one, or keep at least one field

#### "Invalid configuration format" on import
- **Cause:** JSON syntax error or validation failure
- **Solutions:**
  - Verify JSON syntax using a JSON validator
  - Ensure all required fields are present
  - Check that depth values are valid

#### Section not showing in sidebar
- **Cause:** Section visibility is set to false
- **Solution:** Go to field configuration, expand the section, toggle "Visible" on

#### Tree not expanding to expected depth
- **Cause:** Initial unfold depth is lower than expected
- **Solution:** Increase "Initial Unfold Depth" in section settings

### Best Practices

1. **Start with a preset** - Choose the closest preset to your workflow, then customize
2. **Export before experimenting** - Always export your working configuration before making major changes
3. **Use descriptive names** - Give fields and sections clear, meaningful display names
4. **Test with a few notes** - Verify your configuration works with a small set of notes first
5. **Adjust depths gradually** - Start with smaller depths and increase as needed
6. **Hide unused sections** - Reduce clutter by hiding sections you don't use

## Global Settings

### Default Parent Field
Which field to show by default when opening the sidebar
- Automatically switches to the first available field if the default is removed

### UI Style
How to display the field selector in the sidebar
- **Auto:** Automatically chooses based on number of fields
- **Segmented Control:** Tab-like interface for multiple fields
- **Dropdown:** Compact dropdown selector

### Diagnostic Mode
Enable verbose logging for debugging
- Useful for troubleshooting configuration issues
- Check the developer console for detailed logs

## Need More Help?

- Check the [Getting Started](../getting-started.md) guide for basic setup
- Visit the [Support](../support.md) page for additional help
- Report issues on [GitHub](https://github.com/bright-fakl/relations-obsidian/issues)