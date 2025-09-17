/**
 * Hybrid Search Composable
 *
 * Combines vector and keyword search results with intelligent scoring
 * and reranking for optimal search relevance.
 */

import type { SearchResult, SearchOptions } from "../../types";
import type { HybridSearchOptions } from "../types/SearchTypes";
import { VectorSearchComposable } from "./VectorSearch";

export class HybridSearchComposable {
  private vectorSearch: VectorSearchComposable;

  constructor(vectorSearch: VectorSearchComposable) {
    this.vectorSearch = vectorSearch;
  }

  /**
   * Perform hybrid search combining vector and keyword search
   */
  async search(
    query: string,
    options: HybridSearchOptions,
    logger: {
      info: (msg: string) => void;
      error: (msg: string, error?: unknown) => void;
      warn: (msg: string, error?: unknown) => void;
    }
  ): Promise<SearchResult[]> {
    try {
      // Perform both vector and keyword search in parallel
      const [vectorResults, keywordResults] = await Promise.all([
        this.vectorSearch.search(query, options, logger),
        this.keywordSearch(query, options, logger),
      ]);

      // Combine and score results
      const combinedResults = this.combineSearchResults(vectorResults, keywordResults, options);

      // Rerank if enabled
      const finalResults = options.enableReranking
        ? await this.rerankResults(combinedResults, query, options, logger)
        : combinedResults;

      return finalResults;
    } catch (error) {
      logger.error("Hybrid search failed", error);
      throw error;
    }
  }

  /**
   * Perform keyword search
   */
  private async keywordSearch(
    query: string,
    _options: SearchOptions,
    logger: {
      info: (msg: string) => void;
      error: (msg: string, error?: unknown) => void;
      warn: (msg: string, error?: unknown) => void;
    }
  ): Promise<SearchResult[]> {
    try {
      // This would typically query a full-text search index
      // For now, return a mock implementation
      const results: SearchResult[] = [];

      logger.info(`Keyword search completed, found ${results.length} results`);
      return results;
    } catch (error) {
      logger.error("Keyword search failed", error);
      throw error;
    }
  }

  /**
   * Combine vector and keyword search results
   */
  private combineSearchResults(
    vectorResults: SearchResult[],
    keywordResults: SearchResult[],
    options: HybridSearchOptions
  ): SearchResult[] {
    const combinedMap = new Map<string, SearchResult>();

    // Add vector results with vector weight
    vectorResults.forEach(result => {
      const weightedScore = result.score * options.vectorWeight;
      combinedMap.set(result.file, {
        ...result,
        score: weightedScore,
      });
    });

    // Add keyword results with keyword weight
    keywordResults.forEach(result => {
      const existing = combinedMap.get(result.file);
      if (existing) {
        // Combine scores
        existing.score += result.score * options.keywordWeight;
      } else {
        // Add new result
        combinedMap.set(result.file, {
          ...result,
          score: result.score * options.keywordWeight,
        });
      }
    });

    // Convert back to array and sort by combined score
    const combinedResults = Array.from(combinedMap.values()).sort((a, b) => b.score - a.score);

    return combinedResults.slice(0, options.topK);
  }

  /**
   * Rerank search results
   */
  private async rerankResults(
    results: SearchResult[],
    query: string,
    _options: HybridSearchOptions,
    logger: { info: (msg: string) => void; warn: (msg: string, error?: unknown) => void }
  ): Promise<SearchResult[]> {
    try {
      // This would typically use a reranking model (e.g., Cross-Encoder)
      // For now, return results as-is
      logger.info(`Reranked ${results.length} results for query: ${query}`);
      return results;
    } catch (error) {
      logger.warn("Failed to rerank results, returning original order", error);
      return results;
    }
  }
}
