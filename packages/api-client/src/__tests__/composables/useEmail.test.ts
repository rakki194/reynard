/**
 * Tests for the useEmail composable
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useEmail } from '../../composables/useEmail';
import type { ReynardApiClient } from '../../client';

// Mock the client
const mockClient = {
  config: {
    basePath: 'http://localhost:8000',
  },
} as ReynardApiClient;

describe('useEmail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('sendEmail', () => {
    it('should send an email successfully', async () => {
      const mockResponse = {
        success: true,
        message_id: 'test-message-id',
        sent_at: '2025-01-15T10:00:00Z',
        recipients: ['test@example.com'],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const emailService = useEmail(mockClient);
      const result = await emailService.sendEmail({
        to_emails: ['test@example.com'],
        subject: 'Test Subject',
        body: 'Test Body',
      });

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/email/send',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to_emails: ['test@example.com'],
            subject: 'Test Subject',
            body: 'Test Body',
          }),
        })
      );
    });

    it('should handle email send errors', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const emailService = useEmail(mockClient);
      
      await expect(emailService.sendEmail({
        to_emails: ['test@example.com'],
        subject: 'Test Subject',
        body: 'Test Body',
      })).rejects.toThrow('HTTP error! status: 500');
    });

    it('should set loading state during email send', async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      (global.fetch as any).mockReturnValueOnce(promise);

      const emailService = useEmail(mockClient);
      
      // Start the email send
      const emailPromise = emailService.sendEmail({
        to_emails: ['test@example.com'],
        subject: 'Test Subject',
        body: 'Test Body',
      });

      // Check loading state
      expect(emailService.loading()).toBe(true);

      // Resolve the promise
      resolvePromise!({
        ok: true,
        json: () => Promise.resolve({ success: true, recipients: ['test@example.com'] }),
      });

      await emailPromise;
      expect(emailService.loading()).toBe(false);
    });
  });

  describe('sendSimpleEmail', () => {
    it('should send a simple email', async () => {
      const mockResponse = {
        success: true,
        recipients: ['test@example.com'],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const emailService = useEmail(mockClient);
      const result = await emailService.sendSimpleEmail(
        'test@example.com',
        'Test Subject',
        'Test Body'
      );

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/email/send-simple',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            to_email: 'test@example.com',
            subject: 'Test Subject',
            body: 'Test Body',
            html_body: undefined,
          }),
        })
      );
    });
  });

  describe('getEmailStatus', () => {
    it('should get email service status', async () => {
      const mockResponse = {
        service_configured: true,
        smtp_server: 'smtp.example.com',
        from_email: 'noreply@example.com',
        test_connection: true,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const emailService = useEmail(mockClient);
      const result = await emailService.getEmailStatus();

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/email/status'
      );
    });
  });

  describe('testEmailConnection', () => {
    it('should test email connection', async () => {
      const mockResponse = {
        success: true,
        message: 'Test email sent successfully',
        recipient: 'test@example.com',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const emailService = useEmail(mockClient);
      const result = await emailService.testEmailConnection();

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/email/test',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
  });
});
