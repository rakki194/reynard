export declare function readPackageJson(packageJsonPath: string): Promise<any>;
export declare function readFileIfExists(filePath: string): Promise<string | undefined>;
export declare function extractDisplayName(packageJson: any): string | undefined;
export declare function extractExports(_packagePath: string, packageJson: any): Promise<Record<string, string>>;
export declare function extractTypes(packagePath: string, packageJson: any): Promise<Record<string, string>>;
