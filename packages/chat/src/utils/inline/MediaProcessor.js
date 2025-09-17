/**
 * Media Processor for Images and other media elements
 */
import { InlineProcessor } from "./InlineProcessor";
import { MARKDOWN_PATTERNS } from "../patterns";
export class MediaProcessor extends InlineProcessor {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "nodes", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
    }
    process(text) {
        return text.replace(MARKDOWN_PATTERNS.image, (match, alt, src) => {
            // Create an image node for tracking
            this.nodes.push(this.createTrackingNode({
                type: "image",
                content: "",
                src: src.trim(),
                alt: alt.trim(),
            }));
            return `<img src="${src}" alt="${alt}" />`;
        });
    }
    getNodes() {
        return this.nodes;
    }
    clearNodes() {
        this.nodes = [];
    }
}
