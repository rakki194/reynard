/**
 * useScrapingConfig Composable
 * Manages scraping configuration
 */

import { createEffect, createSignal } from "solid-js";
import type { ScraperConfig, ScrapingType } from "../types";

export interface UseScrapingConfigOptions {
  autoSave?: boolean;
  saveDelay?: number;
}

export interface UseScrapingConfigReturn {
  configs: Record<ScrapingType, ScraperConfig>;
  isLoading: boolean;
  error: string | null;
  getConfig: (type: ScrapingType) => ScraperConfig | undefined;
  updateConfig: (type: ScrapingType, config: Partial<ScraperConfig>) => Promise<void>;
  resetConfig: (type: ScrapingType) => Promise<void>;
  saveConfigs: () => Promise<void>;
  loadConfigs: () => Promise<void>;
}

export function useScrapingConfig(options: UseScrapingConfigOptions = {}): UseScrapingConfigReturn {
  const { autoSave = true, saveDelay = 1000 } = options;

  const [configs, setConfigs] = createSignal<Record<ScrapingType, ScraperConfig>>(
    {} as Record<ScrapingType, ScraperConfig>
  );
  const [isLoading, setIsLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  let saveTimeout: number | null = null;

  const getConfig = (type: ScrapingType): ScraperConfig | undefined => {
    return configs()[type];
  };

  const updateConfig = async (type: ScrapingType, config: Partial<ScraperConfig>): Promise<void> => {
    try {
      setConfigs(prev => ({
        ...prev,
        [type]: {
          ...prev[type],
          ...config,
        },
      }));

      if (autoSave) {
        if (saveTimeout) {
          clearTimeout(saveTimeout);
        }
        saveTimeout = setTimeout(saveConfigs, saveDelay);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const resetConfig = async (type: ScrapingType): Promise<void> => {
    try {
      const response = await fetch(`/api/scraping/configs/${type}/reset`, {
        method: "POST",
      });

      const result = await response.json();

      if (result.success && result.data) {
        setConfigs(prev => ({
          ...prev,
          [type]: result.data,
        }));
      } else {
        throw new Error(result.error || "Failed to reset config");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const saveConfigs = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/scraping/configs", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(configs()),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to save configs");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const loadConfigs = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/scraping/configs");
      const result = await response.json();

      if (result.success && result.data) {
        setConfigs(result.data);
      } else {
        setError(result.error || "Failed to load configs");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  createEffect(() => {
    loadConfigs();
  });

  return {
    configs: configs(),
    isLoading,
    error,
    getConfig,
    updateConfig,
    resetConfig,
    saveConfigs,
    loadConfigs,
  };
}
