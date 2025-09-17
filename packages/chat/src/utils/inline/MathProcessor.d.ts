/**
 * Math Processor for Inline Math Expressions
 */
import { InlineProcessor } from "./InlineProcessor";
export declare class MathProcessor extends InlineProcessor {
    private nodes;
    process(text: string): string;
    getNodes(): any[];
    clearNodes(): void;
}
