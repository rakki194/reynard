/**
 * Reynard Scraping Types
 * Comprehensive type definitions for the scraping system
 */
// Enums
export var ScrapingType;
(function (ScrapingType) {
    ScrapingType["GENERAL"] = "general";
    ScrapingType["HACKER_NEWS"] = "hackernews";
    ScrapingType["GITHUB"] = "github";
    ScrapingType["STACKOVERFLOW"] = "stackoverflow";
    ScrapingType["TWITTER"] = "twitter";
    ScrapingType["WIKIPEDIA"] = "wikipedia";
    ScrapingType["WIKIFUR"] = "wikifur";
    ScrapingType["E621_WIKI"] = "e621_wiki";
    ScrapingType["ARS_TECHNICA"] = "arstechnica";
    ScrapingType["TECHCRUNCH"] = "techcrunch";
    ScrapingType["WIRED"] = "wired";
    ScrapingType["GALLERY_DL"] = "gallery_dl";
})(ScrapingType || (ScrapingType = {}));
export var ScrapingStatus;
(function (ScrapingStatus) {
    ScrapingStatus["PENDING"] = "pending";
    ScrapingStatus["RUNNING"] = "running";
    ScrapingStatus["COMPLETED"] = "completed";
    ScrapingStatus["FAILED"] = "failed";
    ScrapingStatus["CANCELLED"] = "cancelled";
})(ScrapingStatus || (ScrapingStatus = {}));
export var QualityLevel;
(function (QualityLevel) {
    QualityLevel["EXCELLENT"] = "excellent";
    QualityLevel["GOOD"] = "good";
    QualityLevel["FAIR"] = "fair";
    QualityLevel["POOR"] = "poor";
})(QualityLevel || (QualityLevel = {}));
export var CategoryType;
(function (CategoryType) {
    CategoryType["NEWS"] = "news";
    CategoryType["TECHNICAL"] = "technical";
    CategoryType["SOCIAL"] = "social";
    CategoryType["WIKI"] = "wiki";
    CategoryType["GALLERY"] = "gallery";
    CategoryType["FORUM"] = "forum";
    CategoryType["BLOG"] = "blog";
    CategoryType["DOCUMENTATION"] = "documentation";
    CategoryType["OTHER"] = "other";
})(CategoryType || (CategoryType = {}));
export var StageType;
(function (StageType) {
    StageType["EXTRACTION"] = "extraction";
    StageType["CLEANING"] = "cleaning";
    StageType["QUALITY_ASSESSMENT"] = "quality_assessment";
    StageType["CATEGORIZATION"] = "categorization";
    StageType["DEDUPLICATION"] = "deduplication";
    StageType["ENRICHMENT"] = "enrichment";
    StageType["EXPORT"] = "export";
})(StageType || (StageType = {}));
export var StageStatus;
(function (StageStatus) {
    StageStatus["PENDING"] = "pending";
    StageStatus["RUNNING"] = "running";
    StageStatus["COMPLETED"] = "completed";
    StageStatus["FAILED"] = "failed";
    StageStatus["SKIPPED"] = "skipped";
})(StageStatus || (StageStatus = {}));
export var PipelineStatus;
(function (PipelineStatus) {
    PipelineStatus["IDLE"] = "idle";
    PipelineStatus["RUNNING"] = "running";
    PipelineStatus["COMPLETED"] = "completed";
    PipelineStatus["FAILED"] = "failed";
    PipelineStatus["PAUSED"] = "paused";
})(PipelineStatus || (PipelineStatus = {}));
export var DownloadStatus;
(function (DownloadStatus) {
    DownloadStatus["PENDING"] = "pending";
    DownloadStatus["DOWNLOADING"] = "downloading";
    DownloadStatus["COMPLETED"] = "completed";
    DownloadStatus["FAILED"] = "failed";
    DownloadStatus["CANCELLED"] = "cancelled";
})(DownloadStatus || (DownloadStatus = {}));
export var ScrapingEventType;
(function (ScrapingEventType) {
    ScrapingEventType["JOB_CREATED"] = "job_created";
    ScrapingEventType["JOB_STARTED"] = "job_started";
    ScrapingEventType["JOB_PROGRESS"] = "job_progress";
    ScrapingEventType["JOB_COMPLETED"] = "job_completed";
    ScrapingEventType["JOB_FAILED"] = "job_failed";
    ScrapingEventType["JOB_CANCELLED"] = "job_cancelled";
    ScrapingEventType["RESULT_EXTRACTED"] = "result_extracted";
    ScrapingEventType["QUALITY_ASSESSED"] = "quality_assessed";
    ScrapingEventType["CONTENT_CATEGORIZED"] = "content_categorized";
})(ScrapingEventType || (ScrapingEventType = {}));
