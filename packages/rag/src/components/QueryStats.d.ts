/**
 * Query Stats Component
 *
 * Displays performance metrics for RAG queries
 * including query time, embedding time, and search time.
 */
import { Component } from "solid-js";
import type { RAGQueryResponse } from "../types";
export interface QueryStatsProps {
    queryResponse: RAGQueryResponse;
}
export declare const QueryStats: Component<QueryStatsProps>;
