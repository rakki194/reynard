/**
 * P2P File Upload Composable for File Management
 *
 * This module handles file uploads, progress tracking, and file attachment management
 * for peer-to-peer chat functionality.
 */

import { createSignal, createMemo } from "solid-js";
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

export function useP2PFileUpload(options: P2PFileUploadOptions): P2PFileUploadReturn {
  const {
    maxFileSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = ["image/*", "video/*", "audio/*", "application/pdf", "text/*"],
    uploadEndpoint = "/api/upload",
    authHeaders = {},
    fetchFn = fetch,
  } = options;

  // Upload progress tracking
  const [uploads, setUploads] = createSignal<Record<string, UploadProgress>>({});

  // Generate unique attachment ID
  const generateAttachmentId = (): string => {
    return `attachment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Validate file
  const validateFile = (file: File): void => {
    if (file.size > maxFileSize) {
      throw new Error(`File size ${file.size} exceeds maximum allowed size ${maxFileSize}`);
    }

    const isAllowedType = allowedTypes.some(type => {
      if (type.endsWith("/*")) {
        return file.type.startsWith(type.slice(0, -1));
      }
      return file.type === type;
    });

    if (!isAllowedType) {
      throw new Error(`File type ${file.type} is not allowed`);
    }
  };

  // Upload file
  const uploadFile = async (file: File, roomId: string): Promise<MessageAttachment> => {
    const fileId = generateAttachmentId();

    try {
      // Validate file
      validateFile(file);

      // Initialize upload progress
      setUploads(prev => ({
        ...prev,
        [fileId]: {
          fileId,
          fileName: file.name,
          progress: 0,
          status: "pending",
        },
      }));

      // Create form data
      const formData = new FormData();
      formData.append("file", file);
      formData.append("roomId", roomId);
      formData.append("fileId", fileId);

      // Update status to uploading
      setUploads(prev => ({
        ...prev,
        [fileId]: { ...prev[fileId], status: "uploading" },
      }));

      // Upload with progress tracking
      const response = await fetchFn(uploadEndpoint, {
        method: "POST",
        headers: {
          ...authHeaders,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();

      // Update progress to completed
      setUploads(prev => ({
        ...prev,
        [fileId]: {
          ...prev[fileId],
          progress: 100,
          status: "completed",
          uploadedAt: new Date(),
        },
      }));

      // Create attachment object
      const attachment: MessageAttachment = {
        id: fileId,
        name: file.name,
        type: file.type,
        size: file.size,
        url: result.url,
        thumbnailUrl: result.thumbnailUrl,
        uploadedAt: new Date(),
      };

      return attachment;
    } catch (error) {
      // Update progress to error
      setUploads(prev => ({
        ...prev,
        [fileId]: {
          ...prev[fileId],
          status: "error",
          error: error instanceof Error ? error.message : "Upload failed",
        },
      }));

      throw error;
    }
  };

  // Cancel upload
  const cancelUpload = (fileId: string) => {
    setUploads(prev => {
      const upload = prev[fileId];
      if (upload && upload.status === "uploading") {
        // In a real implementation, you would cancel the actual upload request
        return {
          ...prev,
          [fileId]: { ...upload, status: "error", error: "Upload cancelled" },
        };
      }
      return prev;
    });
  };

  // Retry upload
  const retryUpload = async (fileId: string): Promise<MessageAttachment> => {
    const upload = uploads()[fileId];
    if (!upload) {
      throw new Error(`Upload ${fileId} not found`);
    }

    // Reset upload status
    setUploads(prev => ({
      ...prev,
      [fileId]: {
        ...prev[fileId],
        status: "pending",
        progress: 0,
        error: undefined,
      },
    }));

    // For retry, we would need to store the original file
    // This is a simplified implementation
    throw new Error("Retry functionality requires storing original file data");
  };

  // Get upload progress
  const getUploadProgress = (fileId: string): UploadProgress | undefined => {
    return uploads()[fileId];
  };

  // Clear completed uploads
  const clearCompletedUploads = () => {
    setUploads(prev => {
      const filtered: Record<string, UploadProgress> = {};
      Object.entries(prev).forEach(([key, value]) => {
        if (value.status !== "completed") {
          filtered[key] = value;
        }
      });
      return filtered;
    });
  };

  return {
    uploads,
    uploadFile,
    cancelUpload,
    retryUpload,
    getUploadProgress,
    clearCompletedUploads,
    generateAttachmentId,
  };
}
