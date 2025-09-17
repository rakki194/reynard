/**
 * RAG Upload Tab Component
 *
 * Handles file upload functionality for the RAG system
 * with progress tracking and file type validation.
 */
export interface UploadTabProps {
    isUploading: boolean;
    uploadProgress: number;
    onFileSelect: (e: Event) => void;
}
export declare function UploadTab(props: UploadTabProps): any;
