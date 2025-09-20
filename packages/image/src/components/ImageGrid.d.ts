interface ImageFile {
    id: string;
    name: string;
    url: string;
    thumbnailUrl?: string;
    thumbnail?: Blob;
    size?: number;
    metadata?: any;
}
interface ImageGridProps {
    initialFiles?: ImageFile[];
    onFileSelect?: (file: ImageFile) => void;
    onFileDelete?: (fileId: string) => void;
    maxFiles?: number;
    acceptedTypes?: string[];
    class?: string;
    showMetadata?: boolean;
    isGenerating?: boolean;
}
export declare const ImageGrid: (props: ImageGridProps) => any;
export {};
