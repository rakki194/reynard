/**
 * MarkdownRenderer Component for Reynard Chat System
 *
 * Advanced markdown rendering with streaming support, syntax highlighting,
 * and comprehensive formatting options.
 */
import { createMemo, createEffect } from "solid-js";
import { createStreamingMarkdownParser } from "../utils/StreamingMarkdownParser";
// Simple HTML sanitization function
const sanitizeHTML = html => {
  // Remove potentially dangerous tags and attributes
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "")
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "")
    .replace(/<a[^>]*href\s*=\s*["']?javascript:/gi, '<a href="#"');
};
export const MarkdownRenderer = props => {
  let containerRef;
  // Parse markdown content
  const parsedContent = createMemo(() => {
    if (!props.content) {
      return { html: "", hasThinking: false, thinking: [] };
    }
    const parser = createStreamingMarkdownParser();
    parser.parseChunk(props.content);
    if (!props.streaming) {
      return parser.finalize();
    }
    const result = parser.finalize();
    return result;
  });
  // Handle link clicks
  const handleLinkClick = event => {
    const target = event.target;
    if (target.tagName === "A") {
      const href = target.getAttribute("href");
      if (href && props.onLinkClick) {
        event.preventDefault();
        props.onLinkClick(href, event);
      }
    }
  };
  // Enhanced HTML processing for custom components
  const processHTML = createMemo(() => {
    let html = parsedContent().html;
    if (!html) return html;
    // Add syntax highlighting classes if not already present
    html = html.replace(
      /<pre><code class="language-(\w+)">/g,
      '<pre class="reynard-code-block"><code class="language-$1">'
    );
    // Add math rendering classes
    if (props.enableMath) {
      html = html.replace(
        /<span class="math-inline">(.*?)<\/span>/g,
        '<span class="reynard-math reynard-math--inline">$1</span>'
      );
    }
    // Process tables
    html = html
      .replace(/<table>/g, '<div class="reynard-table-wrapper"><table class="reynard-table">')
      .replace(/<\/table>/g, "</table></div>");
    // Process task lists
    html = html.replace(/<ul class="task-list">/g, '<ul class="reynard-task-list">');
    // Add loading placeholder for images if needed
    if (props.imageConfig?.lazy) {
      html = html.replace(/<img ([^>]+)>/g, '<img $1 loading="lazy" class="reynard-image">');
    }
    // Sanitize the HTML to prevent XSS attacks
    return sanitizeHTML(html);
  });
  // Setup effect for syntax highlighting
  createEffect(() => {
    if (containerRef && processHTML()) {
      // Apply syntax highlighting if available
      if (typeof window !== "undefined" && window.hljs) {
        const codeBlocks = containerRef.querySelectorAll('pre code[class*="language-"]');
        codeBlocks.forEach(block => {
          window.hljs.highlightElement(block);
        });
      }
      // Apply math rendering if available
      if (props.enableMath && typeof window !== "undefined" && window.MathJax) {
        window.MathJax.typesetPromise([containerRef]);
      }
      // Apply mermaid diagrams if available
      if (props.enableDiagrams && typeof window !== "undefined" && window.mermaid) {
        const diagrams = containerRef.querySelectorAll(".language-mermaid");
        diagrams.forEach((diagram, index) => {
          const id = `mermaid-${Date.now()}-${index}`;
          diagram.id = id;
          window.mermaid.init(undefined, `#${id}`);
        });
      }
    }
  });
  return (
    <div
      ref={containerRef}
      class={`reynard-markdown-renderer ${props.streaming ? "reynard-markdown-renderer--streaming" : ""}`}
      onClick={handleLinkClick}
    >
      {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, solid/no-innerhtml */}
      <div innerHTML={processHTML()} />
    </div>
  );
};
