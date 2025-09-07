/**
 * Markdown Streaming Utilities
 * 
 * Provides markdown-aware streaming text functionality with
 * real-time syntax highlighting and parsing.
 */

import { createSignal, createEffect } from "solid-js";
import { createStreamingText, StreamingTextOptions } from "./StreamingTextRenderer";

export function createMarkdownStreaming(
  markdownText: string,
  options: StreamingTextOptions = {},
) {
  const stream = createStreamingText(markdownText, options);

  // Enhanced state that includes parsed markdown
  const [parsedContent, setParsedContent] = createSignal("");

  createEffect(() => {
    const currentText = stream.state().currentText;
    if (currentText) {
      // Basic markdown parsing for streaming display
      const parsed = currentText
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.*?)\*/g, "<em>$1</em>")
        .replace(/`(.*?)`/g, "<code>$1</code>")
        .replace(/^### (.*$)/gm, "<h3>$1</h3>")
        .replace(/^## (.*$)/gm, "<h2>$1</h2>")
        .replace(/^# (.*$)/gm, "<h1>$1</h1>")
        .replace(/^- (.*$)/gm, "<li>$1</li>")
        .replace(/\n/g, "<br>");

      setParsedContent(parsed);
    }
  });

  return {
    ...stream,
    parsedContent,
  };
}
