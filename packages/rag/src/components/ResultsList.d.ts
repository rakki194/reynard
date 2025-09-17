/**
 * Results List Component
 *
 * Displays the list of RAG search results
 * with metadata and similarity scores.
 */
import { Component } from "solid-js";
import type { RAGResult } from "../types";
export interface ResultsListProps {
    results: RAGResult[];
    onResultClick: (result: RAGResult) => void;
}
export declare const ResultsList: Component<ResultsListProps>;
