import * as ts from "typescript";
import type { ApiInfo, ApiParameter, ApiReturn } from "../config/types/api";
import {
  extractExamples,
  extractSince,
  extractTags,
  getJSDocDescription,
  getJSDocReturnDescription,
  isDeprecated,
} from "./jsdoc-utils";

export const isExportedDeclaration = (node: ts.Node): boolean => {
  // Check for export modifier
  if (ts.canHaveModifiers(node) && ts.getCombinedModifierFlags(node as any) & ts.ModifierFlags.Export) {
    return true;
  }

  // Check for export assignment (export = ...)
  if (ts.isExportAssignment(node)) return true;

  // Check for export declaration (export { ... } from ...)
  if (ts.isExportDeclaration(node)) return true;

  return false;
};

export const extractParameters = (
  node: ts.FunctionDeclaration | ts.MethodDeclaration,
  checker: ts.TypeChecker
): ApiParameter[] => {
  if (!node.parameters) return [];
  return node.parameters.map(param => {
    const name = param.name.getText();
    const type = param.type ? param.type.getText() : "any";
    const description = getJSDocDescription((param as any).symbol, checker);
    const required = !param.questionToken && !param.initializer;
    const rest = !!param.dotDotDotToken;
    return {
      name,
      type,
      description: description || "",
      required,
      optional: !required,
      rest,
    };
  });
};

export const extractReturnType = (node: ts.FunctionDeclaration | ts.MethodDeclaration): ApiReturn | undefined => {
  if (!node.type) return undefined;
  const type = node.type.getText();
  const description = getJSDocReturnDescription((node as any).symbol);
  return { type, description: description || "" };
};

export const extractApiInfo = (node: ts.Node, sourceFile: ts.SourceFile, checker: ts.TypeChecker): ApiInfo | null => {
  // Try multiple approaches to get the symbol
  let symbol = checker.getSymbolAtLocation(node);

  // If no symbol found, try getting it from the name node
  if (
    !symbol &&
    (ts.isFunctionDeclaration(node) ||
      ts.isClassDeclaration(node) ||
      ts.isInterfaceDeclaration(node) ||
      ts.isTypeAliasDeclaration(node) ||
      ts.isEnumDeclaration(node)) &&
    node.name
  ) {
    symbol = checker.getSymbolAtLocation(node.name);
  }

  // For export declarations, try to get the symbol from the module specifier
  if (!symbol && ts.isExportDeclaration(node) && node.moduleSpecifier) {
    const moduleSymbol = checker.getSymbolAtLocation(node.moduleSpecifier);
    if (moduleSymbol) {
      // This is a re-export, we'll handle it differently
      return null; // Skip re-exports for now
    }
  }

  // If still no symbol, try to get it from the type
  if (
    !symbol &&
    (ts.isFunctionDeclaration(node) ||
      ts.isClassDeclaration(node) ||
      ts.isInterfaceDeclaration(node) ||
      ts.isTypeAliasDeclaration(node) ||
      ts.isEnumDeclaration(node))
  ) {
    const type = checker.getTypeAtLocation(node);
    if (type) {
      symbol = type.getSymbol();
    }
  }

  if (!symbol) {
    return null;
  }

  const name = symbol.getName();
  const description = getJSDocDescription(symbol, checker);

  let apiType: ApiInfo["type"];
  let parameters: ApiParameter[] = [];
  let returns: ApiReturn | undefined;

  if (ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node)) {
    apiType = "function";
    parameters = extractParameters(node, checker);
    returns = extractReturnType(node);
  } else if (ts.isClassDeclaration(node)) {
    apiType = "class";
  } else if (ts.isInterfaceDeclaration(node)) {
    apiType = "interface";
  } else if (ts.isTypeAliasDeclaration(node)) {
    apiType = "type";
  } else if (ts.isEnumDeclaration(node)) {
    apiType = "enum";
  } else if (ts.isModuleDeclaration(node)) {
    apiType = "namespace";
  } else if (ts.isVariableDeclaration(node)) {
    apiType = "variable";
  } else {
    return null;
  }

  return {
    name,
    type: apiType,
    description: description || "",
    parameters,
    returns,
    examples: extractExamples(symbol),
    deprecated: isDeprecated(symbol),
    since: extractSince(symbol),
    tags: extractTags(symbol),
    source: {
      file: sourceFile.fileName,
      line: sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1,
      column: sourceFile.getLineAndCharacterOfPosition(node.getStart()).character + 1,
    },
  };
};
