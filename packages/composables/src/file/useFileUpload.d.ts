export interface FileUploadOptions {
    maxFileSize?: number;
    allowedFileTypes?: string[];
    maxFiles?: number;
    onProgress?: (progress: number) => void;
    onSuccess?: (response: any) => void;
    onError?: (error: Error) => void;
    uploadUrl?: string;
    authFetch?: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
}
export interface UploadProgress {
    file: File;
    progress: number;
    status: "pending" | "uploading" | "completed" | "error";
    error?: string;
}
/**
 * File upload composable with progress tracking and validation
 *
 * @param options Configuration options for file upload behavior
 * @returns Object with upload functions and state
 */
export declare function useFileUpload(options?: FileUploadOptions): {
    uploadFile: (file: File) => Promise<any>;
    uploadFiles: (files: FileList | File[]) => Promise<any[]>;
    uploadProgress: import("solid-js").Accessor<UploadProgress[]>;
    isUploading: import("solid-js").Accessor<boolean>;
    clearProgress: () => void;
    removeFromProgress: (file: File) => void;
    validateFile: (file: File) => string | null;
};
