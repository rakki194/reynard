/**
 * 🦦 Reynard Analysis Orchestrator
 *
 * *splashes with coordination* Orchestrates complex analysis workflows
 * across multiple engines and components.
 */
/**
 * 🦦 Analysis Orchestrator
 *
 * *webbed paws coordinate perfectly* Manages complex analysis workflows
 * with the precision of an otter navigating through crystal-clear streams.
 */
export class AnalysisOrchestrator {
    constructor(system) {
        Object.defineProperty(this, "system", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: system
        });
    }
    /**
     * 🦦 Run complete analysis
     *
     * *dives deep into the analysis pool* Coordinates all analysis engines
     * to provide comprehensive code quality insights.
     */
    async runCompleteAnalysis(environment = "development") {
        console.log("🦦 Starting complete code quality analysis...");
        // Run code quality analysis
        const analysisResult = await this.system.analyzer.analyzeProject();
        // Run security analysis
        const files = analysisResult.files.map((f) => f.path);
        const securityResult = await this.system.securityIntegration.runSecurityAnalysis(files);
        // Evaluate quality gates
        const qualityGateResults = this.system.qualityGateManager.evaluateQualityGates(analysisResult.metrics, environment);
        return {
            analysis: analysisResult,
            security: securityResult,
            qualityGates: qualityGateResults,
            timestamp: new Date().toISOString(),
        };
    }
    /**
     * 🦦 Run enhanced analysis with AI and behavioral insights
     *
     * *swims through advanced analysis streams* Combines traditional analysis
     * with cutting-edge AI and behavioral insights for maximum coverage.
     */
    async runEnhancedAnalysis(environment = "development") {
        console.log("🦦 Starting enhanced code quality analysis...");
        // Run complete analysis
        const basicResults = await this.runCompleteAnalysis(environment);
        // Run AI analysis on key files
        const aiResults = await this.runAIAnalysis(basicResults.analysis.files);
        // Run behavioral analysis
        const behavioralResult = await this.system.behavioralEngine.analyzeBehavior();
        // Run enhanced security analysis
        const files = basicResults.analysis.files.map((f) => f.path);
        const enhancedSecurityResult = await this.system.enhancedSecurityEngine.runSecurityAnalysis(files);
        return {
            ...basicResults,
            ai: aiResults,
            behavioral: behavioralResult,
            enhancedSecurity: enhancedSecurityResult,
            timestamp: new Date().toISOString(),
        };
    }
    /**
     * 🦦 Run AI analysis on key files
     *
     * *whiskers quiver with AI excitement* Analyzes the most important files
     * with AI-powered insights.
     */
    async runAIAnalysis(files) {
        const keyFiles = files.slice(0, 5); // Analyze top 5 files
        const aiResults = await Promise.all(keyFiles.map(async (file) => {
            try {
                return await this.system.aiEngine.analyzeCode({
                    filePath: file.path,
                    content: file.content || "",
                    language: file.language || "typescript",
                    projectType: "reynard",
                    dependencies: [],
                    recentChanges: [],
                    relatedFiles: [],
                });
            }
            catch (error) {
                console.warn(`AI analysis failed for ${file.path}:`, error);
                return null;
            }
        }));
        return aiResults.filter((r) => r !== null);
    }
    /**
     * 🦦 Initialize the analysis system
     *
     * *sleek fur glistens with preparation* Sets up the analysis system
     * with default configurations and quality gates.
     */
    async initialize() {
        await this.system.qualityGateManager.loadConfiguration();
        // Create default quality gates if none exist
        const gates = this.system.qualityGateManager.getQualityGates();
        if (gates.length === 0) {
            await this.system.qualityGateManager.createReynardQualityGates();
        }
    }
}
