/**
 * @fileoverview README processing utilities
 */
/**
 * Processes and extracts content from README files
 */
export class ReadmeProcessor {
    /**
     * Check if a README is rich enough to use directly
     */
    isRichReadme(readme) {
        const lines = readme.split("\n");
        const hasMultipleSections = (readme.match(/^## /gm) || []).length >= 3;
        const hasCodeBlocks = (readme.match(/```/g) || []).length >= 2;
        const hasExamples = readme.toLowerCase().includes("example") ||
            readme.toLowerCase().includes("quick start");
        const isLongEnough = lines.length >= 50;
        return hasMultipleSections && hasCodeBlocks && hasExamples && isLongEnough;
    }
    /**
     * Extract quick start section from README
     */
    extractQuickStartFromReadme(readme) {
        const lines = readme.split("\n");
        let inQuickStart = false;
        let quickStartLines = [];
        let headingLevel = 0;
        for (const line of lines) {
            const trimmed = line.trim();
            // Check for quick start heading
            if (trimmed.match(/^#+\s*(quick\s*start|getting\s*started|usage)/i)) {
                inQuickStart = true;
                headingLevel = (trimmed.match(/^#+/) || [""])[0].length;
                continue;
            }
            // Check for next heading at same or higher level
            if (inQuickStart &&
                trimmed.match(/^#+\s/) &&
                trimmed.match(/^#+/)[0].length <= headingLevel) {
                break;
            }
            if (inQuickStart) {
                quickStartLines.push(line);
            }
        }
        return quickStartLines.join("\n").trim();
    }
}
