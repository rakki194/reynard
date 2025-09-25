/**
 * 🚀 Advanced Animations Composable
 *
 * Advanced animation functions for transformer architecture visualization
 */

import { useTransformerAnimations } from "./useTransformerAnimations";

export const useAdvancedAnimations = (transformerAnimations: ReturnType<typeof useTransformerAnimations>) => {
  /**
   * Creates a full transformer forward pass animation
   */
  const animateForwardPass = () => {
    const encoderElements = [
      "input-embedding",
      "positional-encoding",
      "attention",
      "add-norm-1",
      "feed-forward",
      "add-norm-2",
    ]
      .map(id => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    const decoderElements = [
      "output-embedding",
      "positional-encoding-2",
      "masked-attention",
      "add-norm-5",
      "cross-attention",
      "add-norm-4",
      "feed-forward-2",
      "add-norm-3",
    ]
      .map(id => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    transformerAnimations.animateForwardPass(encoderElements, decoderElements);
  };

  /**
   * Creates a transformer attention visualization
   */
  const createAttentionVisualization = () => {
    const queryElement = document.getElementById("masked-attention");
    const keyElements = ["attention", "cross-attention"]
      .map(id => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];
    const valueElements = ["feed-forward", "feed-forward-2"]
      .map(id => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    if (queryElement) {
      transformerAnimations.createAttentionVisualization(queryElement, keyElements, valueElements);
    }
  };

  return {
    animateForwardPass,
    createAttentionVisualization,
  };
};
