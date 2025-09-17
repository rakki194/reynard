/**
 * P2P File Upload Composable for File Management
 *
 * This module handles file uploads, progress tracking, and file attachment management
 * for peer-to-peer chat functionality.
 */
import type { MessageAttachment } from "../types/p2p";
export interface P2PFileUploadOptions {
    /** Maximum file size in bytes */
    maxFileSize?: number;
    /** Allowed file types */
    allowedTypes?: string[];
    /** Upload endpoint */
    uploadEndpoint?: string;
    /** Authentication headers */
    authHeaders?: Record<string, string>;
    /** Custom fetch function */
    fetchFn?: typeof fetch;
}
export interface UploadProgress {
    fileId: string;
    fileName: string;
    progress: number;
    status: "pending" | "uploading" | "completed" | "error";
    error?: string;
    uploadedAt?: Date;
}
export interface P2PFileUploadReturn {
    uploads: () => Record<string, UploadProgress>;
    uploadFile: (file: File, roomId: string) => Promise<MessageAttachment>;
    cancelUpload: (fileId: string) => void;
    retryUpload: (fileId: string) => Promise<MessageAttachment>;
    getUploadProgress: (fileId: string) => UploadProgress | undefined;
    clearCompletedUploads: () => void;
    generateAttachmentId: () => string;
}
export declare function useP2PFileUpload(options: P2PFileUploadOptions): P2PFileUploadReturn;
