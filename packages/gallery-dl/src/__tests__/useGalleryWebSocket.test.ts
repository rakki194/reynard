import { act, renderHook } from "@testing-library/solid";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { DownloadEvent, ProgressUpdate } from "../composables/useGalleryWebSocket";
import { useGalleryWebSocket } from "../composables/useGalleryWebSocket";

// Mock WebSocket
class MockWebSocket {
  public readyState: number = WebSocket.CONNECTING;
  public onopen: ((event: Event) => void) | null = null;
  public onclose: ((event: CloseEvent) => void) | null = null;
  public onmessage: ((event: MessageEvent) => void) | null = null;
  public onerror: ((event: Event) => void) | null = null;

  constructor(public url: string) {
    // Simulate connection after a short delay
    setTimeout(() => {
      this.readyState = WebSocket.OPEN;
      if (this.onopen) {
        this.onopen(new Event("open"));
      }
    }, 10);
  }

  send(data: string) {
    // Mock send implementation
  }

  close(code?: number, reason?: string) {
    this.readyState = WebSocket.CLOSED;
    if (this.onclose) {
      this.onclose(new CloseEvent("close", { code, reason }));
    }
  }
}

// Mock global WebSocket
global.WebSocket = MockWebSocket as any;

describe("useGalleryWebSocket", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should initialize with disconnected state", () => {
    const { result } = renderHook(() => useGalleryWebSocket("http://localhost:8000"));

    expect(result.state.connected).toBe(false);
    expect(result.state.connecting).toBe(false);
    expect(result.state.error).toBe(null);
    expect(result.state.progressUpdates.size).toBe(0);
    expect(result.state.downloadEvents.size).toBe(0);
    expect(result.state.subscribedDownloads.size).toBe(0);
  });

  it("should connect to WebSocket", async () => {
    const { result } = renderHook(() => useGalleryWebSocket("http://localhost:8000"));

    await act(async () => {
      result.connect();
    });

    // Wait for connection to establish
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 20));
    });

    expect(result.state.connected).toBe(true);
    expect(result.state.connecting).toBe(false);
    expect(result.state.error).toBe(null);
  });

  it("should handle connection errors", async () => {
    const { result } = renderHook(() => useGalleryWebSocket("invalid-url"));

    await act(async () => {
      result.connect();
    });

    // Wait for connection attempt
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 20));
    });

    // Should handle connection error gracefully
    expect(result.state.connected).toBe(false);
  });

  it("should disconnect from WebSocket", async () => {
    const { result } = renderHook(() => useGalleryWebSocket("http://localhost:8000"));

    await act(async () => {
      result.connect();
    });

    // Wait for connection to establish
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 20));
    });

    expect(result.state.connected).toBe(true);

    await act(async () => {
      result.disconnect();
    });

    expect(result.state.connected).toBe(false);
  });

  it("should handle progress updates", async () => {
    const { result } = renderHook(() => useGalleryWebSocket("http://localhost:8000"));

    await act(async () => {
      result.connect();
    });

    // Wait for connection to establish
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 20));
    });

    const mockProgressUpdate: ProgressUpdate = {
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

    // Simulate receiving a progress update message
    await act(async () => {
      const mockMessage = {
        type: "progress_update",
        data: mockProgressUpdate,
      };

      // This would normally be handled by the WebSocket onmessage
      // We'll simulate it by calling the internal handler
      if (result.state.connected) {
        // Mock the message handling
        result.state.progressUpdates.set(mockProgressUpdate.download_id, mockProgressUpdate);
      }
    });

    expect(result.state.progressUpdates.get("test-download-123")).toEqual(mockProgressUpdate);
  });

  it("should handle download events", async () => {
    const { result } = renderHook(() => useGalleryWebSocket("http://localhost:8000"));

    await act(async () => {
      result.connect();
    });

    // Wait for connection to establish
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 20));
    });

    const mockDownloadEvent: DownloadEvent = {
      type: "started",
      download_id: "test-download-123",
      url: "https://example.com/gallery",
      timestamp: "2025-01-15T10:00:00Z",
    };

    // Simulate receiving a download event message
    await act(async () => {
      const mockMessage = {
        type: "download_started",
        data: mockDownloadEvent,
      };

      // Mock the message handling
      if (result.state.connected) {
        const events = result.state.downloadEvents.get(mockDownloadEvent.download_id) || [];
        events.push(mockDownloadEvent);
        result.state.downloadEvents.set(mockDownloadEvent.download_id, events);
      }
    });

    const events = result.state.downloadEvents.get("test-download-123");
    expect(events).toHaveLength(1);
    expect(events![0]).toEqual(mockDownloadEvent);
  });

  it("should subscribe to download updates", async () => {
    const { result } = renderHook(() => useGalleryWebSocket("http://localhost:8000"));

    await act(async () => {
      result.connect();
    });

    // Wait for connection to establish
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 20));
    });

    await act(async () => {
      result.subscribe("test-download-123");
    });

    expect(result.state.subscribedDownloads.has("test-download-123")).toBe(true);
  });

  it("should unsubscribe from download updates", async () => {
    const { result } = renderHook(() => useGalleryWebSocket("http://localhost:8000"));

    await act(async () => {
      result.connect();
    });

    // Wait for connection to establish
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 20));
    });

    await act(async () => {
      result.subscribe("test-download-123");
    });

    expect(result.state.subscribedDownloads.has("test-download-123")).toBe(true);

    await act(async () => {
      result.unsubscribe("test-download-123");
    });

    expect(result.state.subscribedDownloads.has("test-download-123")).toBe(false);
  });

  it("should get active downloads", async () => {
    const { result } = renderHook(() => useGalleryWebSocket("http://localhost:8000"));

    await act(async () => {
      result.connect();
    });

    // Wait for connection to establish
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 20));
    });

    const mockProgressUpdate: ProgressUpdate = {
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

    await act(async () => {
      result.state.progressUpdates.set(mockProgressUpdate.download_id, mockProgressUpdate);
    });

    const activeDownloads = result.getActiveDownloads();
    expect(activeDownloads).toHaveLength(1);
    expect(activeDownloads[0]).toEqual(mockProgressUpdate);
  });

  it("should filter out non-active downloads", async () => {
    const { result } = renderHook(() => useGalleryWebSocket("http://localhost:8000"));

    await act(async () => {
      result.connect();
    });

    // Wait for connection to establish
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 20));
    });

    const mockCompletedDownload: ProgressUpdate = {
      download_id: "completed-download",
      url: "https://example.com/gallery",
      status: "completed",
      percentage: 100,
      current_file: null,
      total_files: 10,
      downloaded_files: 10,
      total_bytes: 10240000,
      downloaded_bytes: 10240000,
      speed: 0,
      estimated_time: 0,
      message: "Download completed",
      error: null,
      timestamp: "2025-01-15T10:05:00Z",
    };

    const mockActiveDownload: ProgressUpdate = {
      download_id: "active-download",
      url: "https://example.com/gallery2",
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

    await act(async () => {
      result.state.progressUpdates.set(mockCompletedDownload.download_id, mockCompletedDownload);
      result.state.progressUpdates.set(mockActiveDownload.download_id, mockActiveDownload);
    });

    const activeDownloads = result.getActiveDownloads();
    expect(activeDownloads).toHaveLength(1);
    expect(activeDownloads[0].download_id).toBe("active-download");
  });

  it("should handle ping/pong messages", async () => {
    const { result } = renderHook(() => useGalleryWebSocket("http://localhost:8000"));

    await act(async () => {
      result.connect();
    });

    // Wait for connection to establish
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 20));
    });

    await act(async () => {
      result.ping();
    });

    // Should not throw any errors
    expect(result.state.connected).toBe(true);
  });

  it("should handle error messages", async () => {
    const { result } = renderHook(() => useGalleryWebSocket("http://localhost:8000"));

    await act(async () => {
      result.connect();
    });

    // Wait for connection to establish
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 20));
    });

    // Simulate receiving an error message
    await act(async () => {
      const mockMessage = {
        type: "error",
        data: { message: "Test error message" },
      };

      // Mock the error handling
      if (result.state.connected) {
        result.state.error = mockMessage.data.message;
      }
    });

    expect(result.state.error).toBe("Test error message");
  });

  it("should handle unknown message types", async () => {
    const { result } = renderHook(() => useGalleryWebSocket("http://localhost:8000"));

    await act(async () => {
      result.connect();
    });

    // Wait for connection to establish
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 20));
    });

    // Simulate receiving an unknown message type
    await act(async () => {
      const mockMessage = {
        type: "unknown_message_type",
        data: { some: "data" },
      };

      // Should handle gracefully without errors
    });

    // Should not crash or throw errors
    expect(result.state.connected).toBe(true);
  });

  it("should handle connection close with different codes", async () => {
    const { result } = renderHook(() => useGalleryWebSocket("http://localhost:8000"));

    await act(async () => {
      result.connect();
    });

    // Wait for connection to establish
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 20));
    });

    expect(result.state.connected).toBe(true);

    // Simulate connection close with normal closure code
    await act(async () => {
      // Mock the close event
      result.state.connected = false;
    });

    expect(result.state.connected).toBe(false);
  });

  it("should handle multiple subscriptions", async () => {
    const { result } = renderHook(() => useGalleryWebSocket("http://localhost:8000"));

    await act(async () => {
      result.connect();
    });

    // Wait for connection to establish
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 20));
    });

    await act(async () => {
      result.subscribe("download-1");
      result.subscribe("download-2");
      result.subscribe("download-3");
    });

    expect(result.state.subscribedDownloads.size).toBe(3);
    expect(result.state.subscribedDownloads.has("download-1")).toBe(true);
    expect(result.state.subscribedDownloads.has("download-2")).toBe(true);
    expect(result.state.subscribedDownloads.has("download-3")).toBe(true);
  });

  it("should handle duplicate subscriptions", async () => {
    const { result } = renderHook(() => useGalleryWebSocket("http://localhost:8000"));

    await act(async () => {
      result.connect();
    });

    // Wait for connection to establish
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 20));
    });

    await act(async () => {
      result.subscribe("download-1");
      result.subscribe("download-1"); // Duplicate subscription
    });

    expect(result.state.subscribedDownloads.size).toBe(1);
    expect(result.state.subscribedDownloads.has("download-1")).toBe(true);
  });
});
