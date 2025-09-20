interface VideoFile {
    id: string;
    name: string;
    url: string;
    thumbnailUrl?: string;
    duration?: number;
    size?: number;
    metadata?: any;
}
interface VideoGridContentProps {
    videoFiles: VideoFile[];
    selectedFile: VideoFile | null;
    isLoading: () => boolean;
    error: () => string | null;
    class?: string;
    showMetadata?: boolean;
    onFileUpload: (event: Event) => void;
    onFileSelect: (file: VideoFile) => void;
    onFileRemove: (fileId: string) => void;
    onClosePlayer: () => void;
}
export declare const VideoGridContent: (props: VideoGridContentProps) => any;
export {};
