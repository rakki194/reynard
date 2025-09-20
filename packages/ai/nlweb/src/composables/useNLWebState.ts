/**
 * NLWeb State Management
 *
 * State management utilities for the NLWeb composable.
 */

import { createSignal } from "solid-js";
import { NLWebSuggestionResponse, NLWebHealthStatus, NLWebConfiguration, NLWebTool } from "../types/index.js";

export interface NLWebState {
  suggestions: () => NLWebSuggestionResponse | null;
  setSuggestions: (value: NLWebSuggestionResponse | null) => void;
  health: () => NLWebHealthStatus | null;
  setHealth: (value: NLWebHealthStatus | null) => void;
  configuration: () => NLWebConfiguration | null;
  setConfiguration: (value: NLWebConfiguration | null) => void;
  tools: () => NLWebTool[];
  setTools: (value: NLWebTool[]) => void;
  loading: () => boolean;
  setLoading: (value: boolean) => void;
  error: () => string | null;
  setError: (value: string | null) => void;
}

/**
 * Create NLWeb state signals
 */
export function createNLWebState(): NLWebState {
  const [suggestions, setSuggestions] = createSignal<NLWebSuggestionResponse | null>(null);
  const [health, setHealth] = createSignal<NLWebHealthStatus | null>(null);
  const [configuration, setConfiguration] = createSignal<NLWebConfiguration | null>(null);
  const [tools, setTools] = createSignal<NLWebTool[]>([]);
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  return {
    suggestions,
    setSuggestions,
    health,
    setHealth,
    configuration,
    setConfiguration,
    tools,
    setTools,
    loading,
    setLoading,
    error,
    setError,
  };
}
