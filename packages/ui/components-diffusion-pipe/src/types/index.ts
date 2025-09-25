/**
 * 🦊 Diffusion-Pipe Components Types
 *
 * Type definitions for diffusion-pipe UI components
 */

export interface DiffusionPipeDashboardProps {
  class?: string;
  style?: string;
  initialTab?: string;
  onTrainingStart?: (config: any) => void;
  onTrainingStop?: (trainingId: string) => void;
  onConfigSave?: (config: any) => void;
}

export interface TrainingCardProps {
  training: any;
  onSelect?: (id: string) => void;
  onStop?: (id: string) => void;
  onResume?: (id: string) => void;
}

export interface ConfigBuilderProps {
  onConfigChange?: (config: any) => void;
  onConfigSave?: (config: any) => void;
  onConfigValidate?: (config: any) => Promise<boolean>;
}

export interface ChromaTrainingWizardProps {
  onConfigComplete?: (config: any) => void;
  onStepChange?: (step: string) => void;
}
