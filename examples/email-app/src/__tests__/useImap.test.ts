/**
 * Tests for useImap Composable
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/solid";
import { useImap } from "reynard-email";

// Mock the API client
vi.mock("reynard-api-client", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

import { apiClient } from "reynard-api-client";

describe("useImap", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it("should initialize with default state", () => {
    const { result } = renderHook(() => useImap());

    expect(result.loading()).toBe(false);
    expect(result.error()).toBe(null);
    expect(result.isConnected()).toBe(false);
  });

  it("should fetch IMAP status successfully", async () => {
    const mockStatus = {
      status: "connected",
      mailbox_info: {
        total_messages: 10,
        unread_messages: 3,
      },
      config: {
        imap_server: "imap.gmail.com",
        imap_port: 993,
        mailbox: "INBOX",
        use_ssl: true,
      },
    };

    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: mockStatus,
    });

    const { result } = renderHook(() => useImap());

    await waitFor(() => {
      expect(result.status()).toEqual(mockStatus);
    });

    expect(result.isConnected()).toBe(true);
    expect(apiClient.get).toHaveBeenCalledWith("/api/imap/status");
  });

  it("should fetch unread emails successfully", async () => {
    const mockEmails = [
      {
        message_id: "test-123",
        subject: "Test Email",
        sender: "sender@example.com",
        recipient: "recipient@example.com",
        date: "2024-01-01T00:00:00Z",
        body: "Test body",
        html_body: "<p>Test body</p>",
        attachments: [],
        from_agent: "agent-123",
        to_agent: "agent-456",
        is_agent_email: true,
        status: "received",
      },
    ];

    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: mockEmails,
    });

    const { result } = renderHook(() => useImap());

    await waitFor(() => {
      expect(result.unreadEmails()).toEqual(mockEmails);
    });

    expect(apiClient.get).toHaveBeenCalledWith("/api/imap/emails/unread?limit=50");
  });

  it("should fetch recent emails successfully", async () => {
    const mockEmails = [
      {
        message_id: "test-456",
        subject: "Recent Email",
        sender: "recent@example.com",
        recipient: "recipient@example.com",
        date: "2024-01-01T00:00:00Z",
        body: "Recent body",
        html_body: "<p>Recent body</p>",
        attachments: [],
        from_agent: null,
        to_agent: null,
        is_agent_email: false,
        status: "received",
      },
    ];

    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: mockEmails,
    });

    const { result } = renderHook(() => useImap());

    await waitFor(() => {
      expect(result.recentEmails()).toEqual(mockEmails);
    });

    expect(apiClient.get).toHaveBeenCalledWith("/api/imap/emails/recent?days=7&limit=50");
  });

  it("should fetch email summary successfully", async () => {
    const mockSummary = {
      total_emails: 10,
      agent_emails: 5,
      unread_emails: 3,
      replied_emails: 2,
      agent_breakdown: {
        "agent-123": 3,
        "agent-456": 2,
      },
      last_updated: "2024-01-01T00:00:00Z",
    };

    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: mockSummary,
    });

    const { result } = renderHook(() => useImap());

    await waitFor(() => {
      expect(result.emailSummary()).toEqual(mockSummary);
    });

    expect(apiClient.get).toHaveBeenCalledWith("/api/imap/emails/summary");
  });

  it("should mark email as read successfully", async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: { success: true },
    });

    const { result } = renderHook(() => useImap());

    const success = await result.markAsRead("test-message-123");

    expect(success).toBe(true);
    expect(apiClient.post).toHaveBeenCalledWith("/api/imap/emails/test-message-123/mark-read");
  });

  it("should mark email as processed successfully", async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: { success: true },
    });

    const { result } = renderHook(() => useImap());

    const success = await result.markAsProcessed("test-message-123");

    expect(success).toBe(true);
    expect(apiClient.post).toHaveBeenCalledWith("/api/imap/emails/test-message-123/mark-processed");
  });

  it("should start email monitoring successfully", async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: { success: true },
    });

    const { result } = renderHook(() => useImap());

    const success = await result.startMonitoring(60);

    expect(success).toBe(true);
    expect(apiClient.post).toHaveBeenCalledWith("/api/imap/monitoring/start", {
      interval: 60,
    });
  });

  it("should test connection successfully", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: {
        success: true,
        message: "Connection test successful",
        details: {
          connection_status: "connected",
        },
      },
    });

    const { result } = renderHook(() => useImap());

    const success = await result.testConnection();

    expect(success).toBe(true);
    expect(apiClient.get).toHaveBeenCalledWith("/api/imap/test");
  });

  it("should handle API errors gracefully", async () => {
    const errorMessage = "Connection failed";
    vi.mocked(apiClient.get).mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(() => useImap());

    await waitFor(() => {
      expect(result.error()).toContain(errorMessage);
    });
  });

  it("should handle mark as read failure", async () => {
    vi.mocked(apiClient.post).mockRejectedValueOnce(new Error("Failed to mark as read"));

    const { result } = renderHook(() => useImap());

    const success = await result.markAsRead("test-message-123");

    expect(success).toBe(false);
    expect(result.error()).toContain("Failed to mark email as read");
  });

  it("should handle mark as processed failure", async () => {
    vi.mocked(apiClient.post).mockRejectedValueOnce(new Error("Failed to mark as processed"));

    const { result } = renderHook(() => useImap());

    const success = await result.markAsProcessed("test-message-123");

    expect(success).toBe(false);
    expect(result.error()).toContain("Failed to mark email as processed");
  });

  it("should handle monitoring start failure", async () => {
    vi.mocked(apiClient.post).mockRejectedValueOnce(new Error("Failed to start monitoring"));

    const { result } = renderHook(() => useImap());

    const success = await result.startMonitoring(60);

    expect(success).toBe(false);
    expect(result.error()).toContain("Failed to start email monitoring");
  });

  it("should handle connection test failure", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: {
        success: false,
        message: "Connection test failed",
      },
    });

    const { result } = renderHook(() => useImap());

    const success = await result.testConnection();

    expect(success).toBe(false);
    expect(result.error()).toContain("Connection test failed");
  });

  it("should load agent emails for specific agent", async () => {
    const mockAgentEmails = [
      {
        message_id: "agent-email-123",
        subject: "Agent Email",
        sender: "agent@example.com",
        recipient: "recipient@example.com",
        date: "2024-01-01T00:00:00Z",
        body: "Agent email body",
        html_body: "<p>Agent email body</p>",
        attachments: [],
        from_agent: "agent-123",
        to_agent: "agent-456",
        is_agent_email: true,
        status: "received",
      },
    ];

    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: mockAgentEmails,
    });

    const { result } = renderHook(() => useImap());

    result.loadAgentEmails("agent-123");

    await waitFor(() => {
      expect(result.agentEmails()).toEqual(mockAgentEmails);
    });

    expect(apiClient.get).toHaveBeenCalledWith("/api/imap/emails/agent/agent-123?limit=50");
  });

  it("should stop monitoring when component unmounts", () => {
    const { result, unmount } = renderHook(() => useImap());

    // Start monitoring
    result.startMonitoring(60);

    // Unmount component
    unmount();

    // Should stop monitoring (this is tested by checking that no errors occur)
    expect(() => result.stopMonitoring()).not.toThrow();
  });
});
