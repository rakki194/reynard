/**
 * useContentQuality Composable
 * Manages content quality assessment
 */
import type { ContentQuality, QualityFactor, QualityLevel } from "../types";
export interface UseContentQualityOptions {
    onQualityUpdate?: (quality: ContentQuality) => void;
}
export interface UseContentQualityReturn {
    assessQuality: (content: string, metadata?: Record<string, any>) => Promise<ContentQuality>;
    getQualityLevel: (score: number) => QualityLevel;
    getQualityFactors: () => QualityFactor[];
    isQualityAcceptable: (quality: ContentQuality, threshold?: number) => boolean;
}
export declare function useContentQuality(options?: UseContentQualityOptions): UseContentQualityReturn;
