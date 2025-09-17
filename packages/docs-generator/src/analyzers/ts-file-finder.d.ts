/**
 * Recursively find all TypeScript files under a directory, excluding dot-dirs and node_modules
 */
export declare const findTypeScriptFiles: (dir: string) => Promise<string[]>;
