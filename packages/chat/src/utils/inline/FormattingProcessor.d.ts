/**
 * Formatting Processor for Bold, Italic, and Strikethrough
 */
import { InlineProcessor } from "./InlineProcessor";
export declare class FormattingProcessor extends InlineProcessor {
    process(text: string): string;
}
