/**
 * ADR Relationship Visualization Engine
 *
 * This module provides comprehensive visualization capabilities for ADR relationships,
 * including interactive graphs, network diagrams, and relationship maps.
 */
import { KnowledgeNode, KnowledgeEdge, GraphPath, GraphMetrics } from "./KnowledgeGraph";
export interface VisualizationConfig {
    width: number;
    height: number;
    theme: "light" | "dark" | "colorful";
    layout: "force" | "hierarchical" | "circular" | "grid";
    nodeSize: "fixed" | "degree" | "importance";
    edgeThickness: "fixed" | "weight" | "type";
    showLabels: boolean;
    showTooltips: boolean;
    animation: boolean;
}
export interface VisualizationOutput {
    format: "svg" | "png" | "html" | "json";
    content: string;
    metadata: {
        nodeCount: number;
        edgeCount: number;
        generatedAt: string;
        version: string;
    };
}
export declare class ADRVisualizationEngine {
    private config;
    constructor(config?: Partial<VisualizationConfig>);
    /**
     * Generate interactive HTML visualization
     */
    generateInteractiveVisualization(nodes: KnowledgeNode[], edges: KnowledgeEdge[], outputPath: string): Promise<VisualizationOutput>;
    /**
     * Generate SVG visualization
     */
    generateSVGVisualization(nodes: KnowledgeNode[], edges: KnowledgeEdge[], outputPath: string): Promise<VisualizationOutput>;
    /**
     * Generate Mermaid diagram
     */
    generateMermaidDiagram(nodes: KnowledgeNode[], edges: KnowledgeEdge[]): string;
    /**
     * Generate relationship matrix
     */
    generateRelationshipMatrix(nodes: KnowledgeNode[], edges: KnowledgeEdge[]): string;
    /**
     * Generate network statistics
     */
    generateNetworkStatistics(metrics: GraphMetrics): string;
    /**
     * Generate path visualization
     */
    generatePathVisualization(path: GraphPath): string;
    /**
     * Create interactive HTML visualization
     */
    private createInteractiveHTML;
    /**
     * Create SVG visualization
     */
    private createSVG;
    private sanitizeId;
    private getNodeShape;
    private getEdgeLabel;
    private calculateAverageDegree;
    private getNodeX;
    private getNodeY;
    private getNodeRadius;
    private getNodeColor;
    private getBackgroundColor;
    private getTextColor;
    private getPrimaryColor;
    private getPrimaryHoverColor;
    private getSecondaryColor;
    private getAccentColor;
    private getCardBackground;
}
