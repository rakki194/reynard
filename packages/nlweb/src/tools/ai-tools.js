/**
 * AI Tools Configuration
 *
 * Defines AI-related tools for the NLWeb service.
 */
export const aiTools = [
    {
        name: "generate_captions",
        description: "Generate captions for images",
        category: "ai",
        tags: ["caption", "image", "ai", "generate"],
        path: "/api/caption/generate",
        method: "POST",
        parameters: [
            {
                name: "images",
                type: "array",
                description: "List of image paths to caption",
                required: true,
            },
            {
                name: "generator",
                type: "string",
                description: "Caption generator to use",
                required: false,
                default: "auto",
                constraints: {
                    enum: ["auto", "jtp2", "florence2", "wdv3", "joy"],
                },
            },
        ],
        examples: ["generate captions", "caption images", "describe images"],
        enabled: true,
        priority: 85,
        timeout: 30000,
    },
];
