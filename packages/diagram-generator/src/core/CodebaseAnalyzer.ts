/**
 * 🦊 Reynard Codebase Analyzer
 *
 * Analyzes the Reynard codebase to extract reusable components,
 * dependencies, and relationships for diagram generation.
 */

import { readFile, readdir, stat } from "fs/promises";
import { join, relative, extname, basename } from "path";
// Simplified architecture definition for testing
const REYNARD_ARCHITECTURE = {
  directories: [
    {
      name: "packages",
      path: "packages",
      category: "source",
      importance: "critical",
    },
    {
      name: "backend",
      path: "backend",
      category: "source",
      importance: "critical",
    },
    {
      name: "docs",
      path: "docs",
      category: "documentation",
      importance: "critical",
    },
  ],
};
import type {
  CodebaseAnalysis,
  PackageAnalysis,
  ComponentAnalysis,
  FileAnalysis,
  DependencyAnalysis,
  FileStructureAnalysis,
  DirectoryNode,
  RelationshipAnalysis,
  ComponentRelationship,
} from "../types.js";

export class CodebaseAnalyzer {
  private rootPath: string;
  private architecture = REYNARD_ARCHITECTURE;

  constructor(rootPath: string = "/home/kade/runeset/reynard") {
    this.rootPath = rootPath;
  }

  /**
   * Analyze the entire codebase
   */
  async analyzeCodebase(): Promise<CodebaseAnalysis> {
    console.log("🔍 Analyzing Reynard codebase...");

    const packages = await this.analyzePackages();
    const dependencies = await this.analyzeDependencies();
    const components = await this.analyzePackageComponents(packages);
    const fileStructure = await this.analyzeFileStructure();
    const relationships = await this.analyzeRelationships(packages, components);

    console.log(`✅ Analysis complete: ${packages.length} packages, ${components.length} components`);

    return {
      packages,
      dependencies,
      components,
      fileStructure,
      relationships,
    };
  }

  /**
   * Analyze all packages in the codebase
   */
  private async analyzePackages(): Promise<PackageAnalysis[]> {
    const packages: PackageAnalysis[] = [];

    for (const dir of this.architecture.directories) {
      if (dir.category === "source" && dir.importance !== "excluded") {
        const packageAnalysis = await this.analyzePackage(dir.path, dir);
        if (packageAnalysis) {
          packages.push(packageAnalysis);
        }
      }
    }

    return packages;
  }

  /**
   * Analyze a single package
   */
  private async analyzePackage(packagePath: string, dirInfo: any): Promise<PackageAnalysis | null> {
    try {
      const fullPath = join(this.rootPath, packagePath);
      const packageJsonPath = join(fullPath, "package.json");

      // Check if it's a Node.js package
      let packageJson: any = null;
      try {
        const packageJsonContent = await readFile(packageJsonPath, "utf-8");
        packageJson = JSON.parse(packageJsonContent);
      } catch {
        // Not a Node.js package, skip
        return null;
      }

      const components = await this.analyzePackageComponentsFromPath(fullPath);
      const files = await this.analyzePackageFiles(fullPath);

      return {
        name: packageJson.name || basename(packagePath),
        path: packagePath,
        type: dirInfo.category as any,
        importance: dirInfo.importance as any,
        dependencies: this.extractDependencies(packageJson),
        exports: this.extractExports(packageJson),
        components,
        files,
      };
    } catch (error) {
      console.warn(`⚠️ Failed to analyze package ${packagePath}:`, error);
      return null;
    }
  }

  /**
   * Analyze components within a package
   */
  private async analyzePackageComponentsFromPath(packagePath: string): Promise<ComponentAnalysis[]> {
    const components: ComponentAnalysis[] = [];
    const srcPath = join(packagePath, "src");

    try {
      await this.analyzeDirectoryForComponents(srcPath, components, packagePath);
    } catch (error) {
      // Package might not have src directory
    }

    return components;
  }

  /**
   * Recursively analyze directory for components
   */
  private async analyzeDirectoryForComponents(
    dirPath: string,
    components: ComponentAnalysis[],
    packagePath: string
  ): Promise<void> {
    try {
      const entries = await readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(dirPath, entry.name);

        if (entry.isDirectory()) {
          await this.analyzeDirectoryForComponents(fullPath, components, packagePath);
        } else if (entry.isFile() && this.isSourceFile(entry.name)) {
          const component = await this.analyzeFileForComponents(fullPath, packagePath);
          if (component) {
            components.push(component);
          }
        }
      }
    } catch (error) {
      // Directory might not exist or be accessible
    }
  }

  /**
   * Analyze a file for components
   */
  private async analyzeFileForComponents(filePath: string, packagePath: string): Promise<ComponentAnalysis | null> {
    try {
      const content = await readFile(filePath, "utf-8");
      const relativePath = relative(packagePath, filePath);
      const fileName = basename(filePath, extname(filePath));

      // Extract exports and imports
      const exports = this.extractFileExports(content);
      const imports = this.extractFileImports(content);
      const dependencies = this.extractFileDependencies(content);

      // Determine component type based on file content and name
      const componentType = this.determineComponentType(content, fileName);

      // Calculate complexity
      const complexity = this.calculateComplexity(content);

      // Extract relationships
      const relationships = this.extractComponentRelationships(content, imports, exports);

      return {
        name: fileName,
        type: componentType,
        filePath: relativePath,
        exports,
        dependencies,
        relationships,
        complexity,
      };
    } catch (error) {
      console.warn(`⚠️ Failed to analyze file ${filePath}:`, error);
      return null;
    }
  }

  /**
   * Analyze files within a package
   */
  private async analyzePackageFiles(packagePath: string): Promise<FileAnalysis[]> {
    const files: FileAnalysis[] = [];

    try {
      await this.analyzeDirectoryForFiles(packagePath, files, packagePath);
    } catch (error) {
      console.warn(`⚠️ Failed to analyze files in ${packagePath}:`, error);
    }

    return files;
  }

  /**
   * Recursively analyze directory for files
   */
  private async analyzeDirectoryForFiles(dirPath: string, files: FileAnalysis[], packagePath: string): Promise<void> {
    try {
      const entries = await readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(dirPath, entry.name);

        if (entry.isDirectory() && !this.shouldSkipDirectory(entry.name)) {
          await this.analyzeDirectoryForFiles(fullPath, files, packagePath);
        } else if (entry.isFile()) {
          const fileAnalysis = await this.analyzeFile(fullPath, packagePath);
          if (fileAnalysis) {
            files.push(fileAnalysis);
          }
        }
      }
    } catch (error) {
      // Directory might not be accessible
    }
  }

  /**
   * Analyze a single file
   */
  private async analyzeFile(filePath: string, packagePath: string): Promise<FileAnalysis | null> {
    try {
      const stats = await stat(filePath);
      const relativePath = relative(packagePath, filePath);
      const fileType = extname(filePath).slice(1);

      let exports: string[] = [];
      let imports: string[] = [];
      let _dependencies: string[] = [];
      let lines = 0;

      if (this.isSourceFile(filePath)) {
        const fileContent = await readFile(filePath, "utf-8");
        exports = this.extractFileExports(fileContent);
        imports = this.extractFileImports(fileContent);
        _dependencies = this.extractFileDependencies(fileContent);
        lines = fileContent.split("\n").length;
      }

      return {
        path: relativePath,
        type: fileType,
        size: stats.size,
        lines,
        exports,
        imports,
        dependencies: _dependencies,
      };
    } catch (error) {
      console.warn(`⚠️ Failed to analyze file ${filePath}:`, error);
      return null;
    }
  }

  /**
   * Analyze global dependencies
   */
  private async analyzeDependencies(): Promise<DependencyAnalysis[]> {
    const dependencies: DependencyAnalysis[] = [];
    const dependencyMap = new Map<string, DependencyAnalysis>();

    // Analyze root package.json
    try {
      const rootPackageJsonPath = join(this.rootPath, "package.json");
      const rootPackageJson = JSON.parse(await readFile(rootPackageJsonPath, "utf-8"));

      this.analyzePackageJsonDependencies(rootPackageJson, dependencyMap, "root");
    } catch (error) {
      console.warn("⚠️ Failed to analyze root package.json:", error);
    }

    // Analyze package dependencies
    for (const dir of this.architecture.directories) {
      if (dir.category === "source") {
        try {
          const packageJsonPath = join(this.rootPath, dir.path, "package.json");
          const packageJson = JSON.parse(await readFile(packageJsonPath, "utf-8"));

          this.analyzePackageJsonDependencies(packageJson, dependencyMap, dir.path);
        } catch (error) {
          // Package might not have package.json
        }
      }
    }

    return Array.from(dependencyMap.values());
  }

  /**
   * Analyze file structure
   */
  private async analyzeFileStructure(): Promise<FileStructureAnalysis> {
    const rootDirectories = this.architecture.directories
      .filter(dir => dir.importance !== "excluded")
      .map(dir => dir.path);

    const structure = await this.buildDirectoryTree(this.rootPath, "");
    const fileTypeDistribution = await this.calculateFileTypeDistribution(structure);

    return {
      rootDirectories,
      structure,
      totalFiles: this.countFiles(structure),
      totalDirectories: this.countDirectories(structure),
      fileTypeDistribution,
    };
  }

  /**
   * Analyze relationships between components
   */
  private async analyzeRelationships(
    packages: PackageAnalysis[],
    components: ComponentAnalysis[]
  ): Promise<RelationshipAnalysis[]> {
    const relationships: RelationshipAnalysis[] = [];

    // Analyze package relationships
    for (const pkg of packages) {
      for (const dep of pkg.dependencies) {
        relationships.push({
          source: pkg.name,
          target: dep,
          type: "depends",
          strength: 1,
          description: `${pkg.name} depends on ${dep}`,
        });
      }
    }

    // Analyze component relationships
    for (const component of components) {
      for (const dep of component.dependencies) {
        relationships.push({
          source: component.name,
          target: dep,
          type: "imports",
          strength: 1,
          description: `${component.name} imports ${dep}`,
        });
      }
    }

    return relationships;
  }

  // Helper methods

  private isSourceFile(fileName: string): boolean {
    const ext = extname(fileName).toLowerCase();
    return [".ts", ".tsx", ".js", ".jsx", ".py"].includes(ext);
  }

  private shouldSkipDirectory(dirName: string): boolean {
    return ["node_modules", "dist", "build", ".git", "__pycache__", "venv"].includes(dirName);
  }

  private extractDependencies(packageJson: any): string[] {
    const deps = [
      ...Object.keys(packageJson.dependencies || {}),
      ...Object.keys(packageJson.devDependencies || {}),
      ...Object.keys(packageJson.peerDependencies || {}),
    ];
    return deps.filter(dep => !dep.startsWith("reynard-"));
  }

  private extractExports(packageJson: any): string[] {
    if (packageJson.exports) {
      if (typeof packageJson.exports === "string") {
        return [packageJson.exports];
      } else if (typeof packageJson.exports === "object") {
        return Object.keys(packageJson.exports);
      }
    }
    return [];
  }

  private extractFileExports(content: string): string[] {
    const exports: string[] = [];

    // Match export statements
    const exportRegex = /export\s+(?:default\s+)?(?:const|let|var|function|class|interface|type|enum)\s+(\w+)/g;
    let match;
    while ((match = exportRegex.exec(content)) !== null) {
      exports.push(match[1]);
    }

    // Match named exports
    const namedExportRegex = /export\s*{\s*([^}]+)\s*}/g;
    while ((match = namedExportRegex.exec(content)) !== null) {
      const namedExports = match[1].split(",").map(exp => exp.trim().split(" as ")[0]);
      exports.push(...namedExports);
    }

    return exports;
  }

  private extractFileImports(content: string): string[] {
    const imports: string[] = [];

    // Match import statements
    const importRegex = /import\s+(?:.*\s+from\s+)?['"]([^'"]+)['"]/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }

    return imports;
  }

  private extractFileDependencies(_content: string): string[] {
    const _dependencies: string[] = [];

    // Match require statements
    const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
    let match;
    while ((match = requireRegex.exec(_content)) !== null) {
      _dependencies.push(match[1]);
    }

    return _dependencies;
  }

  private determineComponentType(content: string, fileName: string): ComponentAnalysis["type"] {
    if (content.includes("class ")) return "class";
    if (content.includes("interface ")) return "interface";
    if (content.includes("type ")) return "type";
    if (content.includes("enum ")) return "enum";
    if (content.includes("const ") && content.includes("=")) return "constant";
    if (content.includes("function ")) return "function";
    if (content.includes("use") && fileName.includes("use")) return "hook";
    if (content.includes("composable") || fileName.includes("composable")) return "composable";
    if (content.includes("service") || fileName.includes("service")) return "service";
    if (fileName.includes("util") || fileName.includes("helper")) return "utility";

    return "function";
  }

  private calculateComplexity(content: string): number {
    const lines = content.split("\n");
    let complexity = 0;

    // Count control structures
    const controlStructures = ["if", "else", "for", "while", "switch", "case", "catch", "try"];
    for (const structure of controlStructures) {
      const regex = new RegExp(`\\b${structure}\\b`, "g");
      const matches = content.match(regex);
      if (matches) complexity += matches.length;
    }

    // Count functions and classes
    const functions = content.match(/\bfunction\b/g);
    const classes = content.match(/\bclass\b/g);
    const methods = content.match(/\w+\s*\([^)]*\)\s*{/g);

    complexity += (functions?.length || 0) * 2;
    complexity += (classes?.length || 0) * 3;
    complexity += methods?.length || 0;

    return Math.max(1, complexity);
  }

  private extractComponentRelationships(
    _content: string,
    imports: string[],
    _exports: string[]
  ): ComponentRelationship[] {
    const relationships: ComponentRelationship[] = [];

    for (const imp of imports) {
      relationships.push({
        component: imp,
        type: "imports",
        strength: 1,
        description: `Imports from ${imp}`,
      });
    }

    return relationships;
  }

  private analyzePackageJsonDependencies(
    packageJson: any,
    dependencyMap: Map<string, DependencyAnalysis>,
    packagePath: string
  ): void {
    const allDeps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
      ...packageJson.peerDependencies,
    };

    for (const [name, version] of Object.entries(allDeps)) {
      const existing = dependencyMap.get(name);
      if (existing) {
        existing.usageCount++;
        existing.packages.push(packagePath);
      } else {
        dependencyMap.set(name, {
          name,
          type: packageJson.dependencies?.[name] ? "external" : "dev",
          version: version as string,
          usageCount: 1,
          packages: [packagePath],
        });
      }
    }
  }

  private async buildDirectoryTree(rootPath: string, relativePath: string): Promise<DirectoryNode> {
    const fullPath = join(rootPath, relativePath);
    const entries = await readdir(fullPath, { withFileTypes: true });

    const children: DirectoryNode[] = [];
    const files: FileAnalysis[] = [];

    for (const entry of entries) {
      if (entry.isDirectory() && !this.shouldSkipDirectory(entry.name)) {
        const childPath = join(relativePath, entry.name);
        const child = await this.buildDirectoryTree(rootPath, childPath);
        children.push(child);
      } else if (entry.isFile()) {
        const filePath = join(relativePath, entry.name);
        const fileAnalysis = await this.analyzeFile(join(rootPath, filePath), rootPath);
        if (fileAnalysis) {
          files.push(fileAnalysis);
        }
      }
    }

    return {
      name: basename(relativePath) || "root",
      path: relativePath,
      type: "directory",
      children,
      files,
      metadata: {},
    };
  }

  private async calculateFileTypeDistribution(structure: DirectoryNode): Promise<Record<string, number>> {
    const distribution: Record<string, number> = {};

    const countFiles = (node: DirectoryNode) => {
      for (const file of node.files) {
        distribution[file.type] = (distribution[file.type] || 0) + 1;
      }
      for (const child of node.children) {
        countFiles(child);
      }
    };

    countFiles(structure);
    return distribution;
  }

  private async analyzePackageComponents(packages: PackageAnalysis[]): Promise<ComponentAnalysis[]> {
    const components: ComponentAnalysis[] = [];

    for (const pkg of packages) {
      components.push(...pkg.components);
    }

    return components;
  }

  private countFiles(node: DirectoryNode): number {
    let count = node.files.length;
    for (const child of node.children) {
      count += this.countFiles(child);
    }
    return count;
  }

  private countDirectories(node: DirectoryNode): number {
    let count = 1; // Count this directory
    for (const child of node.children) {
      count += this.countDirectories(child);
    }
    return count;
  }
}
