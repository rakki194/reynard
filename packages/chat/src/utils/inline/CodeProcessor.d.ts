/**
 * Code Processor for Code Spans and Inline Code
 */
import { InlineProcessor } from "./InlineProcessor";
export declare class CodeProcessor extends InlineProcessor {
    private nodes;
    process(text: string): string;
    getNodes(): any[];
    clearNodes(): void;
}
