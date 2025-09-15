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
  confidence: number; // 0-1
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
export class AIAnalysisEngine extends EventEmitter {
  private readonly ollamaServiceUrl: string;
  private defaultModel: string;
  private readonly maxTokens: number;

  constructor(
    ollamaServiceUrl: string = "http://localhost:8000/api/ollama",
    defaultModel: string = "codellama:7b",
    maxTokens: number = 4000
  ) {
    super();
    this.ollamaServiceUrl = ollamaServiceUrl;
    this.defaultModel = defaultModel;
    this.maxTokens = maxTokens;
  }

  /**
   * 🦊 Analyze code with AI
   */
  async analyzeCode(
    context: AICodeContext,
    analysisType: "comprehensive" | "security" | "performance" | "maintainability" = "comprehensive"
  ): Promise<AIAnalysisResult> {
    const startTime = Date.now();

    try {
      const prompt = this.buildAnalysisPrompt(context, analysisType);
      const response = await this.callOllamaService(prompt);
      const suggestions = this.parseAIResponse(response, context);

      const result: AIAnalysisResult = {
        suggestions,
        summary: this.calculateSummary(suggestions),
        analysisTime: Date.now() - startTime,
        model: this.defaultModel,
      };

      this.emit("analysisComplete", result);
      return result;
    } catch (error) {
      this.emit("analysisError", error);
      throw error;
    }
  }

  /**
   * 🦊 Build analysis prompt
   */
  private buildAnalysisPrompt(context: AICodeContext, analysisType: string): string {
    const basePrompt = `You are an expert code reviewer analyzing ${context.language} code.
Analyze the following code for ${analysisType} issues and provide specific, actionable suggestions.

File: ${context.filePath}
Language: ${context.language}
Project Type: ${context.projectType}

Code:
\`\`\`${context.language}
${context.content}
\`\`\`

Dependencies: ${context.dependencies.join(", ")}

Please provide your analysis in the following JSON format:
{
  "suggestions": [
    {
      "type": "bug|security|performance|maintainability|style",
      "severity": "low|medium|high|critical",
      "title": "Brief title",
      "description": "Detailed description",
      "line": line_number,
      "column": column_number,
      "suggestion": "Specific improvement suggestion",
      "reasoning": "Why this change is needed",
      "confidence": 0.0-1.0,
      "tags": ["tag1", "tag2"]
    }
  ]
}

Focus on:
- ${this.getAnalysisFocus(analysisType)}
- Code quality and best practices
- Security vulnerabilities
- Performance optimizations
- Maintainability improvements

Be specific and actionable. Provide line numbers and exact suggestions.`;

    return basePrompt;
  }

  /**
   * 🦊 Get analysis focus based on type
   */
  private getAnalysisFocus(analysisType: string): string {
    switch (analysisType) {
      case "security":
        return "Security vulnerabilities, input validation, authentication, authorization, data protection";
      case "performance":
        return "Performance bottlenecks, memory usage, algorithm efficiency, I/O operations";
      case "maintainability":
        return "Code readability, complexity, documentation, modularity, testability";
      default:
        return "All aspects: bugs, security, performance, maintainability, and style";
    }
  }

  /**
   * 🦊 Call Ollama service
   */
  private async callOllamaService(prompt: string): Promise<string> {
    try {
      const response = await fetch(`${this.ollamaServiceUrl}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.defaultModel,
          messages: [
            {
              role: "system",
              content: "You are an expert code reviewer. Always respond with valid JSON format as requested.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          stream: false,
          options: {
            temperature: 0.1, // Low temperature for consistent analysis
            max_tokens: this.maxTokens,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama service error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.message?.content || "";
    } catch (error) {
      console.error("Error calling Ollama service:", error);
      throw new Error(`Failed to call Ollama service: ${error}`);
    }
  }

  /**
   * 🦊 Parse AI response
   */
  private parseAIResponse(response: string, context: AICodeContext): AISuggestion[] {
    try {
      // Extract JSON from response (handle cases where AI adds extra text)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in AI response");
      }

      const parsed = JSON.parse(jsonMatch[0]);
      const suggestions = parsed.suggestions || [];

      return suggestions.map((suggestion: any, index: number) => ({
        id: `ai-suggestion-${Date.now()}-${index}`,
        type: suggestion.type || "maintainability",
        severity: suggestion.severity || "medium",
        title: suggestion.title || "Code Improvement",
        description: suggestion.description || "",
        file: context.filePath,
        line: suggestion.line || 1,
        column: suggestion.column,
        suggestion: suggestion.suggestion || "",
        reasoning: suggestion.reasoning || "",
        confidence: Math.min(Math.max(suggestion.confidence || 0.5, 0), 1),
        tags: suggestion.tags || [],
      }));
    } catch (error) {
      console.error("Error parsing AI response:", error);
      // Return a fallback suggestion
      return [
        {
          id: `ai-suggestion-fallback-${Date.now()}`,
          type: "maintainability",
          severity: "low",
          title: "AI Analysis Failed",
          description: "Unable to parse AI analysis response",
          file: context.filePath,
          line: 1,
          suggestion: "Review the code manually for potential improvements",
          reasoning: "AI analysis encountered an error",
          confidence: 0.1,
          tags: ["ai-error"],
        },
      ];
    }
  }

  /**
   * 🦊 Calculate summary statistics
   */
  private calculateSummary(suggestions: AISuggestion[]) {
    return {
      totalSuggestions: suggestions.length,
      criticalIssues: suggestions.filter(s => s.severity === "critical").length,
      securityIssues: suggestions.filter(s => s.type === "security").length,
      performanceIssues: suggestions.filter(s => s.type === "performance").length,
      maintainabilityIssues: suggestions.filter(s => s.type === "maintainability").length,
    };
  }

  /**
   * 🦊 Analyze multiple files
   */
  async analyzeMultipleFiles(
    contexts: AICodeContext[],
    analysisType: "comprehensive" | "security" | "performance" | "maintainability" = "comprehensive"
  ): Promise<AIAnalysisResult[]> {
    const results: AIAnalysisResult[] = [];

    for (const context of contexts) {
      try {
        const result = await this.analyzeCode(context, analysisType);
        results.push(result);
      } catch (error) {
        console.error(`Failed to analyze ${context.filePath}:`, error);
        // Continue with other files
      }
    }

    return results;
  }

  /**
   * 🦊 Get available models
   */
  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.ollamaServiceUrl}/models`);
      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.status}`);
      }
      const data = await response.json();
      return data.models?.map((model: any) => model.name) || [];
    } catch (error) {
      console.error("Error fetching available models:", error);
      return [this.defaultModel];
    }
  }

  /**
   * 🦊 Set analysis model
   */
  setModel(model: string): void {
    this.defaultModel = model;
  }

  /**
   * 🦊 Get current model
   */
  getModel(): string {
    return this.defaultModel;
  }
}

/**
 * 🦊 Create AI analysis engine
 */
export function createAIAnalysisEngine(
  ollamaServiceUrl?: string,
  defaultModel?: string,
  maxTokens?: number
): AIAnalysisEngine {
  return new AIAnalysisEngine(ollamaServiceUrl, defaultModel, maxTokens);
}
