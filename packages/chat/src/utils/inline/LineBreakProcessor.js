/**
 * Line Break Processor for handling line breaks and whitespace
 */
import { InlineProcessor } from "./InlineProcessor";
import { MARKDOWN_PATTERNS } from "../patterns";
export class LineBreakProcessor extends InlineProcessor {
    process(text) {
        return text.replace(MARKDOWN_PATTERNS.lineBreak, () => {
            return "<br />";
        });
    }
}
