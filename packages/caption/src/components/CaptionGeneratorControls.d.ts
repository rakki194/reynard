/**
 * Caption Generator Controls Component
 *
 * Generation controls and progress display for the caption generator.
 */
import { Component } from "solid-js";
import type { CaptionGeneratorState, CaptionGeneratorHandlers } from "../composables";
export interface CaptionGeneratorControlsProps {
    state: CaptionGeneratorState;
    handlers: CaptionGeneratorHandlers;
}
export declare const CaptionGeneratorControls: Component<CaptionGeneratorControlsProps>;
