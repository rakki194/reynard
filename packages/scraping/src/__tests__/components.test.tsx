/**
 * Tests for scraping components
 */

import { fireEvent, render, screen, waitFor } from "@testing-library/solid";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ContentQualityDisplay, ProgressTracker, ScrapingJobManager } from "../components";
import type { ScrapingJob } from "../types";

// Mock the composables
vi.mock("../composables", () => ({
  useScrapingJobs: vi.fn(() => ({
    jobs: vi.fn(() => []),
    startScrapingJob: vi.fn(),
    cancelJob: vi.fn(),
    deleteJob: vi.fn(),
    refetch: vi.fn(),
  })),
  useScrapingProgress: vi.fn(() => ({
    progress: vi.fn(() => null),
    isConnected: vi.fn(() => true),
    error: vi.fn(() => null),
  })),
  useContentQuality: vi.fn(() => ({
    qualityScores: vi.fn(() => []),
    analyzeContentQuality: vi.fn(),
    refetch: vi.fn(),
  })),
}));

describe("ScrapingJobManager", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render job manager component", () => {
    render(() => <ScrapingJobManager />);

    expect(screen.getByText("Scraping Job Manager")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter URL to scrape")).toBeInTheDocument();
    expect(screen.getByText("Start New Job")).toBeInTheDocument();
  });

  it("should handle URL input", () => {
    render(() => <ScrapingJobManager />);

    const urlInput = screen.getByPlaceholderText("Enter URL to scrape");
    fireEvent.input(urlInput, { target: { value: "https://example.com" } });

    expect(urlInput.value).toBe("https://example.com");
  });

  it("should handle form submission", async () => {
    const mockStartJob = vi.fn().mockResolvedValue({});
    vi.mocked(require("../composables").useScrapingJobs).mockReturnValue({
      jobs: vi.fn(() => []),
      startScrapingJob: mockStartJob,
      cancelJob: vi.fn(),
      deleteJob: vi.fn(),
      refetch: vi.fn(),
    });

    render(() => <ScrapingJobManager />);

    const urlInput = screen.getByPlaceholderText("Enter URL to scrape");
    const submitButton = screen.getByText("Start New Job");

    fireEvent.input(urlInput, { target: { value: "https://example.com" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockStartJob).toHaveBeenCalledWith("https://example.com", "general");
    });
  });

  it("should display jobs list", () => {
    const mockJobs: ScrapingJob[] = [
      {
        id: "1",
        url: "https://example.com",
        status: "completed",
        progress: 100,
        type: "general",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "2",
        url: "https://test.com",
        status: "running",
        progress: 50,
        type: "general",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    vi.mocked(require("../composables").useScrapingJobs).mockReturnValue({
      jobs: vi.fn(() => mockJobs),
      startScrapingJob: vi.fn(),
      cancelJob: vi.fn(),
      deleteJob: vi.fn(),
      refetch: vi.fn(),
    });

    render(() => <ScrapingJobManager />);

    expect(screen.getByText("https://example.com")).toBeInTheDocument();
    expect(screen.getByText("https://test.com")).toBeInTheDocument();
    expect(screen.getByText("Status: completed - Progress: 100%")).toBeInTheDocument();
    expect(screen.getByText("Status: running - Progress: 50%")).toBeInTheDocument();
  });
});

describe("ProgressTracker", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render progress tracker", () => {
    const jobs: ScrapingJob[] = [];
    render(() => <ProgressTracker jobs={jobs} />);

    expect(screen.getByText("Scraping Progress Tracker")).toBeInTheDocument();
  });

  it("should display job progress", () => {
    const mockJobs: ScrapingJob[] = [
      {
        id: "1",
        url: "https://example.com",
        status: "running",
        progress: 75,
        type: "general",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    vi.mocked(require("../composables").useScrapingProgress).mockReturnValue({
      progress: vi.fn(() => ({ progress: 75, statusMessage: "Processing content" })),
      isConnected: vi.fn(() => true),
      error: vi.fn(() => null),
    });

    render(() => <ProgressTracker jobs={mockJobs} />);

    expect(screen.getByText("https://example.com")).toBeInTheDocument();
    expect(screen.getByText("75%")).toBeInTheDocument();
    expect(screen.getByText("Status: Processing content")).toBeInTheDocument();
  });

  it("should show connection status", () => {
    const mockJobs: ScrapingJob[] = [
      {
        id: "1",
        url: "https://example.com",
        status: "running",
        progress: 50,
        type: "general",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    vi.mocked(require("../composables").useScrapingProgress).mockReturnValue({
      progress: vi.fn(() => null),
      isConnected: vi.fn(() => false),
      error: vi.fn(() => null),
    });

    render(() => <ProgressTracker jobs={mockJobs} />);

    expect(screen.getByText("WebSocket Disconnected. Retrying...")).toBeInTheDocument();
  });
});

describe("ContentQualityDisplay", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render quality display", () => {
    render(() => <ContentQualityDisplay jobId="job-1" />);

    expect(screen.getByText("Content Quality for Job: job-1")).toBeInTheDocument();
  });

  it("should display quality scores", () => {
    const mockQualityScores = [
      {
        id: "1",
        url: "https://example.com",
        score: 0.85,
        factors: {
          length: 0.9,
          readability: 0.8,
          relevance: 0.85,
        },
        timestamp: new Date().toISOString(),
      },
    ];

    vi.mocked(require("../composables").useContentQuality).mockReturnValue({
      qualityScores: vi.fn(() => mockQualityScores),
      analyzeContentQuality: vi.fn(),
      refetch: vi.fn(),
    });

    render(() => <ContentQualityDisplay jobId="job-1" />);

    expect(screen.getByText("https://example.com")).toBeInTheDocument();
    expect(screen.getByText("Overall Score: 0.85")).toBeInTheDocument();
    expect(screen.getByText("- length: 0.90")).toBeInTheDocument();
    expect(screen.getByText("- readability: 0.80")).toBeInTheDocument();
    expect(screen.getByText("- relevance: 0.85")).toBeInTheDocument();
  });

  it("should handle quality analysis", async () => {
    const mockAnalyze = vi.fn().mockResolvedValue({});
    vi.mocked(require("../composables").useContentQuality).mockReturnValue({
      qualityScores: vi.fn(() => []),
      analyzeContentQuality: mockAnalyze,
      refetch: vi.fn(),
    });

    render(() => <ContentQualityDisplay jobId="job-1" contentId="content-1" />);

    const analyzeButton = screen.getByText("Analyze Content Quality");
    fireEvent.click(analyzeButton);

    await waitFor(() => {
      expect(mockAnalyze).toHaveBeenCalledWith("job-1", "content-1");
    });
  });
});
