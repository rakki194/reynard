import { createSignal } from "solid-js";
/**
 * File upload composable with progress tracking and validation
 *
 * @param options Configuration options for file upload behavior
 * @returns Object with upload functions and state
 */
export function useFileUpload(options = {}) {
    const { maxFileSize = 100 * 1024 * 1024, // 100MB default
    allowedFileTypes, maxFiles = 10, onProgress, onSuccess, onError, uploadUrl = "/api/upload", authFetch = fetch, } = options;
    const [uploadProgress, setUploadProgress] = createSignal([]);
    const [isUploading, setIsUploading] = createSignal(false);
    // Validate file
    const validateFile = (file) => {
        if (file.size > maxFileSize) {
            return `File ${file.name} is too large. Maximum size is ${(maxFileSize / 1024 / 1024).toFixed(0)}MB`;
        }
        if (allowedFileTypes && allowedFileTypes.length > 0) {
            const fileExtension = file.name.split(".").pop()?.toLowerCase();
            if (!fileExtension || !allowedFileTypes.includes(fileExtension)) {
                return `File type .${fileExtension} is not allowed`;
            }
        }
        return null;
    };
    // Upload a single file
    const uploadFile = async (file) => {
        const validationError = validateFile(file);
        if (validationError) {
            throw new Error(validationError);
        }
        const formData = new FormData();
        formData.append("file", file);
        const progress = {
            file,
            progress: 0,
            status: "uploading",
        };
        setUploadProgress((prev) => [...prev, progress]);
        try {
            const response = await authFetch(uploadUrl, {
                method: "POST",
                body: formData,
            });
            if (!response.ok) {
                throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
            }
            const result = await response.json();
            setUploadProgress((prev) => prev.map((p) => p.file === file
                ? { ...p, progress: 100, status: "completed" }
                : p));
            onSuccess?.(result);
            return result;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Upload failed";
            setUploadProgress((prev) => prev.map((p) => p.file === file
                ? { ...p, status: "error", error: errorMessage }
                : p));
            onError?.(error instanceof Error ? error : new Error(errorMessage));
            throw error;
        }
    };
    // Upload multiple files
    const uploadFiles = async (files) => {
        const fileArray = Array.from(files);
        if (fileArray.length > maxFiles) {
            throw new Error(`Too many files. Maximum allowed is ${maxFiles}`);
        }
        setIsUploading(true);
        setUploadProgress([]);
        try {
            const results = await Promise.all(fileArray.map((file) => uploadFile(file)));
            return results;
        }
        finally {
            setIsUploading(false);
        }
    };
    // Clear upload progress
    const clearProgress = () => {
        setUploadProgress([]);
    };
    // Remove specific file from progress
    const removeFromProgress = (file) => {
        setUploadProgress((prev) => prev.filter((p) => p.file !== file));
    };
    return {
        uploadFile,
        uploadFiles,
        uploadProgress,
        isUploading,
        clearProgress,
        removeFromProgress,
        validateFile,
    };
}
