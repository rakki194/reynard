/**
 * Temporary type declarations for reynard-annotating-core
 * This will be removed once the proper package is built
 */

declare module 'reynard-annotating-core' {
  import type { CaptionTask } from 'reynard-ai-shared';

  export interface BackendAnnotationService {
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
  }

  export interface BackendAnnotationServiceConfig {
    name: string;
    config: Record<string, any>;
  }

  export interface AISharedBackendAnnotationService extends BackendAnnotationService {
    name: string;
    status: string;
    startupTime: Date;
    stop(): Promise<void>;
    generateCaption(task: CaptionTask): Promise<any>;
    generateBatchCaptions(tasks: CaptionTask[], progressCallback?: (progress: any) => void): Promise<any>;
    isGeneratorAvailable(generatorName: string): boolean;
  }

  export function getAnnotationServiceRegistry(): any;
  export function createDefaultAnnotationService(backendUrl: string, serviceName: string): any;
}
