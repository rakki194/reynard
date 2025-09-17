/**
 * useContentQuality Composable
 * Manages content quality assessment
 */
export function useContentQuality(options = {}) {
    const { onQualityUpdate } = options;
    const assessQuality = async (content, metadata) => {
        try {
            const response = await fetch("/api/scraping/quality/assess", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    content,
                    metadata: metadata || {},
                }),
            });
            const result = await response.json();
            if (result.success && result.data) {
                onQualityUpdate?.(result.data);
                return result.data;
            }
            else {
                throw new Error(result.error || "Failed to assess quality");
            }
        }
        catch (err) {
            throw new Error(err instanceof Error ? err.message : "Unknown error");
        }
    };
    const getQualityLevel = (score) => {
        if (score >= 90)
            return "excellent";
        if (score >= 75)
            return "good";
        if (score >= 60)
            return "fair";
        return "poor";
    };
    const getQualityFactors = () => {
        return [
            {
                name: "Content Length",
                score: 0,
                weight: 0.2,
                description: "Length and depth of content",
            },
            {
                name: "Readability",
                score: 0,
                weight: 0.25,
                description: "Clarity and readability of text",
            },
            {
                name: "Relevance",
                score: 0,
                weight: 0.2,
                description: "Relevance to search query or topic",
            },
            {
                name: "Structure",
                score: 0,
                weight: 0.15,
                description: "Well-structured content with proper formatting",
            },
            {
                name: "Completeness",
                score: 0,
                weight: 0.2,
                description: "Completeness of information",
            },
        ];
    };
    const isQualityAcceptable = (quality, threshold = 60) => {
        return quality.score >= threshold;
    };
    return {
        assessQuality,
        getQualityLevel,
        getQualityFactors,
        isQualityAcceptable,
    };
}
