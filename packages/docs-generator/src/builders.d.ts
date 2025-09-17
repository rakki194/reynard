import type { GeneratorConfig } from "./config/types/core";
import type { PackageInfo } from "./config/types/package";
import { DocPage, DocSection } from "./types.js";
export declare function analyzePackages(config: GeneratorConfig, packagePaths: string[]): Promise<PackageInfo[]>;
export declare function generatePages(config: GeneratorConfig, packageInfos: PackageInfo[]): Promise<DocPage[]>;
export declare function generateSections(packageInfos: PackageInfo[]): Promise<DocSection[]>;
export declare function generateExamples(packageInfos: PackageInfo[]): any[];
export declare function generateApiDocs(packageInfos: PackageInfo[]): any[];
