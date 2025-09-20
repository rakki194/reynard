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
export declare const VideoGrid: (props: VideoGridProps) => any;
export {};
