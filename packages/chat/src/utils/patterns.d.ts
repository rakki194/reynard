/**
 * Shared Regex Patterns for Reynard Chat System
 *
 * Centralized collection of regex patterns used across all parsers
 * to ensure consistency and maintainability.
 */
export declare const MARKDOWN_PATTERNS: {
    readonly heading: RegExp;
    readonly headingUnderline: RegExp;
    readonly codeBlock: RegExp;
    readonly codeBlockEnd: RegExp;
    readonly indentedCode: RegExp;
    readonly listItem: RegExp;
    readonly numberedList: RegExp;
    readonly taskList: RegExp;
    readonly blockquote: RegExp;
    readonly horizontalRule: RegExp;
    readonly tableRow: RegExp;
    readonly tableSeparator: RegExp;
    readonly thinkingStart: RegExp;
    readonly thinkingEnd: RegExp;
    readonly thinkingInline: RegExp;
    readonly bold: RegExp;
    readonly italic: RegExp;
    readonly boldAlt: RegExp;
    readonly italicAlt: RegExp;
    readonly code: RegExp;
    readonly link: RegExp;
    readonly autoLink: RegExp;
    readonly image: RegExp;
    readonly strikethrough: RegExp;
    readonly mathInline: RegExp;
    readonly lineBreak: RegExp;
    readonly mathBlockStart: RegExp;
    readonly mathBlockEnd: RegExp;
    readonly htmlBlockStart: RegExp;
    readonly htmlBlockEnd: RegExp;
};
export declare const PUNCTUATION_PATTERNS: {
    readonly sentenceEnd: RegExp;
    readonly lineBreak: RegExp;
    readonly wordBoundary: RegExp;
};
export declare const URL_PATTERNS: {
    readonly http: RegExp;
    readonly validUrl: RegExp;
};
