/**
 * TagBubbleColors Composable
 *
 * Handles color generation and CSS custom property management for TagBubble.
 */
export interface TagBubbleColorsConfig {
    tag: string;
    intensity?: number;
    variant?: string;
    theme?: any;
    tagBubbleRef: HTMLDivElement | undefined;
}
export declare function createTagBubbleColors(config: TagBubbleColorsConfig): {
    tagColor: import("solid-js").Accessor<import("../index.js").TagColor>;
};
