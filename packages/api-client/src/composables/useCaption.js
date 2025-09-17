/**
 * Caption generation composable for Reynard API
 */
import { createSignal } from "solid-js";
export function useCaption(options = {}) {
    const [isGenerating, setIsGenerating] = createSignal(false);
    const generateCaption = async (request) => {
        setIsGenerating(true);
        try {
            // Stub implementation
            console.log("Generating caption for:", request);
            return {
                success: true,
                imagePath: request.imagePath,
                generatorName: request.generatorName,
                caption: "Generated caption",
            };
        }
        finally {
            setIsGenerating(false);
        }
    };
    const getGenerators = async () => {
        // Stub implementation
        return [
            {
                name: "florence2",
                description: "Microsoft Florence2",
                version: "1.0",
                captionType: "image",
                isAvailable: true,
                isLoaded: true,
                configSchema: {},
                features: [],
                modelCategory: "vision",
            },
            {
                name: "blip2",
                description: "BLIP-2",
                version: "1.0",
                captionType: "image",
                isAvailable: true,
                isLoaded: true,
                configSchema: {},
                features: [],
                modelCategory: "vision",
            },
        ];
    };
    return {
        isGenerating,
        generateCaption,
        getGenerators,
    };
}
