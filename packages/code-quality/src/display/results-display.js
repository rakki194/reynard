/**
 * 🦊 Results Display Utilities
 *
 * *whiskers twitch with intelligence* Handles display formatting
 * for analysis results in various formats.
 */
function getGateStatusIcon(status) {
    if (status === "PASSED")
        return "✅";
    if (status === "WARN")
        return "⚠️";
    return "❌";
}
function displayQualityGates(qualityGates) {
    if (qualityGates.length === 0)
        return;
    console.log("\n🚪 Quality Gates:");
    for (const gate of qualityGates) {
        const statusIcon = getGateStatusIcon(gate.status);
        console.log(`   ${statusIcon} ${gate.gateName}: ${gate.status} (${gate.overallScore.toFixed(1)}%)`);
    }
}
function displayMetrics(analysis) {
    console.log("\n📈 Code Quality Metrics:");
    console.log(`   Lines of Code: ${analysis.metrics.linesOfCode.toLocaleString()}`);
    console.log(`   Issues: ${analysis.issues.length}`);
    console.log(`   Bugs: ${analysis.metrics.bugs}`);
    console.log(`   Vulnerabilities: ${analysis.metrics.vulnerabilities}`);
    console.log(`   Code Smells: ${analysis.metrics.codeSmells}`);
    console.log(`   Complexity: ${analysis.metrics.cyclomaticComplexity.toFixed(0)}`);
    console.log(`   Maintainability: ${analysis.metrics.maintainabilityIndex.toFixed(0)}`);
}
function displaySecurity(security) {
    if (!security)
        return;
    console.log("\n🔒 Security Analysis:");
    console.log(`   Security Rating: ${security.summary.securityRating}`);
    console.log(`   Vulnerabilities: ${security.summary.totalVulnerabilities}`);
    console.log(`   Critical: ${security.summary.criticalVulnerabilities}`);
    console.log(`   High: ${security.summary.highVulnerabilities}`);
    console.log(`   Medium: ${security.summary.mediumVulnerabilities}`);
    console.log(`   Security Hotspots: ${security.summary.totalHotspots}`);
}
function displayLanguages(analysis) {
    if (analysis.languages.length === 0)
        return;
    console.log("\n🌐 Languages:");
    for (const lang of analysis.languages) {
        console.log(`   ${lang.language}: ${lang.files} files, ${lang.lines.toLocaleString()} lines, ${lang.issues} issues`);
    }
}
export function displaySummaryResults(output) {
    const { analysis, security, qualityGates, duration } = output;
    console.log("\n🦊 Reynard Code Quality Analysis Results");
    console.log("==========================================");
    console.log(`⏱️  Duration: ${duration}ms`);
    console.log(`📊 Analysis Date: ${new Date().toISOString()}`);
    displayQualityGates(qualityGates);
    displayMetrics(analysis);
    displaySecurity(security);
    displayLanguages(analysis);
}
export function displayTableResults(_output) {
    // Implementation for table format
    console.log("Table format not yet implemented");
}
function displayBasicAnalysis(results) {
    if (!results.analysis)
        return;
    console.log("\n📊 Code Quality Analysis:");
    console.log(`   Lines of Code: ${results.analysis.metrics.linesOfCode.toLocaleString()}`);
    console.log(`   Total Issues: ${results.analysis.issues.length}`);
    console.log(`   Reliability Rating: ${results.analysis.metrics.reliabilityRating}`);
    console.log(`   Security Rating: ${results.analysis.metrics.securityRating}`);
    console.log(`   Maintainability Rating: ${results.analysis.metrics.maintainabilityRating}`);
}
function displayAIAnalysis(results) {
    if (!results.ai || results.ai.length === 0)
        return;
    console.log("\n🤖 AI Analysis:");
    const totalSuggestions = results.ai.reduce((sum, r) => sum + r.suggestions.length, 0);
    console.log(`   Total AI Suggestions: ${totalSuggestions}`);
    console.log(`   Files Analyzed: ${results.ai.length}`);
    const criticalSuggestions = results.ai.reduce((sum, r) => sum + r.suggestions.filter((s) => s.severity === "critical").length, 0);
    if (criticalSuggestions > 0) {
        console.log(`   Critical Issues: ${criticalSuggestions}`);
    }
}
function displayBehavioralAnalysis(results) {
    if (!results.behavioral)
        return;
    console.log("\n📈 Behavioral Analysis:");
    console.log(`   Code Hotspots: ${results.behavioral.hotspots.length}`);
    console.log(`   Technical Debt Score: ${results.behavioral.technicalDebt.total}`);
    console.log(`   Insights Generated: ${results.behavioral.insights.length}`);
    const criticalHotspots = results.behavioral.hotspots.filter((h) => h.riskLevel === "critical").length;
    if (criticalHotspots > 0) {
        console.log(`   Critical Hotspots: ${criticalHotspots}`);
    }
}
function displayEnhancedSecurity(results) {
    if (!results.enhancedSecurity)
        return;
    console.log("\n🛡️ Enhanced Security Analysis:");
    console.log(`   Total Vulnerabilities: ${results.enhancedSecurity.summary.totalVulnerabilities}`);
    console.log(`   Critical Vulnerabilities: ${results.enhancedSecurity.summary.criticalVulnerabilities}`);
    console.log(`   Security Rating: ${results.enhancedSecurity.summary.securityRating}`);
    console.log(`   Risk Score: ${results.enhancedSecurity.summary.riskScore}`);
    if (results.enhancedSecurity.tools.fenrir) {
        console.log("   ✅ Fenrir Security Testing: Enabled");
    }
    if (results.enhancedSecurity.tools.bandit) {
        console.log("   ✅ Bandit Python Analysis: Enabled");
    }
    if (results.enhancedSecurity.tools.eslintSecurity) {
        console.log("   ✅ ESLint Security Analysis: Enabled");
    }
}
function displayQualityGatesResults(results) {
    if (!results.qualityGates || results.qualityGates.length === 0)
        return;
    console.log("\n🎯 Quality Gates:");
    const passed = results.qualityGates.filter((g) => g.status === "PASSED").length;
    const failed = results.qualityGates.filter((g) => g.status === "FAILED").length;
    console.log(`   Passed: ${passed}`);
    console.log(`   Failed: ${failed}`);
    if (failed > 0) {
        console.log("\n   Failed Gates:");
        results.qualityGates
            .filter((g) => g.status === "FAILED")
            .forEach((gate) => {
            console.log(`     ❌ ${gate.gateName}: ${gate.description}`);
        });
    }
}
export function displayEnhancedResults(results, _format) {
    console.log("\n🦊 Enhanced Analysis Results");
    console.log("=".repeat(50));
    displayBasicAnalysis(results);
    displayAIAnalysis(results);
    displayBehavioralAnalysis(results);
    displayEnhancedSecurity(results);
    displayQualityGatesResults(results);
    console.log(`\n⏱️  Analysis completed in ${results.timestamp}`);
}
