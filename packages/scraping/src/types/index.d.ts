/**
 * Reynard Scraping Types
 * Comprehensive type definitions for the scraping system
 */
export interface ScrapingJob {
    id: string;
    url: string;
    type: ScrapingType;
    status: ScrapingStatus;
    progress: number;
    createdAt: Date;
    updatedAt: Date;
    completedAt?: Date;
    error?: string;
    metadata?: Record<string, any>;
    results?: ScrapingResult[];
}
export interface ScrapingResult {
    id: string;
    jobId: string;
    url: string;
    title?: string;
    content: string;
    metadata: Record<string, any>;
    extractedAt: Date;
    quality: ContentQuality;
    category?: ContentCategory;
}
export interface ContentQuality {
    score: number;
    factors: QualityFactor[];
    overall: QualityLevel;
}
export interface QualityFactor {
    name: string;
    score: number;
    weight: number;
    description: string;
}
export interface ContentCategory {
    type: CategoryType;
    confidence: number;
    tags: string[];
    subcategories?: string[];
}
export declare enum ScrapingType {
    GENERAL = "general",
    HACKER_NEWS = "hackernews",
    GITHUB = "github",
    STACKOVERFLOW = "stackoverflow",
    TWITTER = "twitter",
    WIKIPEDIA = "wikipedia",
    WIKIFUR = "wikifur",
    E621_WIKI = "e621_wiki",
    ARS_TECHNICA = "arstechnica",
    TECHCRUNCH = "techcrunch",
    WIRED = "wired",
    GALLERY_DL = "gallery_dl"
}
export declare enum ScrapingStatus {
    PENDING = "pending",
    RUNNING = "running",
    COMPLETED = "completed",
    FAILED = "failed",
    CANCELLED = "cancelled"
}
export declare enum QualityLevel {
    EXCELLENT = "excellent",
    GOOD = "good",
    FAIR = "fair",
    POOR = "poor"
}
export declare enum CategoryType {
    NEWS = "news",
    TECHNICAL = "technical",
    SOCIAL = "social",
    WIKI = "wiki",
    GALLERY = "gallery",
    FORUM = "forum",
    BLOG = "blog",
    DOCUMENTATION = "documentation",
    OTHER = "other"
}
export interface ScraperConfig {
    name: string;
    type: ScrapingType;
    enabled: boolean;
    rateLimit: RateLimitConfig;
    extraction: ExtractionConfig;
    quality: QualityConfig;
    metadata: Record<string, any>;
}
export interface RateLimitConfig {
    requestsPerMinute: number;
    requestsPerHour: number;
    delayBetweenRequests: number;
    respectRobotsTxt: boolean;
}
export interface ExtractionConfig {
    extractImages: boolean;
    extractLinks: boolean;
    extractMetadata: boolean;
    cleanContent: boolean;
    removeAds: boolean;
    preserveFormatting: boolean;
}
export interface QualityConfig {
    minScore: number;
    enableFiltering: boolean;
    qualityFactors: QualityFactor[];
}
export interface ProcessingPipeline {
    id: string;
    name: string;
    stages: ProcessingStage[];
    config: PipelineConfig;
    status: PipelineStatus;
}
export interface ProcessingStage {
    id: string;
    name: string;
    type: StageType;
    order: number;
    config: Record<string, any>;
    status: StageStatus;
    results?: any;
}
export interface PipelineConfig {
    parallel: boolean;
    maxConcurrency: number;
    timeout: number;
    retryAttempts: number;
    qualityThreshold: number;
}
export declare enum StageType {
    EXTRACTION = "extraction",
    CLEANING = "cleaning",
    QUALITY_ASSESSMENT = "quality_assessment",
    CATEGORIZATION = "categorization",
    DEDUPLICATION = "deduplication",
    ENRICHMENT = "enrichment",
    EXPORT = "export"
}
export declare enum StageStatus {
    PENDING = "pending",
    RUNNING = "running",
    COMPLETED = "completed",
    FAILED = "failed",
    SKIPPED = "skipped"
}
export declare enum PipelineStatus {
    IDLE = "idle",
    RUNNING = "running",
    COMPLETED = "completed",
    FAILED = "failed",
    PAUSED = "paused"
}
export interface GalleryDownloadJob {
    id: string;
    url: string;
    status: DownloadStatus;
    progress: DownloadProgress;
    config: GalleryConfig;
    results?: GalleryResult[];
    error?: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface DownloadProgress {
    percentage: number;
    currentFile?: string;
    totalFiles: number;
    downloadedFiles: number;
    totalBytes: number;
    downloadedBytes: number;
    speed: number;
    estimatedTime?: number;
}
export interface GalleryConfig {
    outputDirectory: string;
    filename: string;
    extractorOptions: Record<string, any>;
    postprocessors: string[];
    quality: string;
    format: string;
}
export interface GalleryResult {
    id: string;
    url: string;
    filename: string;
    size: number;
    downloadedAt: Date;
    metadata: Record<string, any>;
}
export declare enum DownloadStatus {
    PENDING = "pending",
    DOWNLOADING = "downloading",
    COMPLETED = "completed",
    FAILED = "failed",
    CANCELLED = "cancelled"
}
export interface ScrapingApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
    timestamp: Date;
}
export interface ScrapingApiRequest {
    url: string;
    type?: ScrapingType;
    config?: Partial<ScraperConfig>;
    options?: ScrapingOptions;
}
export interface ScrapingOptions {
    timeout?: number;
    retries?: number;
    qualityThreshold?: number;
    extractImages?: boolean;
    extractLinks?: boolean;
    cleanContent?: boolean;
}
export interface ScrapingEvent {
    type: ScrapingEventType;
    jobId: string;
    data: any;
    timestamp: Date;
}
export declare enum ScrapingEventType {
    JOB_CREATED = "job_created",
    JOB_STARTED = "job_started",
    JOB_PROGRESS = "job_progress",
    JOB_COMPLETED = "job_completed",
    JOB_FAILED = "job_failed",
    JOB_CANCELLED = "job_cancelled",
    RESULT_EXTRACTED = "result_extracted",
    QUALITY_ASSESSED = "quality_assessed",
    CONTENT_CATEGORIZED = "content_categorized"
}
export interface ScrapingStatistics {
    totalJobs: number;
    completedJobs: number;
    failedJobs: number;
    activeJobs: number;
    totalResults: number;
    averageQuality: number;
    topCategories: CategoryStats[];
    performanceMetrics: PerformanceMetrics;
}
export interface CategoryStats {
    category: CategoryType;
    count: number;
    averageQuality: number;
    percentage: number;
}
export interface PerformanceMetrics {
    averageProcessingTime: number;
    averageQualityScore: number;
    successRate: number;
    throughput: number;
}
