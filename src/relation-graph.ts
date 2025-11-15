import { App, TFile } from 'obsidian';
import { CycleDetector, CycleInfo } from './cycle-detector';

export interface NodeInfo {
  file: TFile;
  parents: TFile[];
  children: TFile[];
}

export class RelationGraph {
  private graph = new Map<string, NodeInfo>();
  private cycleDetector!: CycleDetector;
  
  constructor(private app: App, private parentField: string) {}

  build() {
    const files = this.app.vault.getMarkdownFiles();
    this.graph.clear();

    files.forEach(file => {
      const meta = this.app.metadataCache.getFileCache(file);
      const parentLinks = this.extractParentLinks(meta);
      this.graph.set(file.path, { file, parents: parentLinks, children: [] });
    });

    for (const node of this.graph.values()) {
      node.parents.forEach(parent => {
        this.graph.get(parent.path)?.children.push(node.file);
      });
    }

    // Initialize cycle detector after graph is built
    this.cycleDetector = new CycleDetector(this);
  }

  extractParentLinks(meta: any): TFile[] {
    const field = meta?.frontmatter?.[this.parentField];
    if (!field) return [];
    const arr = Array.isArray(field) ? field : [field];
    return arr.map(ref => this.resolveLink(ref, meta)).filter(Boolean) as TFile[];
  }

  resolveLink(ref: string, meta: any): TFile | null {
    return this.app.metadataCache.getFirstLinkpathDest(ref, meta?.path) || null;
  }

  getParents(file: TFile): TFile[] {
    return this.graph.get(file.path)?.parents || [];
  }

  getChildren(file: TFile): TFile[] {
    return this.graph.get(file.path)?.children || [];
  }

  /**
   * Gets all files in the graph.
   *
   * @returns Array of all TFile objects in the graph
   */
  getAllFiles(): TFile[] {
    return Array.from(this.graph.values()).map(node => node.file);
  }

  /**
   * Detects if there is a cycle involving the specified file.
   *
   * @param file - The file to check for cycles
   * @returns CycleInfo if a cycle is found, null otherwise
   */
  detectCycle(file: TFile): CycleInfo | null {
    return this.cycleDetector.detectCycle(file);
  }

  /**
   * Gets detailed information about a cycle involving the specified file.
   *
   * @param file - The file to check
   * @returns CycleInfo with cycle path details, or null if no cycle
   */
  getCycleInfo(file: TFile): CycleInfo | null {
    return this.cycleDetector.getCycleInfo(file);
  }

  /**
   * Checks if the graph contains any cycles.
   *
   * @returns true if any cycle exists in the graph
   */
  hasCycles(): boolean {
    return this.cycleDetector.hasCycles();
  }
}