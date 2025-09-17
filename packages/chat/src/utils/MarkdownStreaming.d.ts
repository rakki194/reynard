/**
 * Markdown Streaming Utilities
 *
 * Provides markdown-aware streaming text functionality with
 * real-time syntax highlighting and parsing.
 */
import { StreamingTextOptions } from "./StreamingTextRenderer";
export declare function createMarkdownStreaming(markdownText: string, options?: StreamingTextOptions): {
    parsedContent: import("solid-js").Accessor<string>;
    start: () => void;
    pause: () => void;
    resume: () => void;
    stop: () => void;
    restart: () => void;
    state: import("solid-js").Accessor<import("./StreamingTextRenderer").StreamingTextState>;
};
