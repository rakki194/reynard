/**
 * Image Types for Reynard Image System
 *
 * TypeScript interfaces and types for image file handling and processing.
 */
/**
 * Image item interface for general image file representation
 */
export interface ImageItem {
    id: string;
    name: string;
    path: string;
    size: number;
    width?: number;
    height?: number;
    thumbnail?: string;
    metadata?: {
        format?: string;
        colorSpace?: string;
        exif?: Record<string, any>;
    };
}
export interface ImageFile {
    /** Unique identifier */
    id: string;
    /** File name */
    name: string;
    /** File size in bytes */
    size: number;
    /** MIME type */
    type: string;
    /** File URL or blob URL */
    url: string;
    /** Generated thumbnail blob */
    thumbnail?: Blob;
    /** Extracted metadata */
    metadata?: ImageMetadata;
    /** Upload timestamp */
    uploadedAt: Date;
    /** Last modification timestamp */
    modifiedAt?: Date;
    /** Generated caption (if any) */
    caption?: string;
    /** Caption generation status */
    captionStatus?: "pending" | "generating" | "completed" | "failed";
}
export interface ImageMetadata {
    /** Image width in pixels */
    width: number;
    /** Image height in pixels */
    height: number;
    /** Image format (JPEG, PNG, etc.) */
    format: string;
    /** Color space */
    colorSpace: string;
    /** Color depth (bits per pixel) */
    colorDepth: number;
    /** Whether image has transparency */
    hasTransparency: boolean;
    /** EXIF data (if available) */
    exif?: ImageExifData;
    /** Creation date from metadata */
    creationDate?: Date;
    /** Camera information (if available) */
    camera?: CameraInfo;
}
export interface ImageExifData {
    /** Camera make */
    make?: string;
    /** Camera model */
    model?: string;
    /** Lens information */
    lens?: string;
    /** Focal length */
    focalLength?: number;
    /** Aperture value */
    aperture?: number;
    /** Shutter speed */
    shutterSpeed?: string;
    /** ISO sensitivity */
    iso?: number;
    /** Flash information */
    flash?: string;
    /** White balance */
    whiteBalance?: string;
    /** GPS coordinates */
    gps?: GpsCoordinates;
}
export interface CameraInfo {
    /** Camera make */
    make: string;
    /** Camera model */
    model: string;
    /** Lens model */
    lens?: string;
    /** Software version */
    software?: string;
}
export interface GpsCoordinates {
    /** Latitude */
    latitude: number;
    /** Longitude */
    longitude: number;
    /** Altitude (if available) */
    altitude?: number;
}
export interface ImageGridState {
    /** Currently selected image */
    selectedImage: ImageFile | null;
    /** Images being processed */
    processingImages: Set<string>;
    /** Upload progress for each image */
    uploadProgress: Record<string, number>;
    /** Error messages for failed images */
    errors: Record<string, string>;
}
export interface ImageProcessingOptions {
    /** Thumbnail generation options */
    thumbnail?: {
        /** Thumbnail size [width, height] */
        size: [number, number];
        /** Output format */
        format: "webp" | "jpeg" | "png";
        /** Quality (0-100) */
        quality: number;
        /** Maintain aspect ratio */
        maintainAspectRatio: boolean;
    };
    /** Metadata extraction options */
    metadata?: {
        /** Extract EXIF data */
        extractExif: boolean;
        /** Extract GPS data */
        extractGps: boolean;
        /** Extract color profile */
        extractColorProfile: boolean;
    };
    /** Caption generation options */
    caption?: {
        /** Auto-generate captions */
        autoGenerate: boolean;
        /** Caption model to use */
        model: string;
        /** Caption style */
        style: "descriptive" | "concise" | "detailed";
    };
}
export interface ImageGridProps {
    /** Initial image files */
    initialFiles?: ImageFile[];
    /** Callback when files are selected */
    onFileSelect?: (file: ImageFile) => void;
    /** Callback when files are removed */
    onFileRemove?: (fileId: string) => void;
    /** Callback when caption generation is requested */
    onGenerateCaption?: (file: ImageFile) => void;
    /** Maximum number of files to display */
    maxFiles?: number;
    /** Whether to show file metadata */
    showMetadata?: boolean;
    /** Whether caption generation is in progress */
    isGenerating?: boolean;
    /** Custom CSS class */
    class?: string;
}
export interface ImageFileCardProps {
    /** Image file to display */
    file: ImageFile;
    /** Whether this file is selected */
    isSelected: boolean;
    /** Selection callback */
    onSelect: () => void;
    /** Removal callback */
    onRemove: () => void;
    /** Caption generation callback */
    onGenerateCaption: () => void;
    /** Whether to show metadata */
    showMetadata?: boolean;
    /** Whether caption generation is in progress */
    isGenerating?: boolean;
}
export interface ImageViewerProps {
    /** Image file to display */
    file: ImageFile;
    /** Close callback */
    onClose: () => void;
    /** Caption generation callback */
    onGenerateCaption: () => void;
    /** Whether caption generation is in progress */
    isGenerating?: boolean;
}
