/**
 * @fileoverview Utility helpers for markdown analysis
 */
export declare const isMarkdownFile: (fileName: string) => boolean;
export declare const generateSlugFromPath: (rootPath: string, filePath: string) => string;
export declare const extractTitleFromContent: (content: string) => string | null;
export declare const shouldExcludeDirectory: (dirName: string, excludePatterns: string[]) => boolean;
