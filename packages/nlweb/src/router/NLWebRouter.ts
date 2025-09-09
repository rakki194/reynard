/**
 * NLWeb Router
 * 
 * Intelligent tool suggestion and routing system that analyzes natural language queries
 * and suggests appropriate tools with parameters.
 */

import { 
  NLWebRouter as INLWebRouter,
  NLWebSuggestionRequest,
  NLWebSuggestionResponse,
  NLWebSuggestion,
  NLWebHealthStatus,
  NLWebPerformanceStats,
  NLWebContext,
  NLWebTool,
  NLWebEvent,
  NLWebEventEmitter
} from '../types/index.js';
import { NLWebToolRegistry } from './NLWebToolRegistry.js';

export class NLWebRouter implements INLWebRouter {
  private toolRegistry: NLWebToolRegistry;
  private performanceStats: NLWebPerformanceStats;
  private cache = new Map<string, { response: NLWebSuggestionResponse; timestamp: number }>();
  private eventEmitter: NLWebEventEmitter;
  private initialized = false;

  constructor(toolRegistry: NLWebToolRegistry, eventEmitter: NLWebEventEmitter) {
    this.toolRegistry = toolRegistry;
    this.eventEmitter = eventEmitter;
    this.performanceStats = {
      totalRequests: 0,
      avgProcessingTime: 0,
      p95ProcessingTime: 0,
      p99ProcessingTime: 0,
      cacheHitRate: 0,
      cacheHits: 0,
      cacheMisses: 0,
      cacheSize: 0,
      maxCacheSize: 1000
    };
  }

  /**
   * Initialize the router
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    // Initialize performance tracking
    this.performanceStats = {
      totalRequests: 0,
      avgProcessingTime: 0,
      p95ProcessingTime: 0,
      p99ProcessingTime: 0,
      cacheHitRate: 0,
      cacheHits: 0,
      cacheMisses: 0,
      cacheSize: 0,
      maxCacheSize: 1000
    };

    this.initialized = true;
    this.emitEvent('health_check', { status: 'initialized' });
  }

  /**
   * Get tool suggestions for a query
   */
  async suggest(request: NLWebSuggestionRequest): Promise<NLWebSuggestionResponse> {
    const startTime = Date.now();
    const requestId = request.metadata?.requestId || this.generateRequestId();

    try {
      // Check cache first
      const cacheKey = this.generateCacheKey(request);
      const cached = this.cache.get(cacheKey);
      
      if (cached && this.isCacheValid(cached.timestamp)) {
        this.performanceStats.cacheHits++;
        this.emitEvent('cache_hit', { key: cacheKey, age: Date.now() - cached.timestamp });
        
        return {
          ...cached.response,
          cacheInfo: {
            hit: true,
            key: cacheKey,
            age: Date.now() - cached.timestamp
          }
        };
      }

      this.performanceStats.cacheMisses++;
      this.emitEvent('cache_miss', { key: cacheKey });

      // Process the query
      const suggestions = await this.processQuery(request);

      // Create response
      const processingTime = Date.now() - startTime;
      const response: NLWebSuggestionResponse = {
        suggestions,
        processingTime,
        metadata: {
          requestId,
          timestamp: Date.now(),
          version: '1.0.0'
        }
      };

      // Cache the response
      this.cache.set(cacheKey, { response, timestamp: Date.now() });
      this.cleanupCache();

      // Update performance stats
      this.updatePerformanceStats(processingTime);

      // Emit event
      this.emitEvent('tool_suggested', { 
        query: request.query.text, 
        suggestionsCount: suggestions.length,
        processingTime 
      });

      return response;

    } catch (error) {
      const processingTime = Date.now() - startTime;
      this.emitEvent('error', { error: error instanceof Error ? error.message : String(error) });
      
      throw new Error(`Failed to process query: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get router health status
   */
  async getHealthStatus(): Promise<NLWebHealthStatus> {
    const stats = this.getPerformanceStats();
    
    // Determine health status based on performance
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    if (stats.p95ProcessingTime > 2000) { // 2 seconds
      status = 'degraded';
    }
    
    if (stats.p95ProcessingTime > 5000 || stats.cacheHitRate < 10) { // 5 seconds or very low cache hit rate
      status = 'unhealthy';
    }

    return {
      status,
      available: this.initialized,
      lastCheck: Date.now(),
      performance: stats,
      configuration: {
        enabled: true,
        canaryEnabled: false,
        rollbackEnabled: false,
        performanceMonitoring: true
      }
    };
  }

  /**
   * Get performance statistics
   */
  getPerformanceStats(): NLWebPerformanceStats {
    return { ...this.performanceStats };
  }

  /**
   * Force a health check
   */
  async forceHealthCheck(): Promise<NLWebHealthStatus> {
    return this.getHealthStatus();
  }

  /**
   * Shutdown the router
   */
  async shutdown(): Promise<void> {
    this.cache.clear();
    this.initialized = false;
    this.emitEvent('health_check', { status: 'shutdown' });
  }

  /**
   * Process a query and generate tool suggestions
   */
  private async processQuery(request: NLWebSuggestionRequest): Promise<NLWebSuggestion[]> {
    const { query } = request;
    const maxSuggestions = query.maxSuggestions || 3;
    const minScore = query.minScore || 30;

    // Get contextual tools
    const contextualTools = this.toolRegistry.getContextualTools(query.context);
    
    // Score tools against the query
    const scoredTools = await this.scoreTools(query.text, contextualTools, query.context);
    
    // Filter by minimum score and limit results
    const suggestions = scoredTools
      .filter(score => score.score >= minScore)
      .slice(0, maxSuggestions)
      .map(score => this.createSuggestion(score, query));

    return suggestions;
  }

  /**
   * Score tools against a query
   */
  private async scoreTools(
    query: string, 
    tools: NLWebTool[], 
    context: NLWebContext
  ): Promise<Array<{ tool: NLWebTool; score: number; reasoning: string }>> {
    const normalizedQuery = query.toLowerCase();
    const results: Array<{ tool: NLWebTool; score: number; reasoning: string }> = [];

    for (const tool of tools) {
      let score = 0;
      const reasoning: string[] = [];

      // Base score from tool priority
      score += tool.priority * 0.1;
      reasoning.push(`Base priority: ${tool.priority}`);

      // Name matching
      if (tool.name.toLowerCase().includes(normalizedQuery)) {
        score += 40;
        reasoning.push('Tool name matches query');
      }

      // Description matching
      const descriptionWords = tool.description.toLowerCase().split(/\s+/);
      const queryWords = normalizedQuery.split(/\s+/);
      const matchingWords = queryWords.filter(word => 
        descriptionWords.some(descWord => descWord.includes(word) || word.includes(descWord))
      );
      
      if (matchingWords.length > 0) {
        score += matchingWords.length * 10;
        reasoning.push(`Description matches: ${matchingWords.join(', ')}`);
      }

      // Tag matching
      const matchingTags = tool.tags.filter(tag => 
        normalizedQuery.includes(tag.toLowerCase()) || tag.toLowerCase().includes(normalizedQuery)
      );
      
      if (matchingTags.length > 0) {
        score += matchingTags.length * 15;
        reasoning.push(`Tags match: ${matchingTags.join(', ')}`);
      }

      // Example matching
      const matchingExamples = tool.examples.filter(example => 
        example.toLowerCase().includes(normalizedQuery) || normalizedQuery.includes(example.toLowerCase())
      );
      
      if (matchingExamples.length > 0) {
        score += matchingExamples.length * 20;
        reasoning.push(`Examples match: ${matchingExamples.join(', ')}`);
      }

      // Context-based scoring
      score += this.scoreContextualRelevance(tool, context, reasoning);

      // Cap the score at 100
      score = Math.min(score, 100);

      results.push({
        tool,
        score,
        reasoning: reasoning.join('; ')
      });
    }

    // Sort by score (highest first)
    return results.sort((a, b) => b.score - a.score);
  }

  /**
   * Score contextual relevance of a tool
   */
  private scoreContextualRelevance(
    tool: NLWebTool, 
    context: NLWebContext, 
    reasoning: string[]
  ): number {
    let score = 0;

    // Path-based scoring
    if (context.currentPath && tool.tags.includes('file-operations')) {
      score += 15;
      reasoning.push('Context: file operations in current path');
    }

    // Git-based scoring
    if (context.gitStatus?.isRepository && tool.tags.includes('git')) {
      score += 20;
      reasoning.push('Context: git repository detected');
      
      if (context.gitStatus.isDirty && tool.name.includes('commit')) {
        score += 10;
        reasoning.push('Context: repository has uncommitted changes');
      }
    }

    // Selection-based scoring
    if (context.selectedItems && context.selectedItems.length > 0) {
      if (tool.tags.includes('batch-operations')) {
        score += 15;
        reasoning.push('Context: batch operations on selected items');
      }
      
      if (tool.tags.includes('single-item') && context.selectedItems.length === 1) {
        score += 10;
        reasoning.push('Context: single item selected');
      }
    }

    // User preference scoring
    if (context.userPreferences) {
      const preferredCategory = context.userPreferences.preferredCategory;
      if (preferredCategory && tool.category === preferredCategory) {
        score += 10;
        reasoning.push('Context: matches user preferred category');
      }
    }

    return score;
  }

  /**
   * Create a suggestion from a scored tool
   */
  private createSuggestion(
    scoredTool: { tool: NLWebTool; score: number; reasoning: string },
    query: { context: NLWebContext; includeReasoning?: boolean }
  ): NLWebSuggestion {
    const { tool, score, reasoning } = scoredTool;
    
    // Generate suggested parameters based on context
    const parameters = this.generateSuggestedParameters(tool, query.context);
    
    // Generate parameter hints
    const parameterHints = this.generateParameterHints(tool, query.context);

    return {
      tool,
      score,
      parameters,
      reasoning: query.includeReasoning ? reasoning : '',
      parameterHints
    };
  }

  /**
   * Generate suggested parameters for a tool
   */
  private generateSuggestedParameters(tool: NLWebTool, context: NLWebContext): Record<string, any> {
    const parameters: Record<string, any> = {};

    for (const param of tool.parameters) {
      // Use context to suggest parameter values
      if (param.name === 'path' && context.currentPath) {
        parameters[param.name] = context.currentPath;
      } else if (param.name === 'dataset_path' && context.currentPath) {
        parameters[param.name] = context.currentPath;
      } else if (param.name === 'files' && context.selectedItems) {
        parameters[param.name] = context.selectedItems;
      } else if (param.name === 'message' && tool.name.includes('commit')) {
        parameters[param.name] = 'Auto-generated commit message';
      } else if (param.default !== undefined) {
        parameters[param.name] = param.default;
      }
    }

    return parameters;
  }

  /**
   * Generate parameter hints for a tool
   */
  private generateParameterHints(tool: NLWebTool, context: NLWebContext): Record<string, any> {
    const hints: Record<string, any> = {};

    for (const param of tool.parameters) {
      if (param.name === 'path' && context.currentPath) {
        hints[param.name] = {
          suggested: context.currentPath,
          type: 'path',
          description: 'Current working directory'
        };
      } else if (param.name === 'files' && context.selectedItems) {
        hints[param.name] = {
          suggested: context.selectedItems,
          type: 'array',
          description: 'Currently selected items'
        };
      } else if (param.constraints) {
        hints[param.name] = {
          constraints: param.constraints,
          type: param.type,
          description: param.description
        };
      }
    }

    return hints;
  }

  /**
   * Generate cache key for a request
   */
  private generateCacheKey(request: NLWebSuggestionRequest): string {
    const query = request.query.text.toLowerCase().trim();
    const context = JSON.stringify(request.query.context, Object.keys(request.query.context).sort());
    return `${query}|${context}`;
  }

  /**
   * Check if cache entry is valid
   */
  private isCacheValid(timestamp: number): boolean {
    const cacheTTL = 10 * 60 * 1000; // 10 minutes
    return Date.now() - timestamp < cacheTTL;
  }

  /**
   * Clean up expired cache entries
   */
  private cleanupCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (!this.isCacheValid(entry.timestamp)) {
        this.cache.delete(key);
      }
    }
    
    // Limit cache size
    if (this.cache.size > this.performanceStats.maxCacheSize) {
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const toDelete = entries.slice(0, entries.length - this.performanceStats.maxCacheSize);
      for (const [key] of toDelete) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Update performance statistics
   */
  private updatePerformanceStats(processingTime: number): void {
    this.performanceStats.totalRequests++;
    this.performanceStats.cacheSize = this.cache.size;
    
    // Update average processing time
    const totalTime = this.performanceStats.avgProcessingTime * (this.performanceStats.totalRequests - 1) + processingTime;
    this.performanceStats.avgProcessingTime = totalTime / this.performanceStats.totalRequests;
    
    // Update cache hit rate
    const totalCacheOps = this.performanceStats.cacheHits + this.performanceStats.cacheMisses;
    this.performanceStats.cacheHitRate = totalCacheOps > 0 ? (this.performanceStats.cacheHits / totalCacheOps) * 100 : 0;
  }

  /**
   * Generate a unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Emit an event
   */
  private emitEvent(type: NLWebEvent['type'], data: any): void {
    const event: NLWebEvent = {
      type,
      timestamp: Date.now(),
      data
    };
    this.eventEmitter.emit(event);
  }
}
