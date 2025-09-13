/**
 * Temporary type declarations for reynard-ai-shared
 * This will be removed once the proper package is built
 */

declare module 'reynard-ai-shared' {
  export interface CaptionResult {
    success: boolean;
    caption?: string;
    error?: string;
    processingTime?: number;
    image_path?: string;
  }

  export type CaptionType = 'CAPTION' | 'TAGS' | 'E621' | 'TOML';

  export interface CaptionTask {
    imagePath: string;
    generatorName: string;
    config: Record<string, any>;
    postProcess: boolean;
    priority: number;
    force?: boolean;
    captionType?: CaptionType;
  }

  export interface GeneratorInfo {
    name: string;
    description: string;
    version: string;
    caption_type: CaptionType;
    supported_formats: string[];
    max_image_size: number;
    processing_time: number;
  }

  export interface BaseAIService {
    name: string;
    status: string;
    startupTime: Date;
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
  }

  export interface ServiceConfig {
    name: string;
    config: Record<string, any>;
  }

  // Export as values for enum-like usage
  export const CaptionType: {
    CAPTION: 'CAPTION';
    TAGS: 'TAGS';
    E621: 'E621';
    TOML: 'TOML';
  };
}
