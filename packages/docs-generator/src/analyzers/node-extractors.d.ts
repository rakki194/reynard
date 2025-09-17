import * as ts from "typescript";
import type { ApiInfo, ApiParameter, ApiReturn } from "../config/types/api";
export declare const isExportedDeclaration: (node: ts.Node) => boolean;
export declare const extractParameters: (node: ts.FunctionDeclaration | ts.MethodDeclaration, checker: ts.TypeChecker) => ApiParameter[];
export declare const extractReturnType: (node: ts.FunctionDeclaration | ts.MethodDeclaration) => ApiReturn | undefined;
export declare const extractApiInfo: (node: ts.Node, sourceFile: ts.SourceFile, checker: ts.TypeChecker) => ApiInfo | null;
