import { App, Modal, Setting, setIcon } from 'obsidian';
import { ParentFieldConfig, SectionConfig } from '../types';

/**
 * Modal for editing a single parent field configuration.
 */
export class ParentFieldEditModal extends Modal {
  private config: ParentFieldConfig;
  private onSave: (config: ParentFieldConfig) => void;
  private sectionCollapsedStates: Map<string, boolean> = new Map();

  constructor(
    app: App,
    config: ParentFieldConfig,
    onSave: (config: ParentFieldConfig) => void
  ) {
    super(app);
    this.config = JSON.parse(JSON.stringify(config)); // Deep copy
    this.onSave = onSave;
  }

  onOpen(): void {
    const { contentEl, titleEl } = this;
    titleEl.setText('Edit Parent Field Configuration');

    // Create modal layout structure
    const modalContainer = contentEl.createDiv('parent-field-edit-container');

    // Header with field settings (always visible)
    const headerEl = modalContainer.createDiv('parent-field-edit-header');
    this.renderFieldSettings(headerEl);

    // Scrollable content with sections
    const contentWrapper = modalContainer.createDiv('parent-field-edit-content');
    this.renderSections(contentWrapper);

    // Footer with buttons (always visible)
    const footerEl = modalContainer.createDiv('parent-field-edit-footer');

    const cancelBtn = footerEl.createEl('button', {
      text: 'Cancel',
      cls: 'mod-secondary'
    });
    cancelBtn.onclick = () => this.close();

    const saveBtn = footerEl.createEl('button', {
      text: 'Save',
      cls: 'mod-cta'
    });
    saveBtn.onclick = () => {
      this.onSave(this.config);
      this.close();
    };
  }

  private renderSections(containerEl: HTMLElement): void {
    // Ensure sectionOrder exists
    if (!this.config.sectionOrder) {
      this.config.sectionOrder = ['reference', 'roots', 'ancestors', 'descendants', 'siblings'];
    }

    // Render sections in the configured order
    this.config.sectionOrder.forEach((sectionKey, index) => {
      if (sectionKey === 'reference') {
        this.renderReferenceSection(containerEl, index);
      } else if (sectionKey === 'roots' || sectionKey === 'ancestors' || sectionKey === 'descendants' || sectionKey === 'siblings') {
        const titleMap = {
          'roots': 'Roots Section',
          'ancestors': 'Ancestors Section',
          'descendants': 'Descendants Section',
          'siblings': 'Siblings Section'
        };
        this.renderSectionConfig(containerEl, sectionKey, titleMap[sectionKey], index);
      }
    });
  }

  private renderFieldSettings(containerEl: HTMLElement): void {
    new Setting(containerEl)
      .setName('Field Name')
      .setDesc('The frontmatter field name (e.g., "parent", "project")')
      .addText(text => {
        text.setValue(this.config.name);
        text.setPlaceholder('parent');
        text.onChange(value => {
          this.config.name = value;
        });
      });

    new Setting(containerEl)
      .setName('Display Name')
      .setDesc('Optional friendly name for UI (defaults to field name)')
      .addText(text => {
        text.setValue(this.config.displayName || '');
        text.setPlaceholder(this.config.name || 'Parent');
        text.onChange(value => {
          this.config.displayName = value || undefined;
        });
      });
  }

  private renderSectionConfig(
    containerEl: HTMLElement,
    sectionKey: 'roots' | 'ancestors' | 'descendants' | 'siblings',
    sectionTitle: string,
    orderIndex: number
  ): void {
    // Use native <details>/<summary> for collapsible sections
    const detailsEl = containerEl.createEl('details', { cls: 'section-config-modal' });
    const summaryEl = detailsEl.createEl('summary', { cls: 'section-config-header' });

    // Get section config
    const config = this.config[sectionKey];

    // Set initial open state
    const sectionCollapsed = this.sectionCollapsedStates.get(sectionKey) ?? true;
    if (!sectionCollapsed) {
      detailsEl.setAttribute('open', '');
    }

    // Title
    const titleEl = summaryEl.createEl('span', { text: sectionTitle, cls: 'section-title' });

    // Controls container
    const controlsEl = summaryEl.createDiv('section-controls');

    // Visibility toggle (eye icon)
    const visibilityIcon = controlsEl.createSpan('section-config-visibility-icon');
    setIcon(visibilityIcon, config.visible ? 'eye' : 'eye-off');
    visibilityIcon.setAttribute('aria-label', config.visible ? 'Hide section' : 'Show section');
    visibilityIcon.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      config.visible = !config.visible;
      setIcon(visibilityIcon, config.visible ? 'eye' : 'eye-off');
      visibilityIcon.setAttribute('aria-label', config.visible ? 'Hide section' : 'Show section');
    };

    // Reorder buttons container
    const reorderContainer = controlsEl.createDiv('section-reorder-buttons');

    // Up arrow
    const upBtn = reorderContainer.createEl('button', {
      cls: 'clickable-icon'
    });
    setIcon(upBtn, 'arrow-up');
    upBtn.setAttribute('aria-label', 'Move section up');
    upBtn.disabled = orderIndex === 0;
    upBtn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.moveSectionUp(orderIndex);
    };

    // Down arrow
    const downBtn = reorderContainer.createEl('button', {
      cls: 'clickable-icon'
    });
    setIcon(downBtn, 'arrow-down');
    downBtn.setAttribute('aria-label', 'Move section down');
    downBtn.disabled = orderIndex === (this.config.sectionOrder?.length ?? 1) - 1;
    downBtn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.moveSectionDown(orderIndex);
    };

    // Track open/closed state
    detailsEl.addEventListener('toggle', () => {
      this.sectionCollapsedStates.set(sectionKey, !detailsEl.hasAttribute('open'));
    });

    // Section content
    const sectionBodyEl = detailsEl.createDiv('section-config-body');

    // Display name
    new Setting(sectionBodyEl)
      .setName('Display Name')
      .setDesc('Name shown in sidebar')
      .addText(text => {
        text.setValue(config.displayName);
        text.setPlaceholder(sectionTitle);
        text.onChange(value => {
          config.displayName = value;
        });
      });

    // Initial collapsed state
    new Setting(sectionBodyEl)
      .setName('Initially Collapsed')
      .setDesc('Start with this section collapsed')
      .addToggle(toggle => {
        toggle.setValue(config.collapsed);
        toggle.onChange(value => {
          config.collapsed = value;
        });
      });

    // Section-specific settings
    if (sectionKey === 'ancestors' || sectionKey === 'descendants') {
      this.renderTreeSectionSettings(sectionBodyEl, config);
    } else if (sectionKey === 'roots') {
      this.renderRootsSectionSettings(sectionBodyEl, config);
    } else if (sectionKey === 'siblings') {
      this.renderSiblingSectionSettings(sectionBodyEl, config);
    }
  }

  private renderTreeSectionSettings(containerEl: HTMLElement, config: SectionConfig): void {
    new Setting(containerEl)
      .setName('Max Depth')
      .setDesc('Maximum depth to traverse (leave empty for unlimited)')
      .addText(text => {
        text.setPlaceholder('5');
        text.setValue(config.maxDepth?.toString() || '');
        text.onChange(value => {
          if (value === '') {
            config.maxDepth = undefined;
          } else {
            const num = parseInt(value);
            config.maxDepth = isNaN(num) ? undefined : Math.max(0, num);
          }
        });
      });

    new Setting(containerEl)
      .setName('Initial Unfold Depth')
      .setDesc('How many levels to show expanded by default (minimum: 1)')
      .addText(text => {
        text.setPlaceholder('2');
        text.setValue(config.initialDepth?.toString() || '');
        text.onChange(value => {
          if (value === '') {
            config.initialDepth = undefined;
          } else {
            const num = parseInt(value);
            config.initialDepth = isNaN(num) ? undefined : Math.max(1, num);
          }
        });
      });
  }

  private renderSiblingSectionSettings(containerEl: HTMLElement, config: SectionConfig): void {
    new Setting(containerEl)
      .setName('Sort Order')
      .setDesc('How to sort sibling items')
      .addDropdown(dropdown => {
        dropdown.addOption('alphabetical', 'Alphabetical');
        dropdown.addOption('created', 'Created Date');
        dropdown.addOption('modified', 'Modified Date');
        dropdown.setValue(config.sortOrder || 'alphabetical');
        dropdown.onChange(value => {
          config.sortOrder = value as 'alphabetical' | 'created' | 'modified';
        });
      });

    new Setting(containerEl)
      .setName('Include Self')
      .setDesc('Include the current file in siblings list')
      .addToggle(toggle => {
        toggle.setValue(config.includeSelf || false);
        toggle.onChange(value => {
          config.includeSelf = value;
        });
      });
  }

  private renderRootsSectionSettings(containerEl: HTMLElement, config: SectionConfig): void {
    new Setting(containerEl)
      .setName('Sort Order')
      .setDesc('How to sort root note items')
      .addDropdown(dropdown => {
        dropdown.addOption('alphabetical', 'Alphabetical');
        dropdown.addOption('created', 'Created Date');
        dropdown.addOption('modified', 'Modified Date');
        dropdown.setValue(config.sortOrder || 'alphabetical');
        dropdown.onChange(value => {
          config.sortOrder = value as 'alphabetical' | 'created' | 'modified';
        });
      });
  }

  private renderReferenceSection(containerEl: HTMLElement, orderIndex: number): void {
    // Use native <details>/<summary> for collapsible sections
    const detailsEl = containerEl.createEl('details', { cls: 'section-config-modal' });
    const summaryEl = detailsEl.createEl('summary', { cls: 'section-config-header' });

    // Set initial open state
    const sectionCollapsed = this.sectionCollapsedStates.get('reference') ?? true;
    if (!sectionCollapsed) {
      detailsEl.setAttribute('open', '');
    }

    // Title
    const titleEl = summaryEl.createEl('span', { text: 'Reference Note Section', cls: 'section-title' });

    // Controls container
    const controlsEl = summaryEl.createDiv('section-controls');

    // Reorder buttons container
    const reorderContainer = controlsEl.createDiv('section-reorder-buttons');

    // Up arrow
    const upBtn = reorderContainer.createEl('button', {
      cls: 'clickable-icon'
    });
    setIcon(upBtn, 'arrow-up');
    upBtn.setAttribute('aria-label', 'Move section up');
    upBtn.disabled = orderIndex === 0;
    upBtn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.moveSectionUp(orderIndex);
    };

    // Down arrow
    const downBtn = reorderContainer.createEl('button', {
      cls: 'clickable-icon'
    });
    setIcon(downBtn, 'arrow-down');
    downBtn.setAttribute('aria-label', 'Move section down');
    downBtn.disabled = orderIndex === (this.config.sectionOrder?.length ?? 1) - 1;
    downBtn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.moveSectionDown(orderIndex);
    };

    // Track open/closed state
    detailsEl.addEventListener('toggle', () => {
      this.sectionCollapsedStates.set('reference', !detailsEl.hasAttribute('open'));
    });

    // Section content
    const sectionBodyEl = detailsEl.createDiv('section-config-body');

    // Description
    const descEl = sectionBodyEl.createDiv('section-description');
    descEl.setText('Displays the current file with a pin button. This section is always visible and cannot be hidden.');
  }

  private toggleSectionCollapse(sectionKey: string): void {
    // No longer needed with <details> elements
  }

  private moveSectionUp(index: number): void {
    if (!this.config.sectionOrder || index === 0) return;

    // Swap with previous item
    const temp = this.config.sectionOrder[index];
    this.config.sectionOrder[index] = this.config.sectionOrder[index - 1];
    this.config.sectionOrder[index - 1] = temp;

    // Refresh
    this.refresh();
  }

  private moveSectionDown(index: number): void {
    if (!this.config.sectionOrder || index === this.config.sectionOrder.length - 1) return;

    // Swap with next item
    const temp = this.config.sectionOrder[index];
    this.config.sectionOrder[index] = this.config.sectionOrder[index + 1];
    this.config.sectionOrder[index + 1] = temp;

    // Refresh
    this.refresh();
  }

  private refresh(): void {
    // For section refresh, we need to re-render the content area
    const modalContainer = this.contentEl.querySelector('.parent-field-edit-container') as HTMLElement;
    if (!modalContainer) return;

    const contentWrapper = modalContainer.querySelector('.parent-field-edit-content') as HTMLElement;
    if (contentWrapper) {
      contentWrapper.empty();
      this.renderSections(contentWrapper);
    }
  }

  onClose(): void {
    const { contentEl } = this;
    contentEl.empty();
  }
}