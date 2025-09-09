/**
 * Media Processor for Images and other media elements
 */

import { InlineProcessor } from "./InlineProcessor";
import { MARKDOWN_PATTERNS } from "../patterns";

export class MediaProcessor extends InlineProcessor {
  private nodes: any[] = [];

  process(text: string): string {
    return text.replace(MARKDOWN_PATTERNS.image, (match, alt, src) => {
      // Create an image node for tracking
      this.nodes.push(
        this.createTrackingNode({
          type: "image",
          content: "",
          src: src.trim(),
          alt: alt.trim(),
        }),
      );
      return `<img src="${src}" alt="${alt}" />`;
    });
  }

  getNodes(): any[] {
    return this.nodes;
  }

  clearNodes(): void {
    this.nodes = [];
  }
}
