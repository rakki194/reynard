/**
 * System Statistics Component
 *
 * Displays RAG system statistics including document counts,
 * embedding coverage, and model information.
 */
import type { RAGStats } from "../types";
export interface SystemStatsProps {
    stats: RAGStats | null;
}
export declare function SystemStats(props: SystemStatsProps): any;
