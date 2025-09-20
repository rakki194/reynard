/**
 * Email service composable for Reynard API client
 */

import { createSignal, createEffect } from "solid-js";
import type { ReynardApiClient } from "../client";

export interface EmailSendRequest {
  to_emails: string[];
  subject: string;
  body: string;
  html_body?: string;
  cc_emails?: string[];
  bcc_emails?: string[];
  attachments?: Array<{
    file_path: string;
    filename: string;
  }>;
  reply_to?: string;
}

export interface EmailBulkRequest {
  to_emails: string[];
  subject: string;
  body: string;
  html_body?: string;
  batch_size?: number;
  delay_between_batches?: number;
}

export interface EmailSendResponse {
  success: boolean;
  message_id?: string;
  sent_at?: string;
  recipients: string[];
  error?: string;
}

export interface EmailBulkResponse {
  total_recipients: number;
  successful_sends: number;
  failed_sends: number;
  batch_count: number;
  processing_time: number;
  results: EmailSendResponse[];
}

export interface EmailStatusModel {
  service_configured: boolean;
  smtp_server: string;
  from_email: string;
  test_connection: boolean;
  last_test_time?: string;
}

export function useEmail(client: ReynardApiClient) {
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  const sendEmail = async (request: EmailSendRequest): Promise<EmailSendResponse> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${client.config.basePath}/api/email/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(client.config.fetchApi ? {} : {}), // Add auth headers if needed
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const sendSimpleEmail = async (
    to_email: string,
    subject: string,
    body: string,
    html_body?: string
  ): Promise<EmailSendResponse> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${client.config.basePath}/api/email/send-simple`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to_email,
          subject,
          body,
          html_body,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const sendBulkEmail = async (request: EmailBulkRequest): Promise<EmailBulkResponse> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${client.config.basePath}/api/email/send-bulk`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getEmailStatus = async (): Promise<EmailStatusModel> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${client.config.basePath}/api/email/status`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const testEmailConnection = async (): Promise<{ success: boolean; message: string; recipient: string }> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${client.config.basePath}/api/email/test`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    sendEmail,
    sendSimpleEmail,
    sendBulkEmail,
    getEmailStatus,
    testEmailConnection,
  };
}
