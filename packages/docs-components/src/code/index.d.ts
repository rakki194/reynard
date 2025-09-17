/**
 * @fileoverview Code display and interactive components for documentation
 */
import { Component } from "solid-js";
/**
 * Code block component with syntax highlighting
 */
export declare const DocsCodeBlock: Component<{
    code: string;
    language: string;
    title?: string;
    showLineNumbers?: boolean;
    copyable?: boolean;
    runnable?: boolean;
    onRun?: (code: string) => void;
    className?: string;
}>;
/**
 * Interactive code editor component
 */
export declare const DocsCodeEditor: Component<{
    code: string;
    language: string;
    onChange?: (code: string) => void;
    onRun?: (code: string) => void;
    readOnly?: boolean;
    className?: string;
}>;
/**
 * Code example component with live preview
 */
export declare const DocsCodeExample: Component<{
    title: string;
    description?: string;
    code: string;
    language: string;
    preview?: string;
    onRun?: (code: string) => void;
    className?: string;
}>;
/**
 * Code comparison component
 */
export declare const DocsCodeComparison: Component<{
    left: {
        title: string;
        code: string;
        language: string;
    };
    right: {
        title: string;
        code: string;
        language: string;
    };
    className?: string;
}>;
/**
 * Code snippet component for inline code
 */
export declare const DocsCodeSnippet: Component<{
    code: string;
    language?: string;
    copyable?: boolean;
    className?: string;
}>;
/**
 * Terminal/console component
 */
export declare const DocsTerminal: Component<{
    commands: Array<{
        command: string;
        output?: string;
        error?: string;
    }>;
    prompt?: string;
    className?: string;
}>;
