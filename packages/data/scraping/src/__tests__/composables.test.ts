/**
 * Tests for scraping composables
 */

import { renderHook, waitFor } from "@testing-library/solid";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useScrapingConfig, useScrapingJobs, useScrapingProgress } from "../composables";

// Mock the connection client
vi.mock("reynard-connection", () => ({
  createConnection: vi.fn(() => ({
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
    websocket: vi.fn(),
  })),
}));

describe("useScrapingJobs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with empty jobs array", () => {
    const { result } = renderHook(() => useScrapingJobs());

    expect(result.jobs()).toEqual([]);
    expect(result.isLoading()).toBe(false);
    expect(result.error()).toBe(null);
  });

  it("should fetch jobs on mount", async () => {
    const mockJobs = [
      { id: "1", url: "https://example.com", status: "completed", progress: 100 },
      { id: "2", url: "https://test.com", status: "running", progress: 50 },
    ];

    const mockGet = vi.fn().mockResolvedValue({ data: mockJobs });
    vi.mocked(require("reynard-connection").createConnection).mockReturnValue({
      get: mockGet,
    });

    const { result } = renderHook(() => useScrapingJobs());

    await waitFor(() => {
      expect(result.jobs()).toEqual(mockJobs);
    });

    expect(mockGet).toHaveBeenCalledWith("/api/scraping/jobs");
  });

  it("should handle fetch errors", async () => {
    const mockGet = vi.fn().mockRejectedValue(new Error("Network error"));
    vi.mocked(require("reynard-connection").createConnection).mockReturnValue({
      get: mockGet,
    });

    const { result } = renderHook(() => useScrapingJobs());

    await waitFor(() => {
      expect(result.error()).toBe("Network error");
    });
  });

  it("should start a new scraping job", async () => {
    const mockJob = { id: "1", url: "https://example.com", status: "pending", progress: 0 };
    const mockPost = vi.fn().mockResolvedValue({ data: mockJob });
    vi.mocked(require("reynard-connection").createConnection).mockReturnValue({
      post: mockPost,
    });

    const { result } = renderHook(() => useScrapingJobs());

    await result.startScrapingJob("https://example.com", "general");

    expect(mockPost).toHaveBeenCalledWith("/api/scraping/jobs", {
      url: "https://example.com",
      type: "general",
    });
  });

  it("should cancel a job", async () => {
    const mockDelete = vi.fn().mockResolvedValue({});
    vi.mocked(require("reynard-connection").createConnection).mockReturnValue({
      delete: mockDelete,
    });

    const { result } = renderHook(() => useScrapingJobs());

    await result.cancelJob("job-1");

    expect(mockDelete).toHaveBeenCalledWith("/api/scraping/jobs/job-1/cancel");
  });
});

describe("useScrapingProgress", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with default values", () => {
    const { result } = renderHook(() => useScrapingProgress("job-1"));

    expect(result.progress()).toBe(null);
    expect(result.isConnected()).toBe(false);
    expect(result.error()).toBe(null);
  });

  it("should connect to WebSocket", () => {
    const mockWebsocket = vi.fn();
    vi.mocked(require("reynard-connection").createConnection).mockReturnValue({
      websocket: mockWebsocket,
    });

    renderHook(() => useScrapingProgress("job-1"));

    expect(mockWebsocket).toHaveBeenCalledWith("/ws/scraping/progress/job-1");
  });

  it("should handle WebSocket messages", () => {
    const mockWebsocket = vi.fn();
    const mockOnMessage = vi.fn();
    mockWebsocket.mockImplementation((url, callbacks) => {
      callbacks.onMessage = mockOnMessage;
    });

    vi.mocked(require("reynard-connection").createConnection).mockReturnValue({
      websocket: mockWebsocket,
    });

    const { result } = renderHook(() => useScrapingProgress("job-1"));

    const progressData = { progress: 75, statusMessage: "Processing content" };
    mockOnMessage(JSON.stringify(progressData));

    expect(result.progress()).toEqual(progressData);
  });
});

describe("useScrapingConfig", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with default config", () => {
    const { result } = renderHook(() => useScrapingConfig());

    expect(result.config()).toBe(null);
    expect(result.isLoading()).toBe(false);
    expect(result.error()).toBe(null);
  });

  it("should fetch configuration", async () => {
    const mockConfig = {
      maxDepth: 3,
      concurrency: 5,
      userAgent: "Reynard Scraper",
    };

    const mockGet = vi.fn().mockResolvedValue({ data: mockConfig });
    vi.mocked(require("reynard-connection").createConnection).mockReturnValue({
      get: mockGet,
    });

    const { result } = renderHook(() => useScrapingConfig());

    await waitFor(() => {
      expect(result.config()).toEqual(mockConfig);
    });

    expect(mockGet).toHaveBeenCalledWith("/api/scraping/config");
  });

  it("should update configuration", async () => {
    const mockPut = vi.fn().mockResolvedValue({});
    vi.mocked(require("reynard-connection").createConnection).mockReturnValue({
      put: mockPut,
    });

    const { result } = renderHook(() => useScrapingConfig());

    const newConfig = { maxDepth: 5, concurrency: 10 };
    await result.updateConfig(newConfig);

    expect(mockPut).toHaveBeenCalledWith("/api/scraping/config", newConfig);
  });
});
