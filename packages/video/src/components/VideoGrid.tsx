/**
 * Video Grid Component for Reynard Caption System
 *
 * Orchestrates video file management with modular components.
 */
import { createEffect, createSignal } from "solid-js";
import { useVideoProcessing } from "../composables/useVideoProcessing";
import { VideoGridContent } from "./VideoGridContent";

interface VideoFile {
  id: string;
  name: string;
  url: string;
  thumbnailUrl?: string;
  duration?: number;
  size?: number;
  metadata?: any;
}

interface VideoGridProps {
  initialFiles?: VideoFile[];
  onFileSelect?: (file: VideoFile) => void;
  onFileDelete?: (fileId: string) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
  class?: string;
  showMetadata?: boolean;
}

// File upload handler
const createFileUploadHandler = (
  processVideoFile: (file: File) => Promise<VideoFile>, 
  setVideoFiles: (updater: (prev: VideoFile[]) => VideoFile[]) => void, 
  maxFiles: number
) => {
    return async (event: Event) => {
        const input = event.target as HTMLInputElement;
        const files = input.files;
        if (!files || files.length === 0)
            return;
        const filesToProcess = Array.from(files).slice(0, maxFiles);
        try {
            const processedFiles = await Promise.all(filesToProcess.map(processVideoFile));
            setVideoFiles(prev => [...prev, ...processedFiles]);
        }
        catch (err) {
            console.error("Failed to process video files:", err);
        }
    };
};
export const VideoGrid = (props: VideoGridProps) => {
    const [videoFiles, setVideoFiles] = createSignal<VideoFile[]>(props.initialFiles || []);
    const [selectedFile, setSelectedFile] = createSignal<VideoFile | null>(null);
    // Use video processing composable
    const { isLoading, error, processVideoFile, destroy } = useVideoProcessing({
        thumbnailSize: [200, 200],
        thumbnailFormat: "webp",
        thumbnailQuality: 85,
        maintainAspectRatio: true,
        captureTime: 2,
    });
    // Handle file selection
    const handleFileSelect = (file: VideoFile) => {
        setSelectedFile(file);
        props.onFileSelect?.(file);
    };
    // Handle file removal
    const handleFileRemove = (fileId: string) => {
        setVideoFiles(prev => prev.filter(f => f.id !== fileId));
        if (selectedFile()?.id === fileId) {
            setSelectedFile(null);
        }
        props.onFileDelete?.(fileId);
    };
    // Create file upload handler
    const maxFiles = () => props.maxFiles || 10;
    const handleFileUpload = createFileUploadHandler(processVideoFile, setVideoFiles, maxFiles());
    // Cleanup on unmount
    createEffect(() => {
        return () => {
            destroy();
        };
    });
    return (<VideoGridContent class={props.class} videoFiles={videoFiles()} selectedFile={selectedFile()} isLoading={isLoading} error={error} showMetadata={props.showMetadata} onFileUpload={handleFileUpload} onFileSelect={handleFileSelect} onFileRemove={handleFileRemove} onClosePlayer={() => setSelectedFile(null)}/>);
};
