/**
 * ComfyUI Text-to-Image Form Component
 *
 * A form component for generating images from text prompts using ComfyUI.
 */
import { Component } from "solid-js";
import type { ComfyText2ImgParams } from "../types/index.js";
export interface ComfyText2ImgFormProps {
    /** Callback when image generation starts */
    onGenerate?: (promptId: string) => void;
    /** Callback when image generation completes */
    onComplete?: (result: any) => void;
    /** Callback when image generation fails */
    onError?: (error: string) => void;
    /** Initial values */
    initialValues?: Partial<ComfyText2ImgParams>;
    /** Whether the form is disabled */
    disabled?: boolean;
    /** CSS class name */
    class?: string;
}
export declare const ComfyText2ImgForm: Component<ComfyText2ImgFormProps>;
