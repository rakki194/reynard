/**
 * Panel Configuration Types
 *
 * Configuration types for floating panels.
 */
export type PanelTheme = "default" | "accent" | "warning" | "error" | "success" | "info";
export interface PanelConfig {
    draggable?: boolean;
    resizable?: boolean;
    closable?: boolean;
    backdrop?: boolean;
    backdropBlur?: boolean;
    backdropColor?: string;
    animationDelay?: number;
    animationDuration?: number;
    animationEasing?: string;
    showOnHover?: boolean;
    hoverDelay?: number;
    persistent?: boolean;
    theme?: PanelTheme;
    backdropOpacity?: number;
}
