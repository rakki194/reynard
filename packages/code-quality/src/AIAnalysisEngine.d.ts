/**
 * 🦊 AI Analysis Engine
 *
 * *red fur gleams with intelligence* AI-powered code analysis engine that leverages
 * Reynard's existing Ollama service for intelligent code review and suggestions.
 */
import { EventEmitter } from "events";
export interface AISuggestion {
    id: string;
    type: "bug" | "security" | "performance" | "maintainability" | "style";
    severity: "low" | "medium" | "high" | "critical";
    title: string;
    description: string;
    file: string;
    line: number;
    column?: number;
    suggestion: string;
    reasoning: string;
    confidence: number;
    tags: string[];
}
export interface AICodeContext {
    filePath: string;
    content: string;
    language: string;
    projectType: string;
    dependencies: string[];
    recentChanges: string[];
    relatedFiles: string[];
}
export interface AIAnalysisResult {
    suggestions: AISuggestion[];
    summary: {
        totalSuggestions: number;
        criticalIssues: number;
        securityIssues: number;
        performanceIssues: number;
        maintainabilityIssues: number;
    };
    analysisTime: number;
    model: string;
}
/**
 * 🦊 AI Analysis Engine
 *
 * *whiskers twitch with anticipation* Leverages Reynard's Ollama service
 * for intelligent code analysis and suggestions.
 */
export declare class AIAnalysisEngine extends EventEmitter {
    private readonly ollamaServiceUrl;
    private defaultModel;
    private readonly maxTokens;
    constructor(ollamaServiceUrl?: string, defaultModel?: string, maxTokens?: number);
    /**
     * 🦊 Analyze code with AI
     */
    analyzeCode(context: AICodeContext, analysisType?: "comprehensive" | "security" | "performance" | "maintainability"): Promise<AIAnalysisResult>;
    /**
     * 🦊 Build analysis prompt
     */
    private buildAnalysisPrompt;
    /**
     * 🦊 Get analysis focus based on type
     */
    private getAnalysisFocus;
    /**
     * 🦊 Call Ollama service
     */
    private callOllamaService;
    /**
     * 🦊 Parse AI response
     */
    private parseAIResponse;
    /**
     * 🦊 Calculate summary statistics
     */
    private calculateSummary;
    /**
     * 🦊 Analyze multiple files
     */
    analyzeMultipleFiles(contexts: AICodeContext[], analysisType?: "comprehensive" | "security" | "performance" | "maintainability"): Promise<AIAnalysisResult[]>;
    /**
     * 🦊 Get available models
     */
    getAvailableModels(): Promise<string[]>;
    /**
     * 🦊 Set analysis model
     */
    setModel(model: string): void;
    /**
     * 🦊 Get current model
     */
    getModel(): string;
}
/**
 * 🦊 Create AI analysis engine
 */
export declare function createAIAnalysisEngine(ollamaServiceUrl?: string, defaultModel?: string, maxTokens?: number): AIAnalysisEngine;
