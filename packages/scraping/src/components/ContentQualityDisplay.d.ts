/**
 * ContentQualityDisplay Component
 *
 * Visualizes content quality assessment with detailed factor breakdown.
 */
import type { ContentQuality } from "../types";
export interface ContentQualityDisplayProps {
    content?: string;
    metadata?: Record<string, any>;
    quality?: ContentQuality;
    onQualityUpdate?: (quality: ContentQuality) => void;
    className?: string;
}
export declare function ContentQualityDisplay(props: ContentQualityDisplayProps): any;
