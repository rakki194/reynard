/**
 * Caption Generator View Component
 *
 * The view layer for the caption generator, separated to keep
 * the main component under the 140-line limit.
 */
import type { CaptionGeneratorHandlers, CaptionGeneratorState } from "reynard-caption-core";
import { Component } from "solid-js";
export interface CaptionGeneratorViewProps {
    state: CaptionGeneratorState;
    handlers: CaptionGeneratorHandlers;
    class?: string;
    fileInputRef: HTMLInputElement | undefined;
}
export declare const CaptionGeneratorView: Component<CaptionGeneratorViewProps>;
