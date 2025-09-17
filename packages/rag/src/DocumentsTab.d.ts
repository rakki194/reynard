/**
 * RAG Documents Tab Component
 *
 * Displays and manages documents in the RAG system
 * with document listing and deletion capabilities.
 */
import type { RAGDocument } from "./types";
export interface DocumentsTabProps {
    documents: RAGDocument[];
    onRefresh: () => void;
    onDeleteDocument: (documentId: string) => void;
}
export declare function DocumentsTab(props: DocumentsTabProps): any;
