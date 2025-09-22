/**
 * Core types and interfaces for the Reynard Unified Repository system.
 *
 * This module defines the fundamental data structures for managing
 * multimodal datasets with comprehensive type safety.
 */

// Note: These imports will be available when the packages are properly set up
// import type { MultiModalFile } from "reynard-multimodal";
// import type { RAGResult } from "reynard-rag";

// Temporary types until dependencies are resolved
export interface MultiModalFile {
  id: string;
  path: string;
  name: string;
  size: number;
  type: string;
  metadata?: Record<string, any>;
}

export interface RAGResult {
  id: string;
  content: string;
  score: number;
  metadata?: Record<string, any>;
}

// ============================================================================
// Core Dataset Types
// ============================================================================

export interface Dataset {
  id: string;
  name: string;
  description?: string;
  version: string;
  tags: string[];
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  status: DatasetStatus;
  statistics: DatasetStatistics;
}

export enum DatasetStatus {
  DRAFT = "draft",
  ACTIVE = "active",
  ARCHIVED = "archived",
  PROCESSING = "processing",
  ERROR = "error",
}

export interface DatasetStatistics {
  totalFiles: number;
  totalSize: number;
  fileTypeCounts: Record<string, number>;
  modalityCounts: Record<ModalityType, number>;
  lastIngested: Date;
}

// ============================================================================
// File and Modality Types
// ============================================================================

export interface RepositoryFile extends MultiModalFile {
  id: string;
  datasetId: string;
  path: string;
  fileType: FileType;
  modality: ModalityType;
  size: number;
  hash: string;
  metadata: FileMetadata;
  embeddings?: FileEmbeddings;
  createdAt: Date;
  updatedAt: Date;
}

export enum FileType {
  // Data formats
  PARQUET = "parquet",
  ARROW = "arrow",
  FEATHER = "feather",
  HDF5 = "hdf5",
  CSV = "csv",
  TSV = "tsv",
  JSON = "json",
  JSONL = "jsonl",

  // Media formats
  IMAGE = "image",
  VIDEO = "video",
  AUDIO = "audio",

  // Document formats
  PDF = "pdf",
  HTML = "html",
  MARKDOWN = "markdown",
  DOCX = "docx",
  EPUB = "epub",

  // Text formats
  TEXT = "text",

  // Code formats
  CODE = "code",

  // Archive formats
  ZIP = "zip",
  TAR = "tar",
  GZIP = "gzip",
}

export enum ModalityType {
  TEXT = "text",
  IMAGE = "image",
  AUDIO = "audio",
  VIDEO = "video",
  DATA = "data",
  CODE = "code",
  DOCUMENT = "document",
}

export interface FileMetadata {
  // Common metadata
  title?: string;
  description?: string;
  author?: string;
  language?: string;
  encoding?: string;

  // Media-specific metadata
  dimensions?: { width: number; height: number };
  duration?: number; // for audio/video
  bitrate?: number;
  sampleRate?: number; // for audio

  // Data-specific metadata
  schema?: DataSchema;
  rowCount?: number;
  columnCount?: number;

  // Document-specific metadata
  pageCount?: number;
  wordCount?: number;

  // Technical metadata
  mimeType: string;
  lastModified: Date;
  checksum: string;

  // Custom metadata
  custom: Record<string, any>;
}

export interface DataSchema {
  columns: DataColumn[];
  primaryKey?: string[];
  indexes?: DataIndex[];
  constraints?: DataConstraint[];
}

export interface DataColumn {
  name: string;
  type: string;
  nullable: boolean;
  description?: string;
  statistics?: ColumnStatistics;
}

export interface DataIndex {
  name: string;
  columns: string[];
  type: "btree" | "hash" | "gin" | "gist";
  unique: boolean;
}

export interface DataConstraint {
  name: string;
  type: "primary_key" | "foreign_key" | "unique" | "check";
  columns: string[];
  definition?: string;
}

export interface ColumnStatistics {
  min?: any;
  max?: any;
  mean?: number;
  median?: number;
  stdDev?: number;
  nullCount: number;
  distinctCount: number;
  topValues?: Array<{ value: any; count: number }>;
}

// ============================================================================
// Embedding and Vector Types
// ============================================================================

export interface FileEmbeddings {
  text?: VectorEmbedding;
  image?: VectorEmbedding;
  audio?: VectorEmbedding;
  data?: VectorEmbedding;
  multimodal?: VectorEmbedding;
}

export interface VectorEmbedding {
  id: string;
  modelId: string;
  dimensions: number;
  vector: number[];
  metadata: EmbeddingMetadata;
  createdAt: Date;
}

export interface EmbeddingMetadata {
  modality: ModalityType;
  modelVersion: string;
  processingTime: number;
  quality: number; // 0-1 score
  parameters: Record<string, any>;
}

// ============================================================================
// Search and Query Types
// ============================================================================

export interface SearchQuery {
  query: string;
  modalities?: ModalityType[];
  fileTypes?: FileType[];
  datasets?: string[];
  filters?: SearchFilters;
  options?: SearchOptions;
}

export interface SearchFilters {
  dateRange?: { from: Date; to: Date };
  sizeRange?: { min: number; max: number };
  tags?: string[];
  authors?: string[];
  languages?: string[];
  custom?: Record<string, any>;
}

export interface SearchOptions {
  topK?: number;
  similarityThreshold?: number;
  hybrid?: boolean; // Combine vector + keyword search
  rerank?: boolean;
  includeMetadata?: boolean;
  includeEmbeddings?: boolean;
}

export interface SearchResult extends RAGResult {
  file: RepositoryFile;
  dataset: Dataset;
  modality: ModalityType;
  relevanceScore: number;
  highlights?: SearchHighlight[];
}

export interface SearchHighlight {
  field: string;
  text: string;
  score: number;
  position: { start: number; end: number };
}

// ============================================================================
// Ingestion and Processing Types
// ============================================================================

export interface IngestionRequest {
  datasetId: string;
  files: IngestionFile[];
  options?: IngestionOptions;
}

export interface IngestionFile {
  path: string;
  metadata?: Partial<FileMetadata>;
  tags?: string[];
}

export interface IngestionOptions {
  generateEmbeddings?: boolean;
  extractMetadata?: boolean;
  generateThumbnails?: boolean;
  validateSchema?: boolean;
  overwrite?: boolean;
  batchSize?: number;
}

export interface IngestionResult {
  success: boolean;
  filesProcessed: number;
  filesSkipped: number;
  errors: IngestionError[];
  statistics: IngestionStatistics;
}

export interface IngestionError {
  file: string;
  error: string;
  code: string;
  details?: any;
}

export interface IngestionStatistics {
  totalSize: number;
  processingTime: number;
  embeddingsGenerated: number;
  metadataExtracted: number;
  thumbnailsGenerated: number;
}

// ============================================================================
// Versioning and Lineage Types
// ============================================================================

export interface DatasetVersion {
  id: string;
  datasetId: string;
  version: string;
  description?: string;
  changes: VersionChange[];
  createdAt: Date;
  createdBy: string;
  parentVersion?: string;
  tags: string[];
}

export interface VersionChange {
  type: "added" | "modified" | "removed";
  file: string;
  description: string;
  metadata?: any;
}

export interface DatasetLineage {
  datasetId: string;
  versions: DatasetVersion[];
  dependencies: DatasetDependency[];
  derivedFrom: string[];
  derivedTo: string[];
}

export interface DatasetDependency {
  type: "source" | "derived" | "reference";
  datasetId: string;
  version?: string;
  description: string;
}

// ============================================================================
// Configuration Types
// ============================================================================

export interface RepositoryConfig {
  database: DatabaseConfig;
  storage: StorageConfig;
  embeddings: EmbeddingConfig;
  processing: ProcessingConfig;
  search: SearchConfig;
}

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username?: string;
  password?: string;
  ssl?: boolean;
  poolSize?: number;
}

export interface StorageConfig {
  type: "local" | "s3" | "gcs" | "azure";
  path?: string;
  bucket?: string;
  region?: string;
  credentials?: any;
}

export interface EmbeddingConfig {
  textModel: string;
  imageModel: string;
  audioModel?: string;
  dataModel?: string;
  dimensions: number;
  batchSize: number;
}

export interface ProcessingConfig {
  maxFileSize: number;
  supportedFormats: string[];
  thumbnailSize: [number, number];
  concurrency: number;
  timeout: number;
}

export interface SearchConfig {
  defaultTopK: number;
  similarityThreshold: number;
  enableHybrid: boolean;
  enableReranking: boolean;
  cacheSize: number;
}

// ============================================================================
// Service and API Types
// ============================================================================

export interface RepositoryService {
  // Dataset management
  createDataset(dataset: Omit<Dataset, "id" | "createdAt" | "updatedAt">): Promise<Dataset>;
  getDataset(id: string): Promise<Dataset>;
  updateDataset(id: string, updates: Partial<Dataset>): Promise<Dataset>;
  deleteDataset(id: string): Promise<void>;
  listDatasets(filters?: DatasetFilters): Promise<Dataset[]>;

  // File management
  ingestFiles(request: IngestionRequest): Promise<IngestionResult>;
  getFile(id: string): Promise<RepositoryFile>;
  updateFile(id: string, updates: Partial<RepositoryFile>): Promise<RepositoryFile>;
  deleteFile(id: string): Promise<void>;
  listFiles(datasetId: string, filters?: FileFilters): Promise<RepositoryFile[]>;

  // Search
  search(query: SearchQuery): Promise<SearchResult[]>;
  getSimilarFiles(fileId: string, options?: SearchOptions): Promise<SearchResult[]>;

  // Versioning
  createVersion(
    datasetId: string,
    version: Omit<DatasetVersion, "id" | "datasetId" | "createdAt">
  ): Promise<DatasetVersion>;
  getVersion(datasetId: string, version: string): Promise<DatasetVersion>;
  listVersions(datasetId: string): Promise<DatasetVersion[]>;
  getLineage(datasetId: string): Promise<DatasetLineage>;
}

export interface DatasetFilters {
  status?: DatasetStatus[];
  tags?: string[];
  createdBy?: string[];
  dateRange?: { from: Date; to: Date };
}

export interface FileFilters {
  fileTypes?: FileType[];
  modalities?: ModalityType[];
  tags?: string[];
  dateRange?: { from: Date; to: Date };
  sizeRange?: { min: number; max: number };
}

export interface ListOptions {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface UploadOptions {
  overwrite?: boolean;
  metadata?: Record<string, any>;
  tags?: string[];
}

// ============================================================================
// Error Types
// ============================================================================

export class RepositoryError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = "RepositoryError";
  }
}

export class DatasetNotFoundError extends RepositoryError {
  constructor(datasetId: string) {
    super(`Dataset not found: ${datasetId}`, "DATASET_NOT_FOUND", { datasetId });
  }
}

export class FileNotFoundError extends RepositoryError {
  constructor(fileId: string) {
    super(`File not found: ${fileId}`, "FILE_NOT_FOUND", { fileId });
  }
}

export class IngestionError extends RepositoryError {
  constructor(message: string, details?: any) {
    super(message, "INGESTION_ERROR", details);
  }
}

export class SearchError extends RepositoryError {
  constructor(message: string, details?: any) {
    super(message, "SEARCH_ERROR", details);
  }
}
