/**
 * Caption Generator Controls Component
 *
 * Generation controls and progress display for the caption generator.
 */
import type { CaptionGeneratorHandlers, CaptionGeneratorState } from "reynard-caption-core";
import { Component } from "solid-js";
export interface CaptionGeneratorControlsProps {
    state: CaptionGeneratorState;
    handlers: CaptionGeneratorHandlers;
}
export declare const CaptionGeneratorControls: Component<CaptionGeneratorControlsProps>;
