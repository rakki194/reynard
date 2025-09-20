/**
 * Agent Email Composable for Reynard Email System
 * 
 * Provides agent-specific email functionality including
 * agent-to-agent communication and automated email generation.
 */

import { createSignal, createResource, createEffect } from "solid-js";
import { useEmail, type EmailMessage } from "./useEmail";

export interface AgentEmailConfig {
  agent_id: string;
  agent_name: string;
  agent_email: string;
  auto_reply_enabled: boolean;
  auto_reply_template?: string;
  notification_preferences: {
    new_messages: boolean;
    system_alerts: boolean;
    agent_interactions: boolean;
  };
}

export interface AgentEmailStats {
  total_sent: number;
  total_received: number;
  unread_count: number;
  last_activity: string;
  active_conversations: number;
}

export interface AgentEmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  html_body?: string;
  trigger_conditions: {
    event_type: "agent_interaction" | "system_alert" | "manual" | "scheduled";
    agent_traits?: string[];
    time_conditions?: {
      time_of_day?: string;
      day_of_week?: string[];
    };
  };
  variables: string[];
  created_at: string;
  updated_at: string;
}

export interface UseAgentEmailOptions {
  agentId?: string;
  endpoint?: string;
  authHeaders?: Record<string, string>;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export interface UseAgentEmailReturn {
  // State
  config: () => AgentEmailConfig | null;
  stats: () => AgentEmailStats | null;
  templates: () => AgentEmailTemplate[];
  messages: () => EmailMessage[];
  isLoading: () => boolean;
  error: () => string | null;
  
  // Actions
  sendToAgent: (targetAgentId: string, message: Omit<EmailMessage, "to_emails" | "from_agent">) => Promise<boolean>;
  sendToMultipleAgents: (targetAgentIds: string[], message: Omit<EmailMessage, "to_emails" | "from_agent">) => Promise<boolean>;
  updateConfig: (config: Partial<AgentEmailConfig>) => Promise<boolean>;
  createTemplate: (template: Omit<AgentEmailTemplate, "id" | "created_at" | "updated_at">) => Promise<boolean>;
  deleteTemplate: (templateId: string) => Promise<boolean>;
  triggerAutoEmail: (eventType: string, context: Record<string, any>) => Promise<boolean>;
  refreshConfig: () => void;
  refreshStats: () => void;
  refreshTemplates: () => void;
  refreshMessages: () => void;
}

export function useAgentEmail(options: UseAgentEmailOptions = {}): UseAgentEmailReturn {
  const {
    agentId,
    endpoint = "/api/email/agents",
    authHeaders = {},
    autoRefresh = true,
    refreshInterval = 30000, // 30 seconds
  } = options;

  // Use base email composable
  const emailComposable = useEmail({
    endpoint: endpoint.replace("/agents", ""),
    authHeaders,
    autoRefresh,
    refreshInterval,
  });

  // State signals
  const [config, setConfig] = createSignal<AgentEmailConfig | null>(null);
  const [stats, setStats] = createSignal<AgentEmailStats | null>(null);
  const [templates, setTemplates] = createSignal<AgentEmailTemplate[]>([]);
  const [isLoading, setIsLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  // Agent config resource
  const [configResource, { refetch: refreshConfig }] = createResource(
    () => agentId ? `${endpoint}/${agentId}/config` : null,
    async (url) => {
      if (!url) return null;
      
      try {
        const response = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
            ...authHeaders,
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        setConfig(data);
        return data;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch agent config");
        return null;
      }
    }
  );

  // Agent stats resource
  const [statsResource, { refetch: refreshStats }] = createResource(
    () => agentId ? `${endpoint}/${agentId}/stats` : null,
    async (url) => {
      if (!url) return null;
      
      try {
        const response = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
            ...authHeaders,
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        setStats(data);
        return data;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch agent stats");
        return null;
      }
    }
  );

  // Agent templates resource
  const [templatesResource, { refetch: refreshTemplates }] = createResource(
    () => agentId ? `${endpoint}/${agentId}/templates` : null,
    async (url) => {
      if (!url) return [];
      
      try {
        const response = await fetch(url, {
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
        setError(err instanceof Error ? err.message : "Failed to fetch agent templates");
        return [];
      }
    }
  );

  // Auto-refresh effect
  createEffect(() => {
    if (autoRefresh && refreshInterval > 0 && agentId) {
      const interval = setInterval(() => {
        refreshConfig();
        refreshStats();
        refreshTemplates();
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  });

  // Send email to specific agent
  const sendToAgent = async (
    targetAgentId: string, 
    message: Omit<EmailMessage, "to_emails" | "from_agent">
  ): Promise<boolean> => {
    if (!agentId) {
      setError("No agent ID provided");
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${endpoint}/${agentId}/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({
          target_agent_id: targetAgentId,
          message: {
            ...message,
            from_agent: agentId,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        // Refresh stats
        refreshStats();
        return true;
      } else {
        setError(result.error || "Failed to send email to agent");
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send email to agent");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Send email to multiple agents
  const sendToMultipleAgents = async (
    targetAgentIds: string[], 
    message: Omit<EmailMessage, "to_emails" | "from_agent">
  ): Promise<boolean> => {
    if (!agentId) {
      setError("No agent ID provided");
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${endpoint}/${agentId}/send-bulk`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({
          target_agent_ids: targetAgentIds,
          message: {
            ...message,
            from_agent: agentId,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.successful_sends > 0) {
        // Refresh stats
        refreshStats();
        return true;
      } else {
        setError("No emails were sent successfully");
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send emails to agents");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Update agent config
  const updateConfig = async (newConfig: Partial<AgentEmailConfig>): Promise<boolean> => {
    if (!agentId) {
      setError("No agent ID provided");
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${endpoint}/${agentId}/config`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify(newConfig),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      // Refresh config
      refreshConfig();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update agent config");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Create agent template
  const createTemplate = async (
    template: Omit<AgentEmailTemplate, "id" | "created_at" | "updated_at">
  ): Promise<boolean> => {
    if (!agentId) {
      setError("No agent ID provided");
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${endpoint}/${agentId}/templates`, {
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
      setError(err instanceof Error ? err.message : "Failed to create agent template");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete agent template
  const deleteTemplate = async (templateId: string): Promise<boolean> => {
    if (!agentId) {
      setError("No agent ID provided");
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${endpoint}/${agentId}/templates/${templateId}`, {
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
      setError(err instanceof Error ? err.message : "Failed to delete agent template");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger automated email
  const triggerAutoEmail = async (
    eventType: string, 
    context: Record<string, any>
  ): Promise<boolean> => {
    if (!agentId) {
      setError("No agent ID provided");
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${endpoint}/${agentId}/trigger`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({
          event_type: eventType,
          context,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        // Refresh stats
        refreshStats();
        return true;
      } else {
        setError(result.error || "Failed to trigger automated email");
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to trigger automated email");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    // State
    config,
    stats,
    templates,
    messages: emailComposable.messages,
    isLoading,
    error,
    
    // Actions
    sendToAgent,
    sendToMultipleAgents,
    updateConfig,
    createTemplate,
    deleteTemplate,
    triggerAutoEmail,
    refreshConfig,
    refreshStats,
    refreshTemplates,
    refreshMessages: emailComposable.refreshMessages,
  };
}

