import { render, screen } from "@testing-library/solid";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProgressTracker } from "../components/ProgressTracker";
import type { ProgressUpdate } from "../types";

describe("ProgressTracker", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render progress tracker with pending status", () => {
    const mockDownload: ProgressUpdate = {
      download_id: "test-download-123",
      url: "https://example.com/gallery",
      status: "pending",
      percentage: 0,
      current_file: null,
      total_files: 5,
      downloaded_files: 0,
      total_bytes: 10240000,
      downloaded_bytes: 0,
      speed: 0,
      estimated_time: null,
      message: "Waiting to start...",
      error: null,
      timestamp: "2025-01-15T10:00:00Z",
    };

    render(() => <ProgressTracker download={mockDownload} />);

    expect(screen.getByText("https://example.com/gallery")).toBeInTheDocument();
    expect(screen.getByText("Waiting to start...")).toBeInTheDocument();
    expect(screen.getByText("0%")).toBeInTheDocument();
    expect(screen.getByText("0 / 5 files")).toBeInTheDocument();
  });

  it("should render progress tracker with downloading status", () => {
    const mockDownload: ProgressUpdate = {
      download_id: "test-download-123",
      url: "https://example.com/gallery",
      status: "downloading",
      percentage: 45,
      current_file: "image3.jpg",
      total_files: 10,
      downloaded_files: 4,
      total_bytes: 10240000,
      downloaded_bytes: 4608000,
      speed: 1024000,
      estimated_time: 5,
      message: "Downloading image3.jpg...",
      error: null,
      timestamp: "2025-01-15T10:02:30Z",
    };

    render(() => <ProgressTracker download={mockDownload} />);

    expect(screen.getByText("https://example.com/gallery")).toBeInTheDocument();
    expect(screen.getByText("Downloading image3.jpg...")).toBeInTheDocument();
    expect(screen.getByText("45%")).toBeInTheDocument();
    expect(screen.getByText("4 / 10 files")).toBeInTheDocument();
    expect(screen.getByText("4.6 MB / 10.2 MB")).toBeInTheDocument();
    expect(screen.getByText("1.0 MB/s")).toBeInTheDocument();
    expect(screen.getByText("5s remaining")).toBeInTheDocument();
  });

  it("should render progress tracker with completed status", () => {
    const mockDownload: ProgressUpdate = {
      download_id: "test-download-123",
      url: "https://example.com/gallery",
      status: "completed",
      percentage: 100,
      current_file: null,
      total_files: 5,
      downloaded_files: 5,
      total_bytes: 10240000,
      downloaded_bytes: 10240000,
      speed: 0,
      estimated_time: 0,
      message: "Download completed successfully",
      error: null,
      timestamp: "2025-01-15T10:05:00Z",
    };

    render(() => <ProgressTracker download={mockDownload} />);

    expect(screen.getByText("https://example.com/gallery")).toBeInTheDocument();
    expect(screen.getByText("Download completed successfully")).toBeInTheDocument();
    expect(screen.getByText("100%")).toBeInTheDocument();
    expect(screen.getByText("5 / 5 files")).toBeInTheDocument();
    expect(screen.getByText("10.2 MB / 10.2 MB")).toBeInTheDocument();
  });

  it("should render progress tracker with error status", () => {
    const mockDownload: ProgressUpdate = {
      download_id: "test-download-123",
      url: "https://example.com/gallery",
      status: "error",
      percentage: 25,
      current_file: "image2.jpg",
      total_files: 5,
      downloaded_files: 1,
      total_bytes: 10240000,
      downloaded_bytes: 2560000,
      speed: 0,
      estimated_time: null,
      message: "Download failed",
      error: "Network connection lost",
      timestamp: "2025-01-15T10:01:15Z",
    };

    render(() => <ProgressTracker download={mockDownload} />);

    expect(screen.getByText("https://example.com/gallery")).toBeInTheDocument();
    expect(screen.getByText("Download failed")).toBeInTheDocument();
    expect(screen.getByText("Network connection lost")).toBeInTheDocument();
    expect(screen.getByText("25%")).toBeInTheDocument();
    expect(screen.getByText("1 / 5 files")).toBeInTheDocument();
  });

  it("should render progress tracker with cancelled status", () => {
    const mockDownload: ProgressUpdate = {
      download_id: "test-download-123",
      url: "https://example.com/gallery",
      status: "cancelled",
      percentage: 30,
      current_file: "image2.jpg",
      total_files: 5,
      downloaded_files: 1,
      total_bytes: 10240000,
      downloaded_bytes: 3072000,
      speed: 0,
      estimated_time: null,
      message: "Download cancelled by user",
      error: null,
      timestamp: "2025-01-15T10:01:30Z",
    };

    render(() => <ProgressTracker download={mockDownload} />);

    expect(screen.getByText("https://example.com/gallery")).toBeInTheDocument();
    expect(screen.getByText("Download cancelled by user")).toBeInTheDocument();
    expect(screen.getByText("30%")).toBeInTheDocument();
    expect(screen.getByText("1 / 5 files")).toBeInTheDocument();
  });

  it("should format file sizes correctly", () => {
    const mockDownload: ProgressUpdate = {
      download_id: "test-download-123",
      url: "https://example.com/gallery",
      status: "downloading",
      percentage: 50,
      current_file: "image5.jpg",
      total_files: 10,
      downloaded_files: 5,
      total_bytes: 1073741824, // 1 GB
      downloaded_bytes: 536870912, // 512 MB
      speed: 1048576, // 1 MB/s
      estimated_time: 512,
      message: "Downloading image5.jpg...",
      error: null,
      timestamp: "2025-01-15T10:02:30Z",
    };

    render(() => <ProgressTracker download={mockDownload} />);

    expect(screen.getByText("512.0 MB / 1.0 GB")).toBeInTheDocument();
    expect(screen.getByText("1.0 MB/s")).toBeInTheDocument();
    expect(screen.getByText("8m 32s remaining")).toBeInTheDocument();
  });

  it("should handle zero file sizes", () => {
    const mockDownload: ProgressUpdate = {
      download_id: "test-download-123",
      url: "https://example.com/gallery",
      status: "pending",
      percentage: 0,
      current_file: null,
      total_files: 0,
      downloaded_files: 0,
      total_bytes: 0,
      downloaded_bytes: 0,
      speed: 0,
      estimated_time: null,
      message: "Waiting to start...",
      error: null,
      timestamp: "2025-01-15T10:00:00Z",
    };

    render(() => <ProgressTracker download={mockDownload} />);

    expect(screen.getByText("0 / 0 files")).toBeInTheDocument();
    expect(screen.getByText("0 B / 0 B")).toBeInTheDocument();
  });

  it("should handle missing estimated time", () => {
    const mockDownload: ProgressUpdate = {
      download_id: "test-download-123",
      url: "https://example.com/gallery",
      status: "downloading",
      percentage: 50,
      current_file: "image5.jpg",
      total_files: 10,
      downloaded_files: 5,
      total_bytes: 10240000,
      downloaded_bytes: 5120000,
      speed: 0,
      estimated_time: null,
      message: "Downloading image5.jpg...",
      error: null,
      timestamp: "2025-01-15T10:02:30Z",
    };

    render(() => <ProgressTracker download={mockDownload} />);

    expect(screen.getByText("https://example.com/gallery")).toBeInTheDocument();
    expect(screen.getByText("Downloading image5.jpg...")).toBeInTheDocument();
    expect(screen.getByText("50%")).toBeInTheDocument();
    // Should not show estimated time when it's null
    expect(screen.queryByText(/remaining/)).not.toBeInTheDocument();
  });

  it("should handle missing current file", () => {
    const mockDownload: ProgressUpdate = {
      download_id: "test-download-123",
      url: "https://example.com/gallery",
      status: "downloading",
      percentage: 50,
      current_file: null,
      total_files: 10,
      downloaded_files: 5,
      total_bytes: 10240000,
      downloaded_bytes: 5120000,
      speed: 1024000,
      estimated_time: 5,
      message: "Processing files...",
      error: null,
      timestamp: "2025-01-15T10:02:30Z",
    };

    render(() => <ProgressTracker download={mockDownload} />);

    expect(screen.getByText("https://example.com/gallery")).toBeInTheDocument();
    expect(screen.getByText("Processing files...")).toBeInTheDocument();
    expect(screen.getByText("50%")).toBeInTheDocument();
    expect(screen.getByText("5 / 10 files")).toBeInTheDocument();
  });

  it("should display status with appropriate styling", () => {
    const mockDownload: ProgressUpdate = {
      download_id: "test-download-123",
      url: "https://example.com/gallery",
      status: "downloading",
      percentage: 50,
      current_file: "image5.jpg",
      total_files: 10,
      downloaded_files: 5,
      total_bytes: 10240000,
      downloaded_bytes: 5120000,
      speed: 1024000,
      estimated_time: 5,
      message: "Downloading image5.jpg...",
      error: null,
      timestamp: "2025-01-15T10:02:30Z",
    };

    render(() => <ProgressTracker download={mockDownload} />);

    // Check if the component renders without errors
    expect(screen.getByText("https://example.com/gallery")).toBeInTheDocument();
    expect(screen.getByText("Downloading image5.jpg...")).toBeInTheDocument();
  });
});
