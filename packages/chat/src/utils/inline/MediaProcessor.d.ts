/**
 * Media Processor for Images and other media elements
 */
import { InlineProcessor } from "./InlineProcessor";
export declare class MediaProcessor extends InlineProcessor {
    private nodes;
    process(text: string): string;
    getNodes(): any[];
    clearNodes(): void;
}
