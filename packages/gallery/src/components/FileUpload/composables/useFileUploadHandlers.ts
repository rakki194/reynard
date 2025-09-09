/**
 * useFileUploadHandlers Composable
 * Handles file input and drag/drop event logic
 */

export interface FileUploadHandlers {
  handleFileInput: (event: Event) => void;
  handleDropWithValidation: (event: DragEvent) => void;
}

export function useFileUploadHandlers(
  validateFiles: (files: File[]) => { validFiles: File[]; errors: string[] },
  addFiles: (files: File[]) => void,
  handleDrop: (event: DragEvent) => void,
): FileUploadHandlers {
  /**
   * Handle file input change
   */
  const handleFileInput = (event: Event) => {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);
    if (files.length > 0) {
      const { validFiles, errors } = validateFiles(files);
      if (errors.length > 0) {
        console.warn("File validation errors:", errors);
      }
      if (validFiles.length > 0) {
        addFiles(validFiles);
      }
    }
    // Reset input
    input.value = "";
  };

  /**
   * Handle drag and drop with validation
   */
  const handleDropWithValidation = (event: DragEvent) => {
    const files = Array.from(event.dataTransfer?.files || []);
    if (files.length > 0) {
      const { validFiles, errors } = validateFiles(files);
      if (errors.length > 0) {
        console.warn("File validation errors:", errors);
      }
      if (validFiles.length > 0) {
        addFiles(validFiles);
      }
    }
    handleDrop(event);
  };

  return {
    handleFileInput,
    handleDropWithValidation,
  };
}
