/**
 * Search Strategy Pattern
 *
 * Defines the interface and implementations for different search strategies
 * with proper error handling and result processing.
 */

import type { ModalityType, SearchResult, SearchOptions } from "../../types";
import type { VectorSearchOptions, HybridSearchOptions, SearchMetrics } from "../types/SearchTypes";
import type { Logger } from "../types/Logger";

export interface SearchStrategy {
  readonly name: string;
  search(query: string, options: unknown, logger: Logger): Promise<SearchResult[]>;
}

export interface SearchStrategyResult {
  results: SearchResult[];
  metrics: Partial<SearchMetrics>;
  strategy: string;
}

/**
 * Vector Search Strategy
 */
export class VectorSearchStrategy implements SearchStrategy {
  readonly name = "vector";

  constructor(
    private vectorSearchComposable: any, // Will be properly typed when we refactor the composables
    private searchConfig: any
  ) {}

  async search(query: string, options: Partial<VectorSearchOptions>, logger: Logger): Promise<SearchResult[]> {
    const startTime = Date.now();

    try {
      logger.info("Starting vector search", { query: query.substring(0, 100), options });

      const results = await this.vectorSearchComposable.search(query, options, {
        info: (msg: string) => logger.info(msg, { strategy: this.name }),
        error: (msg: string, error?: unknown) => logger.error(msg, error as Error, { strategy: this.name }),
        warn: (msg: string, error?: unknown) => logger.warn(msg, { strategy: this.name, error }),
      });

      const duration = Date.now() - startTime;
      logger.info("Vector search completed", {
        duration,
        resultCount: results.length,
        strategy: this.name,
      });

      return results;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error("Vector search failed", error as Error, {
        query: query.substring(0, 100),
        duration,
        strategy: this.name,
      });
      throw error;
    }
  }
}

/**
 * Hybrid Search Strategy
 */
export class HybridSearchStrategy implements SearchStrategy {
  readonly name = "hybrid";

  constructor(
    private hybridSearchComposable: any, // Will be properly typed when we refactor the composables
    private searchConfig: any
  ) {}

  async search(query: string, options: Partial<HybridSearchOptions>, logger: Logger): Promise<SearchResult[]> {
    const startTime = Date.now();

    try {
      logger.info("Starting hybrid search", { query: query.substring(0, 100), options });

      const results = await this.hybridSearchComposable.search(query, options, {
        info: (msg: string) => logger.info(msg, { strategy: this.name }),
        error: (msg: string, error?: unknown) => logger.error(msg, error as Error, { strategy: this.name }),
        warn: (msg: string, error?: unknown) => logger.warn(msg, { strategy: this.name, error }),
      });

      const duration = Date.now() - startTime;
      logger.info("Hybrid search completed", {
        duration,
        resultCount: results.length,
        strategy: this.name,
      });

      return results;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error("Hybrid search failed", error as Error, {
        query: query.substring(0, 100),
        duration,
        strategy: this.name,
      });
      throw error;
    }
  }
}

/**
 * Keyword Search Strategy
 */
export class KeywordSearchStrategy implements SearchStrategy {
  readonly name = "keyword";

  constructor(private searchConfig: any) {}

  async search(query: string, options: Partial<SearchOptions>, logger: Logger): Promise<SearchResult[]> {
    const startTime = Date.now();

    try {
      logger.info("Starting keyword search", { query: query.substring(0, 100), options });

      // TODO: Implement actual keyword search logic
      // This would typically involve:
      // 1. Query parsing and tokenization
      // 2. Full-text search against indexed content
      // 3. Result scoring and ranking
      // 4. Metadata enrichment

      const results: SearchResult[] = [];

      const duration = Date.now() - startTime;
      logger.info("Keyword search completed", {
        duration,
        resultCount: results.length,
        strategy: this.name,
      });

      return results;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error("Keyword search failed", error as Error, {
        query: query.substring(0, 100),
        duration,
        strategy: this.name,
      });
      throw error;
    }
  }
}

/**
 * Search Strategy Factory
 */
export class SearchStrategyFactory {
  private strategies: Map<string, SearchStrategy> = new Map();

  constructor(vectorSearchComposable: any, hybridSearchComposable: any, searchConfig: any) {
    this.strategies.set("vector", new VectorSearchStrategy(vectorSearchComposable, searchConfig));
    this.strategies.set("hybrid", new HybridSearchStrategy(hybridSearchComposable, searchConfig));
    this.strategies.set("keyword", new KeywordSearchStrategy(searchConfig));
  }

  getStrategy(strategyName: string): SearchStrategy {
    const strategy = this.strategies.get(strategyName);
    if (!strategy) {
      throw new Error(`Unknown search strategy: ${strategyName}`);
    }
    return strategy;
  }

  getAvailableStrategies(): string[] {
    return Array.from(this.strategies.keys());
  }
}
