/**
 * Parquet Service
 *
 * Specialized service for processing Apache Parquet files with schema inference,
 * columnar analytics, and integration with the unified repository system.
 */

import { BaseAIService } from "reynard-ai-shared";
import type { ColumnStatistics, DataColumn, DataSchema, FileMetadata } from "../types";
import { RepositoryError } from "../types";

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
  orderBy?: { column: string; direction: "asc" | "desc" }[];
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

export class ParquetService extends BaseAIService {
  private parquetLib: any;
  private initialized = false;

  constructor() {
    super({
      name: "parquet-service",
      dependencies: [],
      startupPriority: 50,
      requiredPackages: ["parquetjs", "apache-arrow"],
      autoStart: true,
      config: {
        maxFileSize: 1024 * 1024 * 1024, // 1GB
        chunkSize: 10000,
        enableStatistics: true,
        enableSchemaInference: true,
      },
    });
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // Dynamically import parquet libraries
      const { ParquetReader } = await import("parquetjs");
      this.parquetLib = { ParquetReader };

      this.initialized = true;
      this.logger.info("ParquetService initialized successfully");
    } catch (error) {
      this.logger.error("Failed to initialize ParquetService:", error);
      throw new RepositoryError("Failed to initialize ParquetService", "PARQUET_INIT_ERROR", error);
    }
  }

  async shutdown(): Promise<void> {
    this.initialized = false;
    this.logger.info("ParquetService shutdown complete");
  }

  async healthCheck(): Promise<any> {
    return {
      status: this.initialized ? "healthy" : "unhealthy",
      parquetLib: !!this.parquetLib,
      lastCheck: new Date(),
    };
  }

  /**
   * Process a parquet file and extract comprehensive information
   */
  async processParquetFile(filePath: string): Promise<ParquetFileInfo> {
    this.ensureInitialized();

    try {
      const startTime = Date.now();

      // Read parquet file
      const reader = await this.parquetLib.ParquetReader.openFile(filePath);
      const schema = reader.getSchema();
      const metadata = reader.getMetadata();

      // Extract schema information
      const dataSchema = await this.extractSchema(schema);

      // Get row count
      const rowCount = await this.getRowCount(reader);

      // Extract column statistics
      const statistics = await this.extractColumnStatistics(reader, dataSchema);

      // Get file metadata
      const fileMetadata = await this.getFileMetadata(filePath);

      const processingTime = Date.now() - startTime;

      this.logger.info(`Processed parquet file ${filePath} in ${processingTime}ms`);

      return {
        path: filePath,
        size: fileMetadata.size,
        rowCount,
        columnCount: dataSchema.columns.length,
        schema: dataSchema,
        statistics,
        metadata: {
          ...metadata,
          processingTime,
          fileSize: fileMetadata.size,
          lastModified: fileMetadata.lastModified,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to process parquet file ${filePath}:`, error);
      throw new RepositoryError(`Failed to process parquet file: ${filePath}`, "PARQUET_PROCESSING_ERROR", error);
    }
  }

  /**
   * Query parquet file with filters and options
   */
  async queryParquetFile(filePath: string, options: ParquetQueryOptions = {}): Promise<ParquetQueryResult> {
    this.ensureInitialized();

    try {
      const startTime = Date.now();

      const reader = await this.parquetLib.ParquetReader.openFile(filePath);
      const cursor = reader.getCursor();

      const results: any[] = [];
      let totalRows = 0;
      let columns: string[] = [];

      // Apply column selection
      if (options.columns) {
        cursor.select(options.columns);
        columns = options.columns;
      } else {
        columns = reader.getSchema().getColumnNames();
      }

      // Apply filters
      if (options.filters) {
        cursor.filter(options.filters);
      }

      // Apply ordering
      if (options.orderBy) {
        for (const order of options.orderBy) {
          cursor.orderBy(order.column, order.direction);
        }
      }

      // Apply limit and offset
      if (options.offset) {
        cursor.skip(options.offset);
      }

      const limit = options.limit || 1000;
      let count = 0;

      // Read data
      let record;
      while ((record = await cursor.next()) && count < limit) {
        results.push(record);
        count++;
        totalRows++;
      }

      // Get total row count if needed
      if (!options.limit || results.length === options.limit) {
        totalRows = await this.getRowCount(reader);
      }

      const executionTime = Date.now() - startTime;

      return {
        data: results,
        totalRows,
        columns,
        executionTime,
        metadata: {
          filePath,
          queryTime: new Date(),
          rowCount: totalRows,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to query parquet file ${filePath}:`, error);
      throw new RepositoryError(`Failed to query parquet file: ${filePath}`, "PARQUET_QUERY_ERROR", error);
    }
  }

  /**
   * Extract schema information from parquet file
   */
  private async extractSchema(parquetSchema: any): Promise<DataSchema> {
    const columns: DataColumn[] = [];

    for (const [name, field] of parquetSchema.schema) {
      const column: DataColumn = {
        name,
        type: this.mapParquetTypeToSQL(field.primitiveType),
        nullable: field.repetitionType === "OPTIONAL",
        description: field.name || name,
      };

      columns.push(column);
    }

    return {
      columns,
      primaryKey: [], // Parquet doesn't have explicit primary keys
      indexes: [],
      constraints: [],
    };
  }

  /**
   * Extract column statistics from parquet file
   */
  private async extractColumnStatistics(reader: any, schema: DataSchema): Promise<ColumnStatistics[]> {
    const statistics: ColumnStatistics[] = [];

    for (const column of schema.columns) {
      try {
        const stats = await this.calculateColumnStatistics(reader, column);
        statistics.push(stats);
      } catch (error) {
        this.logger.warn(`Failed to calculate statistics for column ${column.name}:`, error);
        // Add empty statistics for failed columns
        statistics.push({
          name: column.name,
          type: column.type,
          nullable: column.nullable,
          nullCount: 0,
          distinctCount: 0,
        });
      }
    }

    return statistics;
  }

  /**
   * Calculate statistics for a specific column
   */
  private async calculateColumnStatistics(reader: any, column: DataColumn): Promise<ColumnStatistics> {
    const cursor = reader.getCursor();
    cursor.select([column.name]);

    const values: any[] = [];
    let nullCount = 0;

    let record;
    while ((record = await cursor.next())) {
      const value = record[column.name];
      if (value === null || value === undefined) {
        nullCount++;
      } else {
        values.push(value);
      }
    }

    const distinctValues = new Set(values);
    const distinctCount = distinctValues.size;

    const stats: ColumnStatistics = {
      name: column.name,
      type: column.type,
      nullable: column.nullable,
      nullCount,
      distinctCount,
    };

    // Calculate numeric statistics for numeric columns
    if (this.isNumericType(column.type) && values.length > 0) {
      const numericValues = values.map(v => Number(v)).filter(v => !isNaN(v));

      if (numericValues.length > 0) {
        numericValues.sort((a, b) => a - b);

        stats.min = numericValues[0];
        stats.max = numericValues[numericValues.length - 1];
        stats.mean = numericValues.reduce((sum, val) => sum + val, 0) / numericValues.length;
        stats.median = this.calculateMedian(numericValues);
        stats.stdDev = this.calculateStandardDeviation(numericValues, stats.mean);
      }
    }

    // Get top values for categorical data
    if (distinctCount <= 100) {
      // Only for columns with reasonable number of distinct values
      const valueCounts = new Map<any, number>();
      values.forEach(value => {
        valueCounts.set(value, (valueCounts.get(value) || 0) + 1);
      });

      const topValues = Array.from(valueCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([value, count]) => ({ value, count }));

      stats.topValues = topValues;
    }

    return stats;
  }

  /**
   * Get row count from parquet file
   */
  private async getRowCount(reader: any): Promise<number> {
    try {
      // Try to get row count from metadata first
      const metadata = reader.getMetadata();
      if (metadata.num_rows) {
        return metadata.num_rows;
      }

      // Fallback: count rows by iterating
      const cursor = reader.getCursor();
      let count = 0;
      while (await cursor.next()) {
        count++;
      }
      return count;
    } catch (error) {
      this.logger.warn("Failed to get row count:", error);
      return 0;
    }
  }

  /**
   * Get file metadata
   */
  private async getFileMetadata(filePath: string): Promise<{ size: number; lastModified: Date }> {
    try {
      const fs = await import("fs/promises");
      const stats = await fs.stat(filePath);
      return {
        size: stats.size,
        lastModified: stats.mtime,
      };
    } catch (error) {
      this.logger.warn(`Failed to get file metadata for ${filePath}:`, error);
      return {
        size: 0,
        lastModified: new Date(),
      };
    }
  }

  /**
   * Map parquet primitive types to SQL types
   */
  private mapParquetTypeToSQL(primitiveType: string): string {
    const typeMap: Record<string, string> = {
      BOOLEAN: "BOOLEAN",
      INT32: "INTEGER",
      INT64: "BIGINT",
      INT96: "BIGINT",
      FLOAT: "REAL",
      DOUBLE: "DOUBLE PRECISION",
      BYTE_ARRAY: "TEXT",
      FIXED_LEN_BYTE_ARRAY: "TEXT",
    };

    return typeMap[primitiveType] || "TEXT";
  }

  /**
   * Check if a type is numeric
   */
  private isNumericType(type: string): boolean {
    const numericTypes = ["INTEGER", "BIGINT", "REAL", "DOUBLE PRECISION", "DECIMAL", "NUMERIC"];
    return numericTypes.includes(type.toUpperCase());
  }

  /**
   * Calculate median of numeric array
   */
  private calculateMedian(values: number[]): number {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 0) {
      return (sorted[mid - 1] + sorted[mid]) / 2;
    } else {
      return sorted[mid];
    }
  }

  /**
   * Calculate standard deviation
   */
  private calculateStandardDeviation(values: number[], mean: number): number {
    const variance = values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  /**
   * Ensure service is initialized
   */
  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new RepositoryError("ParquetService not initialized. Call initialize() first.", "PARQUET_NOT_INITIALIZED");
    }
  }

  /**
   * Create file metadata for parquet files
   */
  async createFileMetadata(parquetInfo: ParquetFileInfo): Promise<FileMetadata> {
    return {
      title: parquetInfo.path.split("/").pop()?.replace(".parquet", ""),
      description: `Parquet file with ${parquetInfo.rowCount} rows and ${parquetInfo.columnCount} columns`,
      mimeType: "application/parquet",
      lastModified: new Date(parquetInfo.metadata.lastModified),
      checksum: "", // Will be calculated by file service
      schema: parquetInfo.schema,
      rowCount: parquetInfo.rowCount,
      columnCount: parquetInfo.columnCount,
      custom: {
        parquetMetadata: parquetInfo.metadata,
        columnStatistics: parquetInfo.statistics,
      },
    };
  }

  /**
   * Validate parquet file
   */
  async validateParquetFile(filePath: string): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      const reader = await this.parquetLib.ParquetReader.openFile(filePath);

      // Basic validation
      const schema = reader.getSchema();
      if (!schema || schema.getColumnNames().length === 0) {
        errors.push("Parquet file has no columns");
      }

      const rowCount = await this.getRowCount(reader);
      if (rowCount === 0) {
        errors.push("Parquet file is empty");
      }

      // Check for corrupted data
      try {
        const cursor = reader.getCursor();
        let count = 0;
        while ((await cursor.next()) && count < 100) {
          // Sample first 100 rows
          count++;
        }
      } catch (error) {
        errors.push(`Data corruption detected: ${error}`);
      }
    } catch (error) {
      errors.push(`Failed to read parquet file: ${error}`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
