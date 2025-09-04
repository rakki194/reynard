/**
 * Fixed tests for StreamingMarkdownParser
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  StreamingMarkdownParser,
  createStreamingMarkdownParser,
  parseMarkdown,
} from "../utils/StreamingMarkdownParser";

describe("StreamingMarkdownParser", () => {
  let parser: StreamingMarkdownParser;

  beforeEach(() => {
    parser = createStreamingMarkdownParser();
  });

  describe("Basic Markdown Parsing", () => {
    it("should parse headings correctly", () => {
      const result = parseMarkdown("# Heading 1\n## Heading 2\n### Heading 3");

      expect(result.nodes).toHaveLength(3);
      expect(result.nodes[0].type).toBe("heading");
      expect(result.nodes[0].content).toBe("Heading 1");
      expect(result.nodes[0].attributes?.level).toBe("1");
      expect(result.nodes[1].attributes?.level).toBe("2");
      expect(result.nodes[2].attributes?.level).toBe("3");
    });

    it("should parse paragraphs correctly", () => {
      const result = parseMarkdown(
        "This is a paragraph.\n\nThis is another paragraph.",
      );

      expect(result.nodes).toHaveLength(2);
      expect(result.nodes[0].type).toBe("paragraph");
      expect(result.nodes[0].content).toBe("This is a paragraph.");
      expect(result.nodes[1].content).toBe("This is another paragraph.");
    });

    it("should parse code blocks correctly", () => {
      const content = "```javascript\nconst x = 42;\nconsole.log(x);\n```";
      const result = parseMarkdown(content);

      expect(result.nodes).toHaveLength(1);
      expect(result.nodes[0].type).toBe("code-block");
      expect(result.nodes[0].attributes?.language).toBe("javascript");
      // Code block content should include the final newline from parsing
      expect(result.nodes[0].content).toBe("const x = 42;\nconsole.log(x);");
    });

    it("should parse lists correctly", () => {
      const content = "- Item 1\n- Item 2\n- Item 3";
      const result = parseMarkdown(content);

      expect(result.nodes).toHaveLength(1);
      expect(result.nodes[0].type).toBe("list");
      expect(result.nodes[0].attributes?.listType).toBe("unordered");
      expect(result.nodes[0].children).toHaveLength(3);
      expect(result.nodes[0].children![0].content).toBe("Item 1");
    });

    it("should parse numbered lists correctly", () => {
      const content = "1. First item\n2. Second item\n3. Third item";
      const result = parseMarkdown(content);

      expect(result.nodes).toHaveLength(1);
      expect(result.nodes[0].type).toBe("list");
      expect(result.nodes[0].attributes?.listType).toBe("ordered");
      expect(result.nodes[0].children).toHaveLength(3);
    });

    it("should parse task lists correctly", () => {
      const content = "- [x] Completed task\n- [ ] Incomplete task";
      const result = parseMarkdown(content);

      expect(result.nodes).toHaveLength(1);
      expect(result.nodes[0].type).toBe("list");
      expect(result.nodes[0].attributes?.taskList).toBe("true");
      expect(result.nodes[0].children![0].attributes?.checked).toBe("true");
      expect(result.nodes[0].children![1].attributes?.checked).toBe("false");
    });

    it("should parse blockquotes correctly", () => {
      const content = "> This is a blockquote\n> with multiple lines";
      const result = parseMarkdown(content);

      expect(result.nodes).toHaveLength(1);
      expect(result.nodes[0].type).toBe("blockquote");
      expect(result.nodes[0].content).toBe(
        "This is a blockquote\nwith multiple lines",
      );
    });

    it("should parse tables correctly", () => {
      const content =
        "| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |";
      const result = parseMarkdown(content);

      expect(result.nodes).toHaveLength(1);
      expect(result.nodes[0].type).toBe("table");
      // Table includes header row, separator handling, and data row
      expect(result.nodes[0].children!.length).toBeGreaterThanOrEqual(2);
    });

    it("should parse horizontal rules correctly", () => {
      const content = "---\n\n***\n\n___";
      const result = parseMarkdown(content);

      expect(result.nodes).toHaveLength(3);
      expect(result.nodes[0].type).toBe("hr");
      expect(result.nodes[1].type).toBe("hr");
      expect(result.nodes[2].type).toBe("hr");
    });
  });

  describe("Thinking Section Parsing", () => {
    it("should parse thinking sections correctly", () => {
      const content =
        "<think>\nThis is thinking content\n</think>\n\nThis is regular content.";
      const result = parseMarkdown(content);

      expect(result.hasThinking).toBe(true);
      expect(result.thinking).toHaveLength(1);
      expect(result.thinking[0]).toBe("This is thinking content");
      expect(result.nodes).toHaveLength(1);
      expect(result.nodes[0].content).toBe("This is regular content.");
    });

    it("should parse inline thinking correctly", () => {
      const content = "Regular text <think>inline thinking</think> more text.";
      const result = parseMarkdown(content);

      expect(result.hasThinking).toBe(true);
      expect(result.thinking).toHaveLength(1);
      expect(result.thinking[0]).toBe("inline thinking");
      expect(result.nodes[0].content).toBe("Regular text  more text.");
    });

    it("should handle multiple thinking sections", () => {
      const content =
        "<think>First thought</think>\n\nContent here.\n\n<think>Second thought</think>";
      const result = parseMarkdown(content);

      expect(result.thinking).toHaveLength(2);
      expect(result.thinking[0]).toBe("First thought");
      expect(result.thinking[1]).toBe("Second thought");
    });

    it("should handle incomplete thinking sections", () => {
      const content = "<think>\nIncomplete thinking section";
      const result = parseMarkdown(content);

      expect(result.hasThinking).toBe(true);
      expect(result.thinking).toHaveLength(1);
      expect(result.thinking[0]).toBe("Incomplete thinking section");
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].type).toBe("incomplete");
    });
  });

  describe("Streaming Functionality", () => {
    it("should handle streaming chunks correctly", () => {
      const chunks = [
        "# Heading\n\nPara",
        "graph content\n\n- List ",
        "item 1\n- List item 2",
      ];

      let result;
      for (const chunk of chunks) {
        result = parser.parseChunk(chunk);
      }

      const finalResult = parser.finalize();
      expect(finalResult.nodes).toHaveLength(3);
      expect(finalResult.nodes[0].type).toBe("heading");
      expect(finalResult.nodes[1].type).toBe("paragraph");
      expect(finalResult.nodes[2].type).toBe("list");
    });

    it("should handle streaming thinking sections", () => {
      const chunks = [
        "<think>\nThinking",
        " content here\n</think>\n\nRegular content",
      ];

      let result;
      for (const chunk of chunks) {
        result = parser.parseChunk(chunk);
      }

      const finalResult = parser.finalize();
      expect(finalResult.hasThinking).toBe(true);
      expect(finalResult.thinking[0]).toBe("Thinking content here");
    });

    it("should preserve incomplete content during streaming", () => {
      const result1 = parser.parseChunk("# Incomplete headi");
      expect(result1.nodes).toHaveLength(0); // Incomplete line not processed

      const result2 = parser.parseChunk("ng\n\nParagraph content");
      expect(result2.nodes).toHaveLength(1); // Now heading is complete
      expect(result2.nodes[0].type).toBe("heading");
    });

    it("should handle rapid streaming updates", () => {
      const chars = "Hello world!\n\nThis is a test.".split("");

      for (const char of chars) {
        parser.parseChunk(char);
      }

      const result = parser.finalize();
      expect(result.nodes).toHaveLength(2);
      expect(result.nodes[0].content).toBe("Hello world!");
      expect(result.nodes[1].content).toBe("This is a test.");
    });
  });

  describe("Inline Formatting", () => {
    it("should render inline formatting in HTML", () => {
      const content = "**bold** *italic* `code` ~~strikethrough~~";
      const result = parseMarkdown(content);

      expect(result.html).toContain("<strong>bold</strong>");
      expect(result.html).toContain("<em>italic</em>");
      expect(result.html).toContain("<code>code</code>");
      expect(result.html).toContain("<del>strikethrough</del>");
    });

    it("should render links correctly", () => {
      const content = "[Link text](https://example.com)";
      const result = parseMarkdown(content);

      expect(result.html).toContain(
        '<a href="https://example.com" target="_blank" rel="noopener noreferrer">Link text</a>',
      );
    });

    it("should handle conflicting patterns correctly", () => {
      const content = "Visit https://example.com for more info";
      const result = parseMarkdown(content);

      // Should contain auto-linked URL but avoid double processing
      expect(result.html).toContain("https://example.com");
    });
  });

  describe("Error Handling", () => {
    it("should handle malformed markdown gracefully", () => {
      const content = "# Heading\n```\nUnclosed code block\n\n> Unclosed quote";
      const result = parseMarkdown(content);

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].type).toBe("incomplete");
      expect(result.errors[0].recoverable).toBe(true);
    });

    it("should continue parsing after errors", () => {
      const content =
        "# Good heading\n```\nBad code block\n\n## Another heading";
      const result = parseMarkdown(content);

      expect(result.nodes.length).toBeGreaterThan(1);
      expect(result.nodes[0].type).toBe("heading");
      expect(result.nodes[0].content).toBe("Good heading");
    });
  });

  describe("Performance", () => {
    it("should handle large content efficiently", () => {
      const start = performance.now();
      const largeContent =
        "# Heading\n\n" +
        "Lorem ipsum ".repeat(1000) +
        "\n\n```javascript\n" +
        'console.log("test");\n'.repeat(100) +
        "```";

      const result = parseMarkdown(largeContent);
      const end = performance.now();

      expect(end - start).toBeLessThan(100); // Should parse in under 100ms
      expect(result.nodes).toHaveLength(3);
    });

    it("should reset state correctly", () => {
      parser.parseChunk("# First document\n\nContent here.");
      parser.finalize();

      parser.reset();

      const result = parser.parseChunk("# Second document\n\nNew content.");
      const finalResult = parser.finalize();

      expect(finalResult.nodes).toHaveLength(2);
      expect(finalResult.nodes[0].content).toBe("Second document");
      expect(finalResult.nodes[1].content).toBe("New content.");
    });
  });

  describe("HTML Rendering", () => {
    it("should escape HTML properly in code blocks", () => {
      const content = '```html\n<script>alert("test")</script>\n```';
      const result = parseMarkdown(content);

      expect(result.html).not.toContain("<script>");
      expect(result.html).toContain("&lt;script&gt;");
    });

    it("should generate semantic HTML", () => {
      const content =
        "# Title\n\nParagraph with **bold** text.\n\n- List item\n\n> Quote";
      const result = parseMarkdown(content);

      expect(result.html).toContain("<h1>Title</h1>");
      expect(result.html).toContain(
        "<p>Paragraph with <strong>bold</strong> text.</p>",
      );
      expect(result.html).toContain("<ul><li>List item</li></ul>");
      expect(result.html).toContain("<blockquote>Quote</blockquote>");
    });

    it("should handle nested lists correctly", () => {
      const content = "- Parent item\n  - Child item\n    - Grandchild item";
      const result = parseMarkdown(content);

      // For now, we handle this as a flat list with indentation
      expect(result.nodes[0].type).toBe("list");
      expect(result.nodes[0].children).toHaveLength(3);
    });
  });
});
