/**
 * @fileoverview Documentation renderer components for Reynard
 */
import { Component } from "solid-js";
import { DocRendererProps, CodeExample } from "../types";
/**
 * Main documentation renderer component
 */
export declare const DocRenderer: Component<DocRendererProps>;
/**
 * Code example renderer component
 */
export declare const CodeExampleRenderer: Component<{
    example: CodeExample;
    onRun?: (code: string) => void;
}>;
/**
 * API documentation renderer
 */
export declare const ApiDocRenderer: Component<{
    api: any;
}>;
/**
 * Table of contents renderer
 */
export declare const TableOfContents: Component<{
    content: string;
    onNavigate?: (id: string) => void;
}>;
