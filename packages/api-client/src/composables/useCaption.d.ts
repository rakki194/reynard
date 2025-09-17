/**
 * Caption generation composable for Reynard API
 */
import type { CaptionRequest, CaptionResponse, GeneratorInfo } from "../generated/index.js";
export interface UseCaptionOptions {
    basePath?: string;
}
export declare function useCaption(options?: UseCaptionOptions): {
    isGenerating: import("solid-js").Accessor<boolean>;
    generateCaption: (request: CaptionRequest) => Promise<CaptionResponse>;
    getGenerators: () => Promise<GeneratorInfo[]>;
};
