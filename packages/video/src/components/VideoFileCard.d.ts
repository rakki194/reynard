interface VideoFile {
    id: string;
    name: string;
    url: string;
    thumbnailUrl?: string;
    thumbnail?: Blob;
    duration?: number;
    size?: number;
    metadata?: any;
}
interface VideoFileCardProps {
    file: VideoFile;
    isSelected: boolean;
    onSelect: () => void;
    onRemove: () => void;
    showMetadata?: boolean;
}
export declare const VideoFileCard: (props: VideoFileCardProps) => any;
export {};
