/**
 * Link Processor for Links and Auto-links
 */
import { InlineProcessor } from "./InlineProcessor";
export declare class LinkProcessor extends InlineProcessor {
    private nodes;
    process(text: string): string;
    getNodes(): any[];
    clearNodes(): void;
}
