/**
 * MCP (Model Context Protocol) composable for Reynard API client
 */

import { createSignal, createEffect } from "solid-js";
import type { ReynardApiClient } from "../client";

export interface MCPComposableTokenRequest {
  client_id: string;
  additional_permissions?: string[];
}

export interface MCPComposableTokenResponse {
  token: string;
  client_id: string;
  permissions: string[];
  expires_at: number;
}

export interface MCPComposableClientResponse {
  client_id: string;
  client_type: string;
  name: string;
  permissions: string[];
  is_active: boolean;
  created_at: string;
  last_used?: string;
}

export interface MCPComposableStatsResponse {
  total_clients: number;
  active_clients: number;
  client_types: Record<string, number>;
  permissions: string[];
}

export interface MCPComposableValidationResponse {
  valid: boolean;
  client_id: string;
  client_type: string;
  permissions: string[];
  expires_at: number;
  client_name: string;
}

export function useMCP(client: ReynardApiClient) {
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  const generateToken = async (request: MCPComposableTokenRequest): Promise<MCPComposableTokenResponse> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${client.config.basePath}/mcp/token`, {
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

  const listClients = async (): Promise<MCPComposableClientResponse[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${client.config.basePath}/mcp/clients`);

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

  const getClientInfo = async (client_id: string): Promise<MCPComposableClientResponse> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${client.config.basePath}/mcp/client/${client_id}`);

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

  const getStats = async (): Promise<MCPComposableStatsResponse> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${client.config.basePath}/mcp/stats`);

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

  const validateToken = async (): Promise<MCPComposableValidationResponse> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${client.config.basePath}/mcp/validate`);

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
    generateToken,
    listClients,
    getClientInfo,
    getStats,
    validateToken,
  };
}
