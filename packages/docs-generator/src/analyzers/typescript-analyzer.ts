/**
 * @fileoverview TypeScript analyzer for extracting API documentation
 */

import * as ts from "typescript";
import { ApiInfo } from "../config/types/api";
import { PackageInfo } from "../config/types/package";
import { findTypeScriptFiles } from "./ts-file-finder";
import { isExportedDeclaration, extractApiInfo } from "./node-extractors";

export class TypeScriptAnalyzer {
  private program: ts.Program | null = null;
  private checker: ts.TypeChecker | null = null;

  async analyze(packageInfo: PackageInfo): Promise<ApiInfo[]> {
    const apiInfo: ApiInfo[] = [];

    try {
      const tsFiles = await findTypeScriptFiles(packageInfo.path);
      console.log(
        `🔍 TypeScript Analyzer: Found ${tsFiles.length} TypeScript files in ${packageInfo.name}`,
      );
      if (tsFiles.length > 0) {
        console.log(
          `📁 TypeScript files: ${tsFiles.slice(0, 5).join(", ")}${tsFiles.length > 5 ? "..." : ""}`,
        );
      }
      if (tsFiles.length === 0) return apiInfo;

      this.program = ts.createProgram(tsFiles, {
        target: ts.ScriptTarget.ES2020,
        module: ts.ModuleKind.ESNext,
        moduleResolution: ts.ModuleResolutionKind.NodeJs,
        allowSyntheticDefaultImports: true,
        esModuleInterop: true,
        skipLibCheck: true,
        strict: true,
        declaration: true,
        declarationMap: true,
      });

      this.checker = this.program.getTypeChecker();

      for (const sourceFile of this.program.getSourceFiles()) {
        if (!tsFiles.includes(sourceFile.fileName)) continue;
        const fileApiInfo = this.analyzeSourceFile(sourceFile);
        console.log(
          `📄 Analyzed ${sourceFile.fileName}: found ${fileApiInfo.length} API items`,
        );
        apiInfo.push(...fileApiInfo);
      }
    } catch (error) {
      console.warn(
        `Warning: Failed to analyze TypeScript files for ${packageInfo.name}:`,
        error,
      );
    }

    return apiInfo;
  }

  private analyzeSourceFile(sourceFile: ts.SourceFile): ApiInfo[] {
    if (!this.checker) return [];
    const found: ApiInfo[] = [];

    const visit = (node: ts.Node) => {
      if (isExportedDeclaration(node)) {
        const info = extractApiInfo(node, sourceFile, this.checker!);
        if (info) found.push(info);
      }
      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
    return found;
  }
}
