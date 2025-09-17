/**
 * Embedding Dashboard Header Component
 *
 * Handles the dashboard header with tab navigation.
 */
import { Component } from "solid-js";
export interface EmbeddingDashboardHeaderProps {
    /** Active tab */
    activeTab: "distribution" | "pca" | "quality" | "3d";
    /** Tab change handler */
    onTabChange: (tab: "distribution" | "pca" | "quality" | "3d") => void;
}
export declare const EmbeddingDashboardHeader: Component<EmbeddingDashboardHeaderProps>;
