/**
 * Link Processor for Links and Auto-links
 */
import { InlineProcessor } from "./InlineProcessor";
import { MARKDOWN_PATTERNS } from "../patterns";
import { validateUrl } from "../parsing-utils";
export class LinkProcessor extends InlineProcessor {
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
        // Process markdown links
        text = text.replace(MARKDOWN_PATTERNS.link, (match, text, url) => {
            if (validateUrl(url)) {
                this.nodes.push(this.createTrackingNode({
                    type: "link",
                    content: "",
                    url: url.trim(),
                    text: text.trim(),
                }));
                return `<a href="${url}">${text}</a>`;
            }
            return match; // Return original if invalid URL
        });
        // Process auto-links
        text = text.replace(MARKDOWN_PATTERNS.autoLink, (match, url) => {
            if (validateUrl(url)) {
                this.nodes.push(this.createTrackingNode({
                    type: "link",
                    content: "",
                    url: url.trim(),
                    text: url.trim(),
                }));
                return `<a href="${url}">${url}</a>`;
            }
            return match; // Return original if invalid URL
        });
        return text;
    }
    getNodes() {
        return this.nodes;
    }
    clearNodes() {
        this.nodes = [];
    }
}
