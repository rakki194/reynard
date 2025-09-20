/**
 * Shared Regex Patterns for Reynard Chat System
 *
 * Centralized collection of regex patterns used across all parsers
 * to ensure consistency and maintainability.
 */

export const MARKDOWN_PATTERNS = {
  // Headers
  heading: /^(#{1,6})\s+(.*)$/,
  headingUnderline: /^(=+|-+)\s*$/,

  // Code blocks
  codeBlock: /^```(\w*)\s*$/,
  codeBlockEnd: /^```\s*$/,
  indentedCode: /^( {4}|\t)(.*)$/,

  // Lists
  listItem: /^(\s*)([-*+])\s+(.*)$/,
  numberedList: /^(\s*)(\d+)\.\s+(.*)$/,
  taskList: /^(\s*)([-*+])\s+\[([ xX])\]\s+(.*)$/,

  // Quotes and callouts
  blockquote: /^>\s+(.*)$/,

  // Horizontal rules
  horizontalRule: /^(\*{3,}|-{3,}|_{3,})\s*$/,

  // Tables
  tableRow: /^\|(.+)\|$/,
  tableSeparator: /^\|(\s*:?-+:?\s*\|)+$/,

  // Thinking sections
  thinkingStart: /^<think>\s*$/,
  thinkingEnd: /^<\/think>\s*$/,
  thinkingInline: /<think>(.*?)<\/think>/g,

  // Inline elements
  bold: /\*\*(.*?)\*\*/g,
  italic: /\*(.*?)\*/g,
  boldAlt: /__(.*?)__/g,
  italicAlt: /_(.*?)_/g,
  code: /`([^`]+)`/g,
  link: /\[([^\]]+)\]\(([^)]+)\)/g,
  autoLink: /(https?:\/\/[^\s]+)/g,
  image: /!\[([^\]]*)\]\(([^)]+)\)/g,
  strikethrough: /~~(.*?)~~/g,
  mathInline: /\$([^$]+)\$/g,
  lineBreak: / {2}\n/g,

  // Math blocks
  mathBlockStart: /^\$\$\s*$/,
  mathBlockEnd: /^\$\$\s*$/,

  // HTML blocks
  htmlBlockStart: /^<(\w+)(?:\s[^>]*)?>$/,
  htmlBlockEnd: /^<\/\w+>$/,
} as const;

export const PUNCTUATION_PATTERNS = {
  sentenceEnd: /[.!?;:]/,
  lineBreak: /\n/,
  wordBoundary: /\s/,
} as const;

export const URL_PATTERNS = {
  http: /^https?:\/\//,
  validUrl: /^https?:\/\/[^\s]+$/,
} as const;
