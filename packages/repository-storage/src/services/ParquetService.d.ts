/**
 * Parquet Service
 *
 * Specialized service for processing Apache Parquet files with schema inference,
 * columnar analytics, and integration with the unified repository system.
 */
import type { ColumnStatistics, DataSchema, FileMetadata } from "../types";
export interface ParquetFileInfo {
    path: string;
    size: number;
    rowCount: number;
    columnCount: number;
    schema: DataSchema;
    statistics: ColumnStatistics[];
    metadata: Record<string, any>;
}
export interface ParquetQueryOptions {
    columns?: string[];
    filters?: Record<string, any>;
    limit?: number;
    offset?: number;
    orderBy?: {
        column: string;
        direction: "asc" | "desc";
    }[];
}
export interface ParquetQueryResult {
    data: any[];
    totalRows: number;
    columns: string[];
    executionTime: number;
    metadata: {
        filePath: string;
        queryTime: Date;
        rowCount: number;
    };
}
export declare class ParquetService extends BaseAIService {
    private parquetLib;
    private initialized;
    constructor();
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
    healthCheck(): Promise<any>;
    /**
     * Process a parquet file and extract comprehensive information
     */
    processParquetFile(filePath: string): Promise<ParquetFileInfo>;
    /**
     * Query parquet file with filters and options
     */
    queryParquetFile(filePath: string, options?: ParquetQueryOptions): Promise<ParquetQueryResult>;
    /**
     * Extract schema information from parquet file
     */
    private extractSchema;
    /**
     * Extract column statistics from parquet file
     */
    private extractColumnStatistics;
    /**
     * Calculate statistics for a specific column
     */
    private calculateColumnStatistics;
    /**
     * Get row count from parquet file
     */
    private getRowCount;
    /**
     * Get file metadata
     */
    private getFileMetadata;
    /**
     * Map parquet primitive types to SQL types
     */
    private mapParquetTypeToSQL;
    /**
     * Check if a type is numeric
     */
    private isNumericType;
    /**
     * Calculate median of numeric array
     */
    private calculateMedian;
    /**
     * Calculate standard deviation
     */
    private calculateStandardDeviation;
    /**
     * Ensure service is initialized
     */
    private ensureInitialized;
    /**
     * Create file metadata for parquet files
     */
    createFileMetadata(parquetInfo: ParquetFileInfo): Promise<FileMetadata>;
    /**
     * Validate parquet file
     */
    validateParquetFile(filePath: string): Promise<{
        valid: boolean;
        errors: string[];
    }>;
}
