/**
 * 🦊 Security Display Utilities
 *
 * *whiskers twitch with intelligence* Handles display formatting
 * for security analysis results.
 */
export function displaySecuritySummary(securityResult) {
    console.log("\n🐺 Security Analysis Summary");
    console.log("============================");
    console.log(`Security Rating: ${securityResult.summary.securityRating}`);
    console.log(`Total Vulnerabilities: ${securityResult.summary.totalVulnerabilities}`);
    console.log(`Critical: ${securityResult.summary.criticalVulnerabilities}`);
    console.log(`High: ${securityResult.summary.highVulnerabilities}`);
    console.log(`Medium: ${securityResult.summary.mediumVulnerabilities}`);
    console.log(`Low: ${securityResult.summary.lowVulnerabilities}`);
    console.log(`Security Hotspots: ${securityResult.summary.totalHotspots}`);
    console.log(`Tools Used: ${securityResult.toolsUsed.join(", ")}`);
}
export function displaySecurityTable(_securityResult) {
    // Implementation for security table format
    console.log("Security table format not yet implemented");
}
