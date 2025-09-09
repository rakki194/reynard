/**
 * Type definitions for Image Caption App
 */

export interface ImageItem {
  id: string;
  name: string;
  url: string;
  file: File;
  caption?: string;
  tags?: string[];
  generatedAt?: Date;
  model?: string;
}

export interface CaptionWorkflow {
  image: ImageItem;
  generatedCaption: string;
  editedCaption: string;
  tags: string[];
  isGenerating: boolean;
  isEditing: boolean;
}

export interface CaptionTask {
  imagePath: string;
  generatorName: string;
  config: Record<string, any>;
  postProcess: boolean;
  priority: number;
}

export interface CaptionResult {
  success: boolean;
  caption?: string;
  error?: string;
  processingTime?: number;
  image_path?: string;
}

export interface SystemStatistics {
  totalGenerators: number;
  loadedModels: number;
  isHealthy: boolean;
  queueStatus: any;
  totalProcessed: number;
  activeTasks: number;
}

export interface BatchProgress {
  total: number;
  completed: number;
  progress: number;
  current?: string;
}
