/**
 * Text Grid Component for Reynard Caption System
 * 
 * Leverages existing text processing infrastructure and Monaco editor
 * for comprehensive text file handling and editing.
 */

import { Component } from "solid-js";
import { TextGridProps } from "../types/TextTypes";
import { TextFileUpload } from "./TextFileUpload";
import { TextFilesGrid } from "./TextFilesGrid";
import { useTextFileUpload } from "../composables/useTextFileUpload";
import { useTextFileManager } from "../composables/useTextFileManager";

export const TextGrid: Component<TextGridProps> = (props) => {
  const { 
    textFiles, 
    selectedFile, 
    setSelectedFile,
    handleFileSelect, 
    handleFileRemove, 
    handleFileModify,
    addFiles
  } = useTextFileManager({
    initialFiles: props.initialFiles,
    onFileSelect: props.onFileSelect,
    onFileRemove: props.onFileRemove,
    onFileModify: props.onFileModify
  });
  
  const { isLoading, error, handleFileUpload } = useTextFileUpload({
    maxFiles: props.maxFiles,
    onError: (error) => console.error("File upload error:", error)
  });

  // Handle file upload
  const onFileUpload = async (event: Event) => {
    const processedFiles = await handleFileUpload(event);
    if (processedFiles.length > 0) {
      addFiles(processedFiles);
    }
  };


  return (
    <div class={`text-grid ${props.class || ""}`}>
      <TextFileUpload
        onFileUpload={onFileUpload}
        isLoading={isLoading()}
        error={error()}
      />
      
      <TextFilesGrid
        files={textFiles()}
        selectedFile={selectedFile()}
        onFileSelect={handleFileSelect}
        onFileRemove={handleFileRemove}
        onFileModify={handleFileModify}
        onCloseEditor={() => setSelectedFile(null)}
        showMetadata={props.showMetadata}
        editable={props.editable}
      />
    </div>
  );
};

