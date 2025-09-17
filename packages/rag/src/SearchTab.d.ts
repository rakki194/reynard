/**
 * RAG Search Tab Component
 *
 * Handles the search interface and results display
 * for RAG queries with EmbeddingGemma integration.
 */
import type { RAGResult, RAGQueryResponse } from "./types";
export interface SearchTabProps {
    query: string;
    onQueryChange: (query: string) => void;
    onSearch: () => void;
    onKeyPress: (e: KeyboardEvent) => void;
    isSearching: boolean;
    error: string | null;
    results: RAGResult[];
    queryResponse: RAGQueryResponse | null;
    onResultClick: (result: RAGResult) => void;
}
export declare function SearchTab(props: SearchTabProps): any;
