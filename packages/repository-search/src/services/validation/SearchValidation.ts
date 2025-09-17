/**
 * Search Validation
 *
 * Provides comprehensive input validation and sanitization for search operations
 * to ensure data integrity and prevent injection attacks.
 */

import type { ModalityType, SearchOptions } from "../../types";
import type { VectorSearchOptions, HybridSearchOptions } from "../types/SearchTypes";
import { RepositoryError } from "../../types";

export class SearchValidationError extends RepositoryError {
  constructor(message: string, field: string, value: unknown) {
    super(`Validation failed for ${field}: ${message}`, "VALIDATION_ERROR", { field, value });
  }
}

export class SearchValidator {
  private static readonly MAX_QUERY_LENGTH = 1000;
  private static readonly MIN_QUERY_LENGTH = 1;
  private static readonly MAX_TOP_K = 1000;
  private static readonly MIN_TOP_K = 1;
  private static readonly MAX_SIMILARITY_THRESHOLD = 1.0;
  private static readonly MIN_SIMILARITY_THRESHOLD = 0.0;
  private static readonly MAX_WEIGHT = 1.0;
  private static readonly MIN_WEIGHT = 0.0;

  /**
   * Validate search query
   */
  static validateQuery(query: string): string {
    if (typeof query !== 'string') {
      throw new SearchValidationError('Query must be a string', 'query', query);
    }

    const trimmedQuery = query.trim();
    
    if (trimmedQuery.length < this.MIN_QUERY_LENGTH) {
      throw new SearchValidationError(`Query must be at least ${this.MIN_QUERY_LENGTH} character long`, 'query', query);
    }

    if (trimmedQuery.length > this.MAX_QUERY_LENGTH) {
      throw new SearchValidationError(`Query must be no more than ${this.MAX_QUERY_LENGTH} characters long`, 'query', query);
    }

    // Check for potentially malicious content
    if (this.containsSuspiciousContent(trimmedQuery)) {
      throw new SearchValidationError('Query contains potentially malicious content', 'query', query);
    }

    return trimmedQuery;
  }

  /**
   * Validate file ID
   */
  static validateFileId(fileId: string): string {
    if (typeof fileId !== 'string') {
      throw new SearchValidationError('File ID must be a string', 'fileId', fileId);
    }

    const trimmedId = fileId.trim();
    
    if (trimmedId.length === 0) {
      throw new SearchValidationError('File ID cannot be empty', 'fileId', fileId);
    }

    // Basic UUID or alphanumeric validation
    if (!/^[a-zA-Z0-9\-_]+$/.test(trimmedId)) {
      throw new SearchValidationError('File ID contains invalid characters', 'fileId', fileId);
    }

    return trimmedId;
  }

  /**
   * Validate modality type
   */
  static validateModality(modality: ModalityType): ModalityType {
    const validModalities: ModalityType[] = ['text', 'image', 'audio', 'video', 'data', 'code', 'document'];
    
    if (!validModalities.includes(modality)) {
      throw new SearchValidationError(`Invalid modality type: ${modality}`, 'modality', modality);
    }

    return modality;
  }

  /**
   * Validate top K parameter
   */
  static validateTopK(topK: number): number {
    if (typeof topK !== 'number' || !Number.isInteger(topK)) {
      throw new SearchValidationError('Top K must be an integer', 'topK', topK);
    }

    if (topK < this.MIN_TOP_K || topK > this.MAX_TOP_K) {
      throw new SearchValidationError(`Top K must be between ${this.MIN_TOP_K} and ${this.MAX_TOP_K}`, 'topK', topK);
    }

    return topK;
  }

  /**
   * Validate similarity threshold
   */
  static validateSimilarityThreshold(threshold: number): number {
    if (typeof threshold !== 'number') {
      throw new SearchValidationError('Similarity threshold must be a number', 'similarityThreshold', threshold);
    }

    if (threshold < this.MIN_SIMILARITY_THRESHOLD || threshold > this.MAX_SIMILARITY_THRESHOLD) {
      throw new SearchValidationError(`Similarity threshold must be between ${this.MIN_SIMILARITY_THRESHOLD} and ${this.MAX_SIMILARITY_THRESHOLD}`, 'similarityThreshold', threshold);
    }

    return threshold;
  }

  /**
   * Validate weight parameter
   */
  static validateWeight(weight: number, fieldName: string): number {
    if (typeof weight !== 'number') {
      throw new SearchValidationError(`${fieldName} must be a number`, fieldName, weight);
    }

    if (weight < this.MIN_WEIGHT || weight > this.MAX_WEIGHT) {
      throw new SearchValidationError(`${fieldName} must be between ${this.MIN_WEIGHT} and ${this.MAX_WEIGHT}`, fieldName, weight);
    }

    return weight;
  }

  /**
   * Validate search options
   */
  static validateSearchOptions(options: Partial<SearchOptions>): SearchOptions {
    const validated: SearchOptions = {};

    if (options.topK !== undefined) {
      validated.topK = this.validateTopK(options.topK);
    }

    if (options.similarityThreshold !== undefined) {
      validated.similarityThreshold = this.validateSimilarityThreshold(options.similarityThreshold);
    }

    if (options.includeMetadata !== undefined) {
      validated.includeMetadata = Boolean(options.includeMetadata);
    }

    if (options.rerank !== undefined) {
      validated.rerank = Boolean(options.rerank);
    }

    if (options.hybrid !== undefined) {
      validated.hybrid = Boolean(options.hybrid);
    }

    if (options.includeEmbeddings !== undefined) {
      validated.includeEmbeddings = Boolean(options.includeEmbeddings);
    }

    return validated;
  }

  /**
   * Validate vector search options
   */
  static validateVectorSearchOptions(options: Partial<VectorSearchOptions>): VectorSearchOptions {
    const validated: VectorSearchOptions = {
      topK: this.validateTopK(options.topK ?? 10),
      similarityThreshold: this.validateSimilarityThreshold(options.similarityThreshold ?? 0.7),
      includeMetadata: Boolean(options.includeMetadata ?? true),
      rerank: Boolean(options.rerank ?? false),
    };

    if (options.modality !== undefined) {
      validated.modality = this.validateModality(options.modality);
    }

    return validated;
  }

  /**
   * Validate hybrid search options
   */
  static validateHybridSearchOptions(options: Partial<HybridSearchOptions>): HybridSearchOptions {
    const baseOptions = this.validateVectorSearchOptions(options);
    
    return {
      ...baseOptions,
      keywordWeight: this.validateWeight(options.keywordWeight ?? 0.5, 'keywordWeight'),
      vectorWeight: this.validateWeight(options.vectorWeight ?? 0.5, 'vectorWeight'),
      enableReranking: Boolean(options.enableReranking ?? false),
    };
  }

  /**
   * Validate modalities array
   */
  static validateModalities(modalities: ModalityType[]): ModalityType[] {
    if (!Array.isArray(modalities)) {
      throw new SearchValidationError('Modalities must be an array', 'modalities', modalities);
    }

    if (modalities.length === 0) {
      throw new SearchValidationError('At least one modality must be specified', 'modalities', modalities);
    }

    if (modalities.length > 10) {
      throw new SearchValidationError('Too many modalities specified (max 10)', 'modalities', modalities);
    }

    return modalities.map(modality => this.validateModality(modality));
  }

  /**
   * Validate limit parameter
   */
  static validateLimit(limit: number): number {
    if (typeof limit !== 'number' || !Number.isInteger(limit)) {
      throw new SearchValidationError('Limit must be an integer', 'limit', limit);
    }

    if (limit < 1 || limit > 100) {
      throw new SearchValidationError('Limit must be between 1 and 100', 'limit', limit);
    }

    return limit;
  }

  /**
   * Check for suspicious content in query
   */
  private static containsSuspiciousContent(query: string): boolean {
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /eval\s*\(/i,
      /expression\s*\(/i,
      /url\s*\(/i,
      /import\s+/i,
      /require\s*\(/i,
      /\.\.\//g, // Path traversal
      /union\s+select/i,
      /drop\s+table/i,
      /delete\s+from/i,
      /insert\s+into/i,
      /update\s+set/i,
    ];

    return suspiciousPatterns.some(pattern => pattern.test(query));
  }
}
