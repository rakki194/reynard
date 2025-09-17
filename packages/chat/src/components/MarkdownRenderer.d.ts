/**
 * MarkdownRenderer Component for Reynard Chat System
 *
 * Advanced markdown rendering with streaming support, syntax highlighting,
 * and comprehensive formatting options.
 */
import { Component } from "solid-js";
import type { MarkdownRendererProps } from "../types";
interface HighlightJS {
    highlightElement: (element: Element) => void;
}
interface MathJax {
    typesetPromise: (elements: Element[]) => Promise<void>;
}
interface Mermaid {
    init: (config: Record<string, unknown> | undefined, selector: string) => void;
}
declare global {
    interface Window {
        hljs?: HighlightJS;
        MathJax?: MathJax;
        mermaid?: Mermaid;
    }
}
export declare const MarkdownRenderer: Component<MarkdownRendererProps>;
export {};
