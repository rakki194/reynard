/**
 * HTML output utilities for the docs generator
 */
import { DocEngineConfig, DocPage } from "../types.js";
export declare function writeOutput(config: any, docConfig: DocEngineConfig): Promise<void>;
export declare function generateHtmlPage(page: DocPage, config: DocEngineConfig): Promise<string>;
export declare function generateApiHtml(apiDocs: any[], config: DocEngineConfig): Promise<string>;
export declare function generateApiItemHtml(api: any): string;
export declare function generateIndexHtml(config: DocEngineConfig): Promise<string>;
export declare function copyAssets(outputPath: string): Promise<void>;
