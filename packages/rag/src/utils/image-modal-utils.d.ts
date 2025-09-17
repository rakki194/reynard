/**
 * Utility functions for RAG Image Modal
 */
export declare const formatFileSize: (bytes?: number) => string;
export declare const formatDimensions: (dimensions?: {
    width: number;
    height: number;
}) => string;
export declare const getScoreColor: (score: number) => string;
export declare const getScoreLabel: (score: number) => string;
export declare const downloadImage: (imagePath: string, imageId: string) => void;
export declare const copyToClipboard: (text: string) => Promise<void>;
