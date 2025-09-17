/**
 * @fileoverview Package and example type definitions
 */
import { ApiInfo } from "./api";
export interface PackageConfig {
    name: string;
    path?: string;
    pattern?: string;
    category?: string;
    priority?: number;
    include?: string[];
    exclude?: string[];
}
export interface TemplateConfig {
    name: string;
    path: string;
    type: "package-overview" | "api" | "example" | "custom";
}
export interface ExampleConfig {
    name: string;
    path: string;
    type: "component" | "hook" | "utility" | "integration";
    framework?: "solid" | "react" | "vue" | "vanilla";
}
export interface ExampleInfo {
    id: string;
    title: string;
    description?: string;
    code: string;
    language: string;
    framework?: string;
    live?: boolean;
    editable?: boolean;
    dependencies?: string[];
    imports?: string[];
    output?: string;
    tags?: string[];
    category?: string;
}
export interface PackageInfo {
    name: string;
    displayName?: string;
    description: string;
    version: string;
    path: string;
    category: string;
    keywords: string[];
    dependencies: string[];
    peerDependencies: string[];
    devDependencies: string[];
    exports: Record<string, string>;
    types: Record<string, string>;
    api: ApiInfo[];
    examples: ExampleInfo[];
    readme?: string;
    changelog?: string;
    license?: string;
    repository?: {
        type: string;
        url: string;
    };
    homepage?: string;
    bugs?: {
        url: string;
    };
    author?: {
        name: string;
        email?: string;
        url?: string;
    };
    contributors?: Array<{
        name: string;
        email?: string;
        url?: string;
    }>;
}
