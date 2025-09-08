/**
 * Core Shiki State Management
 * 
 * Handles the fundamental state for Shiki syntax highlighting
 */

import { createSignal } from 'solid-js';
import type { ShikiState } from '../types';

export function createShikiState() {
  const [state, setState] = createSignal<ShikiState>({
    highlighter: null,
    isLoading: true,
    error: null,
    highlightedHtml: '',
  });

  const updateState = (updates: Partial<ShikiState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const setHighlighter = (highlighter: any) => {
    updateState({ highlighter, isLoading: false, error: null });
  };

  const setError = (error: string | null) => {
    updateState({ error, isLoading: false });
  };

  const setHighlightedHtml = (html: string) => {
    updateState({ highlightedHtml: html });
  };

  const setLoading = (loading: boolean) => {
    updateState({ isLoading: loading });
  };

  return {
    state,
    updateState,
    setHighlighter,
    setError,
    setHighlightedHtml,
    setLoading,
  };
}
