/**
 * Modal Content Component
 *
 * Contains the main content layout for the 3D visualization modal
 */
import { Component } from "solid-js";
import type { RAGQueryHit } from "../../types";
import type { use3DVisualizationParams, use3DVisualizationData } from "../../composables";
interface ModalContentProps {
    searchQuery: string;
    searchResults: RAGQueryHit[];
    params: ReturnType<typeof use3DVisualizationParams>;
    visualizationData: ReturnType<typeof use3DVisualizationData>;
}
export declare const ModalContent: Component<ModalContentProps>;
export {};
