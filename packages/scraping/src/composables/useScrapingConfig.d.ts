/**
 * useScrapingConfig Composable
 * Manages scraping configuration
 */
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
export declare function useScrapingConfig(options?: UseScrapingConfigOptions): UseScrapingConfigReturn;
