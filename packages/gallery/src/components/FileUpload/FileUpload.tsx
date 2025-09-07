/**
 * FileUpload Component
 * Orchestrates file upload functionality using smaller components
 */

import { Component, splitProps } from "solid-js";
import type { FileUploadProps } from "./types";
import { useFileUpload } from "./composables/useFileUpload";
import { useDragDrop } from "./composables/useDragDrop";
import { useFileValidation } from "./composables/useFileValidation";
import { useFileUploadHandlers } from "./composables/useFileUploadHandlers";
import { DropZone, FileList, UploadControls } from "./components";
import "./FileUpload.css";

const defaultProps = {
  enableDragDrop: true,
  multiple: true,
  accept: "*/*",
  maxFileSize: 100 * 1024 * 1024, // 100MB
  maxFiles: 10,
  showFileList: true,
  showProgress: true,
  autoUpload: false,
};

function createFileUploadComponent(props: FileUploadProps) {
  const merged = { ...defaultProps, ...props };
  const [local] = splitProps(merged, [
    "enableDragDrop",
    "multiple",
    "accept",
    "maxFileSize",
    "maxFiles",
    "showFileList",
    "showProgress",
    "autoUpload",
    "uploadUrl",
    "headers",
    "onFilesSelected",
    "onUploadStart",
    "onUploadProgress",
    "onUploadComplete",
    "onUploadError",
    "onFilesDropped",
    "class",
  ]);

  // Composables
  const { uploadItems, isUploading, addFiles, startUpload, removeFile, clearFiles } = useFileUpload(local);
  const { isDragOver, handleDragOver, handleDragLeave, handleDrop } = useDragDrop(local, addFiles);
  const { validateFiles } = useFileValidation(local);
  const { handleFileInput, handleDropWithValidation } = useFileUploadHandlers(
    validateFiles,
    addFiles,
    handleDrop
  );

  return {
    local,
    uploadItems,
    isUploading,
    isDragOver,
    handleDragOver,
    handleDragLeave,
    handleDropWithValidation,
    handleFileInput,
    removeFile,
    clearFiles,
    startUpload
  };
}

export const FileUpload: Component<FileUploadProps> = (props) => {
  const {
    local,
    uploadItems,
    isUploading,
    isDragOver,
    handleDragOver,
    handleDragLeave,
    handleDropWithValidation,
    handleFileInput,
    removeFile,
    clearFiles,
    startUpload
  } = createFileUploadComponent(props);

  return (
    <div class={`reynard-file-upload ${local.class || ''}`}>
      <DropZone
        isDragOver={isDragOver}
        handleDragOver={handleDragOver}
        handleDragLeave={handleDragLeave}
        handleDrop={handleDropWithValidation}
        handleFileInput={handleFileInput}
        props={{
          multiple: local.multiple,
          accept: local.accept,
          maxFileSize: local.maxFileSize,
          maxFiles: local.maxFiles
        }}
      />
      
      <FileList
        uploadItems={uploadItems}
        showFileList={local.showFileList}
        showProgress={local.showProgress}
        removeFile={removeFile}
        clearFiles={clearFiles}
      />
      
      <UploadControls
        autoUpload={local.autoUpload}
        hasFiles={uploadItems().length > 0}
        isUploading={isUploading}
        startUpload={() => startUpload()}
      />
    </div>
  );
};

// Export types for external use
export type { FileUploadProps, FileUploadItem } from './types';