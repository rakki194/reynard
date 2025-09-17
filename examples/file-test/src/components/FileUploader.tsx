import { createSignal } from "solid-js";
import "./FileUploader.css";

interface FileUploaderProps {
  onFilesSelected: (files: FileList) => void;
  disabled?: boolean;
}

export default function FileUploader(props: FileUploaderProps) {
  const [isDragOver, setIsDragOver] = createSignal(false);

  const handleFileInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      props.onFilesSelected(target.files);
    }
  };

  const handleDrop = (event: DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);

    if (props.disabled) return;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      props.onFilesSelected(files);
    }
  };

  const handleDragOver = (event: DragEvent) => {
    event.preventDefault();
    if (!props.disabled) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (event: DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const openFileDialog = () => {
    if (!props.disabled) {
      const input = document.getElementById("file-input") as HTMLInputElement;
      input?.click();
    }
  };

  return (
    <div
      class={`file-uploader ${isDragOver() ? "dragover" : ""}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={openFileDialog}
    >
      <input
        id="file-input"
        type="file"
        multiple
        accept="image/*,video/*,audio/*,.txt,.js,.ts,.tsx,.jsx,.css,.html,.json,.md,.pdf,.doc,.docx"
        class="file-input"
        onChange={handleFileInput}
        disabled={props.disabled}
        aria-label="Choose files to upload"
      />

      <div class="upload-text">
        <p>📁 Drop files here or click to browse</p>
        <p class="file-types">Supports: Images, Videos, Audio, Text, Code, Documents</p>
      </div>

      <button class="upload-button" type="button" disabled={props.disabled}>
        {props.disabled ? "Processing..." : "Choose Files"}
      </button>
    </div>
  );
}
