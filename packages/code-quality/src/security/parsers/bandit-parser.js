/**
 * 🐺 Bandit Security Parser
 *
 * *snarls with predatory intelligence* Parses Bandit security analysis output
 * and converts it to standardized vulnerability format.
 */
/**
 * 🦊 Parse Bandit output
 */
export function parseBanditOutput(output) {
    const vulnerabilities = [];
    try {
        const result = JSON.parse(output);
        for (const issue of result.results || []) {
            vulnerabilities.push({
                id: `bandit-${issue.test_id}-${issue.filename}-${issue.line_number}`,
                type: "OTHER",
                severity: mapBanditSeverity(issue.severity),
                title: issue.test_name,
                description: issue.issue_text,
                file: issue.filename,
                line: issue.line_number,
                cwe: issue.cwe,
                remediation: issue.more_info,
                confidence: mapBanditConfidence(issue.confidence),
                tool: "bandit",
                createdAt: new Date(),
            });
        }
    }
    catch (error) {
        console.warn("⚠️ Failed to parse Bandit output:", error);
    }
    return vulnerabilities;
}
/**
 * 🦊 Map Bandit severity to standard severity
 */
function mapBanditSeverity(severity) {
    const severityMap = {
        HIGH: "HIGH",
        MEDIUM: "MEDIUM",
        LOW: "LOW",
    };
    return severityMap[severity] || "INFO";
}
/**
 * 🦊 Map Bandit confidence to standard confidence
 */
function mapBanditConfidence(confidence) {
    const confidenceMap = {
        HIGH: "HIGH",
        MEDIUM: "MEDIUM",
        LOW: "LOW",
    };
    return confidenceMap[confidence] || "MEDIUM";
}
