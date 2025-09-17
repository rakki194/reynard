/**
 * @fileoverview API type definitions
 */
export interface ApiParameter {
    name: string;
    type: string;
    description: string;
    required: boolean;
    default?: unknown;
    optional?: boolean;
    rest?: boolean;
}
export interface ApiReturn {
    type: string;
    description: string;
    nullable?: boolean;
    undefined?: boolean;
}
export interface ApiInfo {
    name: string;
    type: "function" | "class" | "interface" | "type" | "enum" | "namespace" | "variable";
    description: string;
    parameters?: ApiParameter[];
    returns?: ApiReturn;
    examples?: string[];
    deprecated?: boolean;
    since?: string;
    tags?: string[];
    source?: {
        file: string;
        line: number;
        column: number;
    };
    exports?: string[];
    imports?: string[];
}
