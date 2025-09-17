/**
 * Unified Repository API
 *
 * REST API layer for the unified repository system.
 * Provides comprehensive endpoints for dataset management, file operations, and search.
 */
export interface APIConfig {
    port: number;
    host: string;
    cors: {
        origin: string[];
        credentials: boolean;
    };
    rateLimit: {
        windowMs: number;
        max: number;
    };
    authentication: {
        enabled: boolean;
        secret: string;
        expiresIn: string;
    };
    validation: {
        enabled: boolean;
        strict: boolean;
    };
}
export interface APIResponse<T = any> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: any;
    };
    metadata?: {
        timestamp: string;
        requestId: string;
        version: string;
    };
}
export interface PaginationOptions {
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}
export interface PaginatedResponse<T> extends APIResponse<T[]> {
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}
export declare class UnifiedRepositoryAPI extends BaseAIService {
    private repository;
    private initialized;
    private server;
    constructor();
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
    healthCheck(): Promise<any>;
    /**
     * Initialize Express server with middleware and routes
     */
    private initializeServer;
    /**
     * Setup API routes
     */
    private setupRoutes;
    /**
     * Create API router with all endpoints
     */
    private createAPIRouter;
    private healthCheckHandler;
    private listDatasetsHandler;
    private createDatasetHandler;
    private getDatasetHandler;
    private updateDatasetHandler;
    private deleteDatasetHandler;
    private getDatasetStatisticsHandler;
    private getDatasetFilesHandler;
    private addFilesToDatasetHandler;
    private removeFilesFromDatasetHandler;
    private searchHandler;
    private vectorSearchHandler;
    private hybridSearchHandler;
    private multimodalSearchHandler;
    private getSearchSuggestionsHandler;
    private listFilesHandler;
    private getFileHandler;
    private updateFileHandler;
    private deleteFileHandler;
    private ingestFilesHandler;
    private listVersionsHandler;
    private createVersionHandler;
    private getVersionHandler;
    private rollbackVersionHandler;
    private generateEmbeddingHandler;
    private generateBatchEmbeddingsHandler;
    private getEmbeddingHandler;
    private deleteEmbeddingHandler;
    private extractMetadataHandler;
    private getMetadataHandler;
    private processParquetHandler;
    private queryParquetHandler;
    private validateParquetHandler;
    private requestLogger;
    private errorHandler;
    private notFoundHandler;
    private createSuccessResponse;
    private createErrorResponse;
    private parseQueryFilters;
    private generateRequestId;
    private ensureInitialized;
}
