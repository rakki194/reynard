/**
 * ConfigurationPanel Component
 *
 * Advanced scraper configuration and settings management.
 */
import type { ScraperConfig, ScrapingType } from "../types";
export interface ConfigurationPanelProps {
    onConfigUpdate?: (configs: Record<ScrapingType, ScraperConfig>) => void;
    className?: string;
}
export declare function ConfigurationPanel(props: ConfigurationPanelProps): any;
