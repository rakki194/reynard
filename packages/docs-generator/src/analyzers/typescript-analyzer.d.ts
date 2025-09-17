/**
 * @fileoverview TypeScript analyzer for extracting API documentation
 */
import { ApiInfo } from "../config/types/api";
import { PackageInfo } from "../config/types/package";
export declare class TypeScriptAnalyzer {
    private program;
    private checker;
    analyze(packageInfo: PackageInfo): Promise<ApiInfo[]>;
    private analyzeSourceFile;
}
