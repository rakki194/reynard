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
  if (
    ts.canHaveModifiers(node) &&
    ts.getCombinedModifierFlags(node as any) & ts.ModifierFlags.Export
  ) {
    return true;
  }
  if (ts.isExportAssignment(node)) return true;
  if (ts.isExportDeclaration(node)) return true;
  return false;
};

export const extractParameters = (
  node: ts.FunctionDeclaration | ts.MethodDeclaration,
  checker: ts.TypeChecker,
): ApiParameter[] => {
  if (!node.parameters) return [];
  return node.parameters.map((param) => {
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

export const extractReturnType = (
  node: ts.FunctionDeclaration | ts.MethodDeclaration,
): ApiReturn | undefined => {
  if (!node.type) return undefined;
  const type = node.type.getText();
  const description = getJSDocReturnDescription((node as any).symbol);
  return { type, description: description || "" };
};

export const extractApiInfo = (
  node: ts.Node,
  sourceFile: ts.SourceFile,
  checker: ts.TypeChecker,
): ApiInfo | null => {
  const symbol = checker.getSymbolAtLocation(node);
  if (!symbol) return null;
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
      column:
        sourceFile.getLineAndCharacterOfPosition(node.getStart()).character + 1,
    },
  };
};
