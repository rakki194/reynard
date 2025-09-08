/**
 * @fileoverview TypeScript analyzer for extracting API documentation
 */

import * as ts from 'typescript';
import { promises as fs } from 'fs';
import path from 'path';
import { ApiInfo, ApiParameter, ApiReturn, PackageInfo } from '../config';

/**
 * Analyzes TypeScript source files and extracts API documentation
 */
export class TypeScriptAnalyzer {
  private program: ts.Program | null = null;
  private checker: ts.TypeChecker | null = null;

  /**
   * Analyze TypeScript files in a package
   */
  async analyze(packageInfo: PackageInfo): Promise<ApiInfo[]> {
    const apiInfo: ApiInfo[] = [];

    try {
      // Find TypeScript files
      const tsFiles = await this.findTypeScriptFiles(packageInfo.path);
      
      if (tsFiles.length === 0) {
        return apiInfo;
      }

      // Create TypeScript program
      this.program = ts.createProgram(tsFiles, {
        target: ts.ScriptTarget.ES2020,
        module: ts.ModuleKind.ESNext,
        moduleResolution: ts.ModuleResolutionKind.NodeJs,
        allowSyntheticDefaultImports: true,
        esModuleInterop: true,
        skipLibCheck: true,
        strict: true,
        declaration: true,
        declarationMap: true
      });

      this.checker = this.program.getTypeChecker();

      // Analyze each source file
      for (const sourceFile of this.program.getSourceFiles()) {
        if (tsFiles.includes(sourceFile.fileName)) {
          const fileApiInfo = this.analyzeSourceFile(sourceFile);
          apiInfo.push(...fileApiInfo);
        }
      }

    } catch (error) {
      console.warn(`Warning: Failed to analyze TypeScript files for ${packageInfo.name}:`, error);
    }

    return apiInfo;
  }

  /**
   * Find TypeScript files in a directory
   */
  private async findTypeScriptFiles(dir: string): Promise<string[]> {
    const files: string[] = [];
    
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
          const subFiles = await this.findTypeScriptFiles(fullPath);
          files.push(...subFiles);
        } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Ignore errors
    }
    
    return files;
  }

  /**
   * Analyze a TypeScript source file
   */
  private analyzeSourceFile(sourceFile: ts.SourceFile): ApiInfo[] {
    const apiInfo: ApiInfo[] = [];

    const visit = (node: ts.Node) => {
      // Analyze exported declarations
      if (this.isExportedDeclaration(node)) {
        const info = this.extractApiInfo(node, sourceFile);
        if (info) {
          apiInfo.push(info);
        }
      }

      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
    return apiInfo;
  }

  /**
   * Check if a declaration is exported
   */
  private isExportedDeclaration(node: ts.Node): boolean {
    // Check for export modifier
    if (ts.canHaveModifiers(node) && ts.getCombinedModifierFlags(node as any) & ts.ModifierFlags.Export) {
      return true;
    }

    // Check for export assignment
    if (ts.isExportAssignment(node)) {
      return true;
    }

    // Check for export declaration
    if (ts.isExportDeclaration(node)) {
      return true;
    }

    return false;
  }

  /**
   * Extract API information from a TypeScript node
   */
  private extractApiInfo(node: ts.Node, sourceFile: ts.SourceFile): ApiInfo | null {
    if (!this.checker) return null;

    const symbol = this.checker.getSymbolAtLocation(node);
    if (!symbol) return null;

    const name = symbol.getName();
    // const type = this.checker.getTypeOfSymbolAtLocation(symbol, node);
    const description = this.getJSDocDescription(symbol);

    let apiType: ApiInfo['type'];
    let parameters: ApiParameter[] = [];
    let returns: ApiReturn | undefined;

    if (ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node)) {
      apiType = 'function';
      parameters = this.extractParameters(node);
      returns = this.extractReturnType(node);
    } else if (ts.isClassDeclaration(node)) {
      apiType = 'class';
    } else if (ts.isInterfaceDeclaration(node)) {
      apiType = 'interface';
    } else if (ts.isTypeAliasDeclaration(node)) {
      apiType = 'type';
    } else if (ts.isEnumDeclaration(node)) {
      apiType = 'enum';
    } else if (ts.isModuleDeclaration(node)) {
      apiType = 'namespace';
    } else if (ts.isVariableDeclaration(node)) {
      apiType = 'variable';
    } else {
      return null;
    }

    return {
      name,
      type: apiType,
      description: description || '',
      parameters,
      returns,
      examples: this.extractExamples(symbol),
      deprecated: this.isDeprecated(symbol),
      since: this.extractSince(symbol),
      tags: this.extractTags(symbol),
      source: {
        file: sourceFile.fileName,
        line: sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1,
        column: sourceFile.getLineAndCharacterOfPosition(node.getStart()).character + 1
      }
    };
  }

  /**
   * Extract function parameters
   */
  private extractParameters(node: ts.FunctionDeclaration | ts.MethodDeclaration): ApiParameter[] {
    if (!node.parameters) return [];

    return node.parameters.map(param => {
      const name = param.name.getText();
      const type = param.type ? param.type.getText() : 'any';
      const description = this.getJSDocDescription((param as any).symbol);
      const required = !param.questionToken && !param.initializer;
      const rest = !!param.dotDotDotToken;

      return {
        name,
        type,
        description: description || '',
        required,
        optional: !required,
        rest
      };
    });
  }

  /**
   * Extract return type
   */
  private extractReturnType(node: ts.FunctionDeclaration | ts.MethodDeclaration): ApiReturn | undefined {
    if (!node.type) return undefined;

    const type = node.type.getText();
    const description = this.getJSDocReturnDescription((node as any).symbol);

    return {
      type,
      description: description || ''
    };
  }

  /**
   * Get JSDoc description from symbol
   */
  private getJSDocDescription(symbol: ts.Symbol | undefined): string | undefined {
    if (!symbol) return undefined;

    const comments = symbol.getDocumentationComment(this.checker!);
    if (comments.length > 0) {
      return comments.map(comment => comment.text).join('\n');
    }

    return undefined;
  }

  /**
   * Get JSDoc return description
   */
  private getJSDocReturnDescription(symbol: ts.Symbol | undefined): string | undefined {
    if (!symbol) return undefined;

    const tags = symbol.getJsDocTags();
    const returnTag = tags.find(tag => tag.name === 'returns' || tag.name === 'return');
    
    if (returnTag && returnTag.text) {
      return Array.isArray(returnTag.text) 
        ? returnTag.text.map(text => text.text).join(' ')
        : returnTag.text;
    }

    return undefined;
  }

  /**
   * Extract examples from JSDoc
   */
  private extractExamples(symbol: ts.Symbol | undefined): string[] {
    if (!symbol) return [];

    const tags = symbol.getJsDocTags();
    const exampleTags = tags.filter(tag => tag.name === 'example');
    
    return exampleTags.map(tag => {
      if (tag.text && Array.isArray(tag.text)) {
        return tag.text.map(text => text.text).join('\n');
      }
      return tag.text || '';
    });
  }

  /**
   * Check if symbol is deprecated
   */
  private isDeprecated(symbol: ts.Symbol | undefined): boolean {
    if (!symbol) return false;

    const tags = symbol.getJsDocTags();
    return tags.some(tag => tag.name === 'deprecated');
  }

  /**
   * Extract since version from JSDoc
   */
  private extractSince(symbol: ts.Symbol | undefined): string | undefined {
    if (!symbol) return undefined;

    const tags = symbol.getJsDocTags();
    const sinceTag = tags.find(tag => tag.name === 'since');
    
    if (sinceTag && sinceTag.text) {
      return Array.isArray(sinceTag.text) 
        ? sinceTag.text.map(text => text.text).join(' ')
        : sinceTag.text;
    }

    return undefined;
  }

  /**
   * Extract tags from JSDoc
   */
  private extractTags(symbol: ts.Symbol | undefined): string[] {
    if (!symbol) return [];

    const tags = symbol.getJsDocTags();
    return tags.map(tag => tag.name);
  }
}
