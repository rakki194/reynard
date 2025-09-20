interface VideoFile {
    id: string;
    name: string;
    url: string;
    thumbnailUrl?: string;
    duration?: number;
    size?: number;
    metadata?: any;
}
interface VideoPlayerProps {
    file: VideoFile;
    onClose: () => void;
}
export declare const VideoPlayer: (props: VideoPlayerProps) => any;
export {};
