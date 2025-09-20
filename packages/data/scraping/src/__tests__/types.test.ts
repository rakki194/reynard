/**
 * Tests for scraping types and interfaces
 */

import { describe, expect, it } from "vitest";
import type {
  ContentQualityScore,
  ExtractedContent,
  ScrapingConfig,
  ScrapingJob,
  ScrapingPipelineResult,
  ScrapingPipelineStage,
  ScrapingProgress,
  ScrapingStatistics,
} from "../types";

describe("ScrapingJob", () => {
  it("should have required properties", () => {
    const job: ScrapingJob = {
      id: "job-1",
      url: "https://example.com",
      status: "pending",
      progress: 0,
      type: "general",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(job.id).toBe("job-1");
    expect(job.url).toBe("https://example.com");
    expect(job.status).toBe("pending");
    expect(job.progress).toBe(0);
    expect(job.type).toBe("general");
    expect(job.createdAt).toBeDefined();
    expect(job.updatedAt).toBeDefined();
  });

  it("should allow optional properties", () => {
    const job: ScrapingJob = {
      id: "job-1",
      url: "https://example.com",
      status: "completed",
      progress: 100,
      type: "general",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      error: "Test error",
      result: {
        content: "Test content",
        metadata: { title: "Test Title" },
        quality: { score: 0.8, factors: {} },
      },
    };

    expect(job.error).toBe("Test error");
    expect(job.result).toBeDefined();
    expect(job.result?.content).toBe("Test content");
  });
});

describe("ScrapingConfig", () => {
  it("should have default configuration values", () => {
    const config: ScrapingConfig = {
      maxDepth: 3,
      concurrency: 5,
      userAgent: "Reynard Scraper",
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000,
      respectRobotsTxt: true,
      followRedirects: true,
      extractImages: true,
      extractLinks: true,
      extractMetadata: true,
      qualityThreshold: 0.7,
      enableCaching: true,
      cacheExpiry: 3600,
    };

    expect(config.maxDepth).toBe(3);
    expect(config.concurrency).toBe(5);
    expect(config.userAgent).toBe("Reynard Scraper");
    expect(config.timeout).toBe(30000);
    expect(config.retryAttempts).toBe(3);
    expect(config.retryDelay).toBe(1000);
    expect(config.respectRobotsTxt).toBe(true);
    expect(config.followRedirects).toBe(true);
    expect(config.extractImages).toBe(true);
    expect(config.extractLinks).toBe(true);
    expect(config.extractMetadata).toBe(true);
    expect(config.qualityThreshold).toBe(0.7);
    expect(config.enableCaching).toBe(true);
    expect(config.cacheExpiry).toBe(3600);
  });
});

describe("ScrapingProgress", () => {
  it("should track progress information", () => {
    const progress: ScrapingProgress = {
      jobId: "job-1",
      progress: 75,
      statusMessage: "Processing content",
      currentStage: "extraction",
      estimatedTimeRemaining: 120,
      itemsProcessed: 150,
      totalItems: 200,
    };

    expect(progress.jobId).toBe("job-1");
    expect(progress.progress).toBe(75);
    expect(progress.statusMessage).toBe("Processing content");
    expect(progress.currentStage).toBe("extraction");
    expect(progress.estimatedTimeRemaining).toBe(120);
    expect(progress.itemsProcessed).toBe(150);
    expect(progress.totalItems).toBe(200);
  });
});

describe("ExtractedContent", () => {
  it("should contain extracted content data", () => {
    const content: ExtractedContent = {
      id: "content-1",
      url: "https://example.com",
      title: "Example Title",
      content: "Example content text",
      metadata: {
        author: "John Doe",
        publishedDate: "2024-01-01",
        tags: ["example", "test"],
      },
      images: [
        { url: "https://example.com/image1.jpg", alt: "Image 1" },
        { url: "https://example.com/image2.jpg", alt: "Image 2" },
      ],
      links: [
        { url: "https://example.com/link1", text: "Link 1" },
        { url: "https://example.com/link2", text: "Link 2" },
      ],
      extractedAt: new Date().toISOString(),
    };

    expect(content.id).toBe("content-1");
    expect(content.url).toBe("https://example.com");
    expect(content.title).toBe("Example Title");
    expect(content.content).toBe("Example content text");
    expect(content.metadata).toBeDefined();
    expect(content.metadata.author).toBe("John Doe");
    expect(content.images).toHaveLength(2);
    expect(content.links).toHaveLength(2);
    expect(content.extractedAt).toBeDefined();
  });
});

describe("ContentQualityScore", () => {
  it("should contain quality assessment data", () => {
    const quality: ContentQualityScore = {
      id: "quality-1",
      url: "https://example.com",
      score: 0.85,
      factors: {
        length: 0.9,
        readability: 0.8,
        relevance: 0.85,
        completeness: 0.9,
        accuracy: 0.8,
      },
      timestamp: new Date().toISOString(),
    };

    expect(quality.id).toBe("quality-1");
    expect(quality.url).toBe("https://example.com");
    expect(quality.score).toBe(0.85);
    expect(quality.factors).toBeDefined();
    expect(quality.factors.length).toBe(0.9);
    expect(quality.factors.readability).toBe(0.8);
    expect(quality.factors.relevance).toBe(0.85);
    expect(quality.factors.completeness).toBe(0.9);
    expect(quality.factors.accuracy).toBe(0.8);
    expect(quality.timestamp).toBeDefined();
  });
});

describe("ScrapingStatistics", () => {
  it("should contain performance metrics", () => {
    const stats: ScrapingStatistics = {
      totalJobs: 100,
      completedJobs: 85,
      failedJobs: 10,
      runningJobs: 5,
      averageDurationMs: 5000,
      dataExtractedBytes: 1024000,
      mostActiveScraper: "general",
      performanceMetrics: {
        successRate: 0.85,
        averageQuality: 0.78,
        throughputPerHour: 20,
        errorRate: 0.1,
      },
      lastUpdated: new Date().toISOString(),
    };

    expect(stats.totalJobs).toBe(100);
    expect(stats.completedJobs).toBe(85);
    expect(stats.failedJobs).toBe(10);
    expect(stats.runningJobs).toBe(5);
    expect(stats.averageDurationMs).toBe(5000);
    expect(stats.dataExtractedBytes).toBe(1024000);
    expect(stats.mostActiveScraper).toBe("general");
    expect(stats.performanceMetrics).toBeDefined();
    expect(stats.performanceMetrics.successRate).toBe(0.85);
    expect(stats.performanceMetrics.averageQuality).toBe(0.78);
    expect(stats.performanceMetrics.throughputPerHour).toBe(20);
    expect(stats.performanceMetrics.errorRate).toBe(0.1);
    expect(stats.lastUpdated).toBeDefined();
  });
});

describe("ScrapingPipelineStage", () => {
  it("should define pipeline stage structure", () => {
    const stage: ScrapingPipelineStage = {
      id: "stage-1",
      name: "content_extraction",
      status: "completed",
      progress: 100,
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      duration: 1500,
      input: { url: "https://example.com" },
      output: { content: "Extracted content" },
      error: null,
    };

    expect(stage.id).toBe("stage-1");
    expect(stage.name).toBe("content_extraction");
    expect(stage.status).toBe("completed");
    expect(stage.progress).toBe(100);
    expect(stage.startTime).toBeDefined();
    expect(stage.endTime).toBeDefined();
    expect(stage.duration).toBe(1500);
    expect(stage.input).toBeDefined();
    expect(stage.output).toBeDefined();
    expect(stage.error).toBe(null);
  });
});

describe("ScrapingPipelineResult", () => {
  it("should contain complete pipeline results", () => {
    const result: ScrapingPipelineResult = {
      jobId: "job-1",
      status: "completed",
      totalDuration: 5000,
      stages: [
        {
          id: "stage-1",
          name: "content_extraction",
          status: "completed",
          progress: 100,
          startTime: new Date().toISOString(),
          endTime: new Date().toISOString(),
          duration: 1500,
          input: { url: "https://example.com" },
          output: { content: "Extracted content" },
          error: null,
        },
      ],
      finalOutput: {
        content: "Final processed content",
        metadata: { title: "Processed Title" },
        quality: { score: 0.9, factors: {} },
      },
      error: null,
      completedAt: new Date().toISOString(),
    };

    expect(result.jobId).toBe("job-1");
    expect(result.status).toBe("completed");
    expect(result.totalDuration).toBe(5000);
    expect(result.stages).toHaveLength(1);
    expect(result.finalOutput).toBeDefined();
    expect(result.finalOutput.content).toBe("Final processed content");
    expect(result.error).toBe(null);
    expect(result.completedAt).toBeDefined();
  });
});
