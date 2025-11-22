---
title: Features
description: Discover all the powerful features of Relation Explorer for Obsidian
---

# Features Overview

Relation Explorer is a comprehensive plugin for visualizing and navigating parent-child relationships between your Obsidian notes. Whether you're managing projects, building knowledge bases, or organizing research, Relation Explorer provides powerful tools to understand and navigate your note hierarchies.

## 🌳 Core Functionality

### Multiple Parent Fields
Track different types of hierarchies simultaneously using custom frontmatter fields. Define relationships like `parent`, `project`, `category`, or `topic` to organize your notes in multiple dimensions.

### Interactive Sidebar
View ancestors, descendants, and siblings for any note with a clean, collapsible interface. The sidebar automatically updates as you navigate between notes.

### Embedded Relationship Trees
Display relationship visualizations directly in your notes using `relation-tree` codeblocks. Perfect for documentation, project overviews, and knowledge sharing.

### Smart Field Switching
Easily switch between different parent fields using an intuitive selector. Each field maintains its own configuration and pinning state.

### Per-Field Pinning
Pin the sidebar to specific notes independently for each parent field, allowing you to track different contexts simultaneously.

### Automatic Graph Building
The plugin automatically scans your vault and builds relationship graphs as you create and modify notes. No manual indexing required.

### Cycle Detection
Built-in cycle detection prevents infinite loops and helps maintain graph integrity by identifying circular relationships.

## 🔍 Advanced Codeblock Features

### Smart Filtering
Filter displayed notes by tags, folders, or exclude specific notes. Combine multiple filters with AND logic for precise results.

### Customizable Titles
Show simple titles, detailed titles with filter information, or no titles at all. Titles automatically use your configured display names.

### Visual Styles
Choose between detailed, minimal, or compact presentation styles to match your reading preferences and content density.

### Node Limiting
Limit large trees with `maxNodes` parameter and show truncation indicators when trees exceed the limit.

### List Rendering
Siblings and cousins display as clean, clickable lists for easy navigation and scanning.

### Advanced Parameters
Control depth, display modes, visual styles, filtering, and more with comprehensive codeblock parameters.

## ⚙️ Advanced Per-Field Configuration

### Custom Display Names
Personalize field and section names (e.g., "Projects" instead of "parent") to match your mental model.

### Section Visibility Control
Show or hide ancestors, descendants, or siblings sections per field to reduce clutter and focus on what matters.

### Configurable Depth
Set maximum depth and initial unfold depth independently for each section and field.

### Flexible Sorting
Sort siblings alphabetically, by creation date, or modification date. Choose whether to include the current note in sibling lists.

### Preset Configurations
Quick-start with 5 built-in presets optimized for different workflows: Simple Hierarchy, Project Management, Knowledge Base, Compact, and Multi-Field Explorer.

### Import/Export Settings
Backup and share your configurations as JSON. Easily switch between different setups or share configurations with team members.

## 🎯 Advanced Context Menu

### Relationship Modification
Add or remove parent-child relationships directly from the tree view. Set notes as parents, children, ancestors, or descendants with simple right-click actions.

### Smart Section Logic
Context menu options adapt based on the current section and existing relationships, showing only relevant actions.

### Tree Manipulation
Expand or collapse entire subtrees with one click. Perfect for managing complex hierarchies.

### Confirmation Dialogs
Prevent accidental changes with confirmation prompts for destructive operations.

### Undo Support
All relationship changes support undo/redo (Ctrl/Cmd+Z) for safe experimentation.

### Custom Labels
Context menu uses your configured display names for a personalized experience.

## 🚀 Navigation Commands

### Quick Navigation
Navigate to parent or child notes instantly from the command palette. Handles both single and multiple relationship scenarios.

### Smart Selection Modals
When multiple options exist, intuitive modals with keyboard navigation and full path display help you choose the right note.

### Keyboard Shortcuts
All commands support custom keyboard shortcuts. Assign hotkeys via Obsidian's settings for lightning-fast navigation.

### Sidebar Control
Commands to show parent trees, child trees, full lineage, or toggle the sidebar visibility.

## 🔬 Advanced Navigation & Analysis

### Relationship Discovery
Explore extended relationships like siblings (shared parents) and cousins (same hierarchical level in different branches).

### Graph Analysis
Understand your vault structure with commands to show root notes, leaf notes, and comprehensive graph statistics.

### Shortest Path Finding
Discover how any two notes are connected using breadth-first search algorithms.

### Validation & Export
Check graph health with cycle detection and broken link validation. Export ancestor trees as formatted markdown.

### Interactive Results
All analysis commands use filterable, clickable result modals with real-time search and keyboard navigation.

### Multi-Field Support
Every advanced command works per parent field, allowing independent analysis of different relationship types.

## 🎨 User Experience Features

### Responsive Design
Works seamlessly across different screen sizes and Obsidian layouts.

### Dark/Light Mode Support
Automatically adapts to your Obsidian theme preferences.

### Performance Optimized
Efficient algorithms handle large vaults with thousands of notes and complex relationship graphs.

### Error Handling
Clear error messages and graceful fallbacks when issues occur.

### Accessibility
Keyboard navigation, screen reader support, and intuitive interaction patterns.

## 🔧 Technical Features

### TypeScript API
Comprehensive programmatic API for custom integrations and advanced workflows.

### Cycle Detection Algorithm
Three-color depth-first search ensures efficient cycle detection without performance penalties.

### Incremental Updates
Graph updates automatically when notes are created, modified, or renamed.

### Validation System
Built-in validation ensures configuration integrity and prevents common errors.

### Extensible Architecture
Modular design allows for future enhancements and customizations.

## 📊 Use Cases

### **Project Management**
Track project hierarchies, sub-projects, and deliverables. Use multiple fields for different organizational dimensions.

### **Knowledge Base**
Build deep knowledge hierarchies with Zettelkasten-style linking. Navigate complex topic relationships effortlessly.

### **Research Organization**
Manage research notes with topic hierarchies, related works, and citation networks.

### **Content Creation**
Organize blog posts, articles, or documentation by topic, series, and category relationships.

### **Personal Knowledge Management**
Create flexible note hierarchies that adapt to your thinking and organizational style.

### **Team Collaboration**
Share relationship configurations and maintain consistent organizational structures across team members.

## 🚀 Getting Started

Ready to explore your note relationships? Start with our [Getting Started guide](./getting-started.md) or dive into [Configuration](./guide/configuration.md) to customize Relation Explorer for your workflow.

Each feature is designed to work together seamlessly, giving you powerful tools to understand and navigate the connections between your notes. Whether you're a researcher, project manager, or knowledge worker, Relation Explorer adapts to your needs and grows with your vault.