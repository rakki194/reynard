/**
 * Email Composable for Reynard Email System
 * 
 * Provides comprehensive email management functionality including
 * sending, receiving, templates, and agent integration.
 */

import { createSignal, createResource, createEffect } from "solid-js";
import { createReynardApiClient } from "reynard-api-client";
import type { 
  EmailSendRequest, 
  EmailSendResponse, 
  EmailBulkRequest, 
  EmailBulkResponse,
  EmailStatusModel 
} from "reynard-api-client";

export interface EmailMessage {
  id?: string;
  to_emails: string[];
  subject: string;
  body: string;
  html_body?: string;
  cc_emails?: string[];
  bcc_emails?: string[];
  attachments?: EmailAttachment[];
  reply_to?: string;
  sent_at?: string;
  message_id?: string;
  status?: "draft" | "sent" | "failed" | "pending";
  from_agent?: string;
  to_agent?: string;
}

export interface EmailAttachment {
  file_path: string;
  filename?: string;
  content_type?: string;
  size?: number;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  html_body?: string;
  variables: string[];
  category: "agent" | "admin" | "notification" | "system";
  created_at: string;
  updated_at: string;
}

export interface EmailStatus {
  service_configured: boolean;
  smtp_server: string;
  from_email: string;
  test_connection: boolean;
  last_test_time?: string;
}

export interface UseEmailOptions {
  endpoint?: string;
  authHeaders?: Record<string, string>;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export interface UseEmailReturn {
  // State
  messages: () => EmailMessage[];
  templates: () => EmailTemplate[];
  status: () => EmailStatus | null;
  isLoading: () => boolean;
  error: () => string | null;
  
  // Actions
  sendEmail: (message: EmailMessage) => Promise<boolean>;
  sendBulkEmail: (messages: EmailMessage[]) => Promise<boolean>;
  saveTemplate: (template: Omit<EmailTemplate, "id" | "created_at" | "updated_at">) => Promise<boolean>;
  deleteTemplate: (templateId: string) => Promise<boolean>;
  testConnection: () => Promise<boolean>;
  refreshStatus: () => void;
  refreshTemplates: () => void;
  refreshMessages: () => void;
}

export function useEmail(options: UseEmailOptions = {}): UseEmailReturn {
  const {
    endpoint = "/api/email",
    authHeaders = {},
    autoRefresh = true,
    refreshInterval = 30000, // 30 seconds
  } = options;

  // Create API client
  const apiClient = createReynardApiClient({
    basePath: endpoint.replace("/api/email", ""),
    authFetch: fetch,
  });

  // State signals
  const [messages, setMessages] = createSignal<EmailMessage[]>([]);
  const [templates, setTemplates] = createSignal<EmailTemplate[]>([]);
  const [isLoading, setIsLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  // Email status resource
  const [status, { refetch: refreshStatus }] = createResource(
    () => endpoint,
    async (url) => {
      try {
        const response = await apiClient.email.getStatus();
        return response as EmailStatus;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch email status");
        return null;
      }
    }
  );

  // Templates resource
  const [templatesResource, { refetch: refreshTemplates }] = createResource(
    () => endpoint,
    async (url) => {
      try {
        const response = await fetch(`${url}/templates`, {
          headers: {
            "Content-Type": "application/json",
            ...authHeaders,
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        setTemplates(data.templates || []);
        return data.templates || [];
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch templates");
        return [];
      }
    }
  );

  // Messages resource
  const [messagesResource, { refetch: refreshMessages }] = createResource(
    () => endpoint,
    async (url) => {
      try {
        const response = await fetch(`${url}/messages`, {
          headers: {
            "Content-Type": "application/json",
            ...authHeaders,
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        setMessages(data.messages || []);
        return data.messages || [];
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch messages");
        return [];
      }
    }
  );

  // Auto-refresh effect
  createEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(() => {
        refreshStatus();
        refreshTemplates();
        refreshMessages();
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  });

  // Send email action
  const sendEmail = async (message: EmailMessage): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const emailRequest: EmailSendRequest = {
        to_emails: message.to_emails,
        subject: message.subject,
        body: message.body,
        html_body: message.html_body,
        cc_emails: message.cc_emails,
        bcc_emails: message.bcc_emails,
        attachments: message.attachments,
        reply_to: message.reply_to,
      };

      const result = await apiClient.email.send(emailRequest);
      
      if (result.success) {
        // Add to local messages
        setMessages(prev => [...prev, {
          ...message,
          id: result.message_id,
          sent_at: result.sent_at,
          status: "sent",
        }]);
        
        return true;
      } else {
        setError(result.error || "Failed to send email");
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send email");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Send bulk email action
  const sendBulkEmail = async (messages: EmailMessage[]): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const bulkRequest: EmailBulkRequest = {
        to_emails: messages.flatMap(m => m.to_emails),
        subject: messages[0]?.subject || "Bulk Email",
        body: messages[0]?.body || "",
        html_body: messages[0]?.html_body,
        batch_size: 10,
        delay_between_batches: 1.0,
      };

      const result = await apiClient.email.sendBulk(bulkRequest);
      
      if (result.successful_sends > 0) {
        // Refresh messages to get updated list
        refreshMessages();
        return true;
      } else {
        setError("No emails were sent successfully");
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send bulk emails");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Save template action
  const saveTemplate = async (template: Omit<EmailTemplate, "id" | "created_at" | "updated_at">): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${endpoint}/templates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify(template),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      // Refresh templates
      refreshTemplates();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save template");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete template action
  const deleteTemplate = async (templateId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${endpoint}/templates/${templateId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      // Refresh templates
      refreshTemplates();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete template");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Test connection action
  const testConnection = async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${endpoint}/test`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        // Refresh status
        refreshStatus();
        return true;
      } else {
        setError(result.message || "Connection test failed");
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection test failed");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    // State
    messages,
    templates,
    status,
    isLoading,
    error,
    
    // Actions
    sendEmail,
    sendBulkEmail,
    saveTemplate,
    deleteTemplate,
    testConnection,
    refreshStatus,
    refreshTemplates,
    refreshMessages,
  };
}

