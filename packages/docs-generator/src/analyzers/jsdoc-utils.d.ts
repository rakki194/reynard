import * as ts from "typescript";
export declare const parseJSDocComment: (comment: string) => string;
export declare const getJSDocDescription: (symbol: ts.Symbol | undefined, checker: ts.TypeChecker) => string | undefined;
export declare const getJSDocReturnDescription: (symbol: ts.Symbol | undefined) => string | undefined;
export declare const extractExamples: (symbol: ts.Symbol | undefined) => string[];
export declare const isDeprecated: (symbol: ts.Symbol | undefined) => boolean;
export declare const extractSince: (symbol: ts.Symbol | undefined) => string | undefined;
export declare const extractTags: (symbol: ts.Symbol | undefined) => string[];
