/**
 * Tag Color Utilities
 *
 * Advanced OKLCH-based color generation for tags with intensity control
 * and theme integration. Leverages Reynard's existing OKLCH color system.
 */
export interface TagColor {
    background: string;
    text: string;
    border: string;
    hover?: string;
    active?: string;
    focus?: string;
}
export interface TagColorOptions {
    intensity?: number;
    theme?: string;
    variant?: "default" | "muted" | "vibrant";
}
export interface OKLCHColor {
    l: number;
    c: number;
    h: number;
}
export declare class TagColorGenerator {
    private usedColors;
    private baseHues;
    getColor(tag: string, options?: TagColorOptions): TagColor;
    private getTagHue;
    private generateOKLCHColor;
    private oklchToCSS;
    getColorByIndex(index: number, options?: TagColorOptions): TagColor;
    reset(): void;
    getUsedColors(): Map<string, number>;
}
export declare function createTagColorGenerator(): TagColorGenerator;
export declare function getTagColor(tag: string): TagColor;
