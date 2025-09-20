import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@solidjs/testing-library";
import { useEmail } from "reynard-email/composables";

// Mock fetch
global.fetch = vi.fn();

describe("useEmail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with default state", () => {
    const { result } = renderHook(() => useEmail());
    
    expect(result.messages()).toEqual([]);
    expect(result.templates()).toEqual([]);
    expect(result.isLoading()).toBe(false);
    expect(result.error()).toBe(null);
  });

  it("should handle email sending", async () => {
    const mockResponse = {
      success: true,
      message_id: "test-message-id",
      sent_at: "2025-01-15T10:00:00Z",
      recipients: ["test@example.com"]
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    });

    const { result } = renderHook(() => useEmail());
    
    const testMessage = {
      to_emails: ["test@example.com"],
      subject: "Test Subject",
      body: "Test Body"
    };

    const success = await result.sendEmail(testMessage);
    
    expect(success).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/email/send",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json"
        }),
        body: JSON.stringify(testMessage)
      })
    );
  });

  it("should handle email sending errors", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      json: () => Promise.resolve({
        detail: "Email sending failed"
      })
    });

    const { result } = renderHook(() => useEmail());
    
    const testMessage = {
      to_emails: ["test@example.com"],
      subject: "Test Subject",
      body: "Test Body"
    };

    const success = await result.sendEmail(testMessage);
    
    expect(success).toBe(false);
    expect(result.error()).toBe("Email sending failed");
  });

  it("should handle connection testing", async () => {
    const mockResponse = {
      success: true,
      message: "Test email sent successfully",
      recipient: "test@example.com"
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    });

    const { result } = renderHook(() => useEmail());
    
    const success = await result.testConnection();
    
    expect(success).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/email/test",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json"
        })
      })
    );
  });
});

