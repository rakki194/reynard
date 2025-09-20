/**
 * IMAP Email Composable for Reynard Email Package
 *
 * This composable provides functionality for receiving and managing emails via IMAP.
 */

import { createSignal, createResource, onCleanup } from "solid-js";
import { createReynardApiClient } from "reynard-api-client";

// Types
export interface ImapEmail {
  message_id: string;
  subject: string;
  sender: string;
  recipient: string;
  date: string;
  body: string;
  html_body?: string;
  attachments?: Array<{
    filename: string;
    content_type: string;
    size: number;
  }>;
  from_agent?: string;
  to_agent?: string;
  is_agent_email: boolean;
  status: "received" | "processed" | "replied";
}

export interface ImapStatus {
  status: "connected" | "disconnected";
  mailbox_info: {
    total_messages?: number;
    unread_messages?: number;
  };
  config: {
    imap_server: string;
    imap_port: number;
    mailbox: string;
    use_ssl: boolean;
  };
}

export interface EmailSummary {
  total_emails: number;
  agent_emails: number;
  unread_emails: number;
  replied_emails: number;
  agent_breakdown: Record<string, number>;
  last_updated: string;
}

export interface ImapComposable {
  // Status and connection
  status: () => ImapStatus | undefined;
  isConnected: () => boolean;
  refreshStatus: () => void;

  // Email retrieval
  unreadEmails: () => ImapEmail[] | undefined;
  recentEmails: () => ImapEmail[] | undefined;
  agentEmails: () => ImapEmail[] | undefined;
  emailSummary: () => EmailSummary | undefined;

  // Email management
  markAsRead: (messageId: string) => Promise<boolean>;
  markAsProcessed: (messageId: string) => Promise<boolean>;

  // Monitoring
  startMonitoring: (interval?: number) => Promise<boolean>;
  stopMonitoring: () => void;

  // Testing
  testConnection: () => Promise<boolean>;

  // Loading states
  loading: () => boolean;
  error: () => string | null;
}

export function useImap(): ImapComposable {
  // Create API client
  const apiClient = createReynardApiClient({
    basePath: "http://localhost:8000",
    authFetch: fetch,
  });

  // Signals
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [monitoringInterval, setMonitoringInterval] = createSignal<number | null>(null);

  // Resources
  const [status, { refetch: refreshStatus }] = createResource(
    () => "imap-status",
    async () => {
      try {
        const response = await apiClient.imap.getStatus({ requestBody: {} });
        return response as ImapStatus;
      } catch (err) {
        setError(`Failed to get IMAP status: ${err}`);
        throw err;
      }
    }
  );

  const [unreadEmails, { refetch: refreshUnread }] = createResource(
    () => "imap-unread",
    async () => {
      try {
        const response = await apiClient.imap.getUnreadEmails({
          requestBody: {},
          limit: 50,
        });
        return response as ImapEmail[];
      } catch (err) {
        setError(`Failed to get unread emails: ${err}`);
        throw err;
      }
    }
  );

  const [recentEmails, { refetch: refreshRecent }] = createResource(
    () => "imap-recent",
    async () => {
      try {
        const response = await apiClient.imap.getRecentEmails({
          requestBody: {},
          days: 7,
          limit: 50,
        });
        return response as ImapEmail[];
      } catch (err) {
        setError(`Failed to get recent emails: ${err}`);
        throw err;
      }
    }
  );

  const [emailSummary, { refetch: refreshSummary }] = createResource(
    () => "imap-summary",
    async () => {
      try {
        const response = await apiClient.imap.getEmailsSummary({
          requestBody: {},
        });
        return response as EmailSummary;
      } catch (err) {
        setError(`Failed to get email summary: ${err}`);
        throw err;
      }
    }
  );

  // Agent emails resource (will be set when agentId is provided)
  const [agentEmails, { refetch: refreshAgentEmails }] = createResource(
    () => null, // Will be set dynamically
    async (agentId: string) => {
      if (!agentId) return [];
      try {
        const response = await apiClient.imap.getAgentEmails({
          agentId,
          requestBody: {},
          limit: 50,
        });
        return response as ImapEmail[];
      } catch (err) {
        setError(`Failed to get agent emails: ${err}`);
        throw err;
      }
    }
  );

  // Computed
  const isConnected = () => status()?.status === "connected";

  // Email management functions
  const markAsRead = async (messageId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.imap.markAsRead({ messageId });

      if (response.success) {
        // Refresh unread emails
        refreshUnread();
        refreshSummary();
        return true;
      }

      return false;
    } catch (err) {
      setError(`Failed to mark email as read: ${err}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const markAsProcessed = async (messageId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.imap.markAsProcessed({ messageId });

      if (response.success) {
        // Refresh all email lists
        refreshUnread();
        refreshRecent();
        refreshSummary();
        return true;
      }

      return false;
    } catch (err) {
      setError(`Failed to mark email as processed: ${err}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Monitoring functions
  const startMonitoring = async (interval: number = 60): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.imap.startMonitoring({
        requestBody: { interval },
      });

      if (response.success) {
        setMonitoringInterval(interval);

        // Set up periodic refresh
        const refreshInterval = setInterval(() => {
          refreshUnread();
          refreshRecent();
          refreshSummary();
        }, interval * 1000);

        // Store interval for cleanup
        setMonitoringInterval(refreshInterval as any);

        return true;
      }

      return false;
    } catch (err) {
      setError(`Failed to start email monitoring: ${err}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const stopMonitoring = () => {
    const interval = monitoringInterval();
    if (interval && typeof interval === "number") {
      clearInterval(interval);
      setMonitoringInterval(null);
    }
  };

  // Test connection
  const testConnection = async (): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.imap.testConnection({
        requestBody: {},
      });

      if (response.success) {
        // Refresh status after successful test
        refreshStatus();
        return true;
      } else {
        setError(response.message || "Connection test failed");
        return false;
      }
    } catch (err) {
      setError(`Connection test failed: ${err}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Load agent emails for a specific agent
  const loadAgentEmails = (agentId: string) => {
    refreshAgentEmails(agentId);
  };

  // Cleanup on unmount
  onCleanup(() => {
    stopMonitoring();
  });

  return {
    // Status and connection
    status,
    isConnected,
    refreshStatus,

    // Email retrieval
    unreadEmails,
    recentEmails,
    agentEmails,
    emailSummary,

    // Email management
    markAsRead,
    markAsProcessed,

    // Monitoring
    startMonitoring,
    stopMonitoring,

    // Testing
    testConnection,

    // Loading states
    loading,
    error,

    // Additional utilities
    loadAgentEmails,
  };
}
