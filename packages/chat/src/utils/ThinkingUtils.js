/**
 * Thinking Section Utilities
 *
 * Contains static utility functions for working with thinking sections
 */
import { MARKDOWN_PATTERNS } from "./patterns";
export class ThinkingUtils {
    /**
     * Extract thinking sections from text
     */
    static extractThinkingSections(text) {
        const sections = [];
        const lines = text.split("\n");
        let inThinking = false;
        let thinkingBuffer = "";
        for (const line of lines) {
            if (line.match(MARKDOWN_PATTERNS.thinkingStart)) {
                inThinking = true;
                thinkingBuffer = "";
            }
            else if (line.match(MARKDOWN_PATTERNS.thinkingEnd)) {
                if (inThinking && thinkingBuffer.trim()) {
                    sections.push(thinkingBuffer.trim());
                }
                inThinking = false;
                thinkingBuffer = "";
            }
            else if (inThinking) {
                thinkingBuffer += line + "\n";
            }
        }
        return sections;
    }
    /**
     * Remove thinking sections from text
     */
    static removeThinkingSections(text) {
        let processed = text;
        // Remove block thinking sections
        processed = processed.replace(/<think>[\s\S]*?<\/think>/g, "");
        // Remove inline thinking sections
        processed = processed.replace(MARKDOWN_PATTERNS.thinkingInline, "");
        return processed;
    }
}
