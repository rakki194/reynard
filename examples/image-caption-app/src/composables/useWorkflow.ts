/**
 * Workflow management composable for caption editing
 */

import { createSignal, type Accessor, type Setter } from "solid-js";
import type { ImageItem, CaptionWorkflow } from "../types";

export interface UseWorkflowReturn {
  workflow: Accessor<CaptionWorkflow | null>;
  setWorkflow: Setter<CaptionWorkflow | null>;
  startWorkflow: (image: ImageItem, isGenerating?: boolean) => void;
  updateWorkflow: (updates: Partial<CaptionWorkflow>) => void;
  clearWorkflow: () => void;
  isWorkflowActive: Accessor<boolean>;
}

/**
 * Composable for managing caption workflow state
 */
export function useWorkflow(): UseWorkflowReturn {
  const [workflow, setWorkflow] = createSignal<CaptionWorkflow | null>(null);

  const startWorkflow = (image: ImageItem, isGenerating = false) => {
    setWorkflow({
      image,
      generatedCaption: "",
      editedCaption: "",
      tags: [],
      isGenerating,
      isEditing: !isGenerating,
    });
  };

  const updateWorkflow = (updates: Partial<CaptionWorkflow>) => {
    setWorkflow(prev => (prev ? { ...prev, ...updates } : null));
  };

  const clearWorkflow = () => {
    setWorkflow(null);
  };

  const isWorkflowActive = () => workflow() !== null;

  return {
    workflow,
    setWorkflow,
    startWorkflow,
    updateWorkflow,
    clearWorkflow,
    isWorkflowActive,
  };
}
