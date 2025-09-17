/**
 * Formatting Processor for Bold, Italic, and Strikethrough
 */
import { InlineProcessor } from "./InlineProcessor";
import { MARKDOWN_PATTERNS } from "../patterns";
export class FormattingProcessor extends InlineProcessor {
    process(text) {
        // Process bold text (double asterisks)
        text = text.replace(MARKDOWN_PATTERNS.bold, (match, content) => {
            return `<strong>${content}</strong>`;
        });
        // Process italic text (single asterisks)
        text = text.replace(MARKDOWN_PATTERNS.italic, (match, content) => {
            return `<em>${content}</em>`;
        });
        // Process bold text (double underscores)
        text = text.replace(MARKDOWN_PATTERNS.boldAlt, (match, content) => {
            return `<strong>${content}</strong>`;
        });
        // Process italic text (single underscores)
        text = text.replace(MARKDOWN_PATTERNS.italicAlt, (match, content) => {
            return `<em>${content}</em>`;
        });
        // Process strikethrough text
        text = text.replace(MARKDOWN_PATTERNS.strikethrough, (match, content) => {
            return `<del>${content}</del>`;
        });
        return text;
    }
}
