/**
 * Streaming Sequence Utilities
 *
 * Provides functionality for managing multiple streaming text sequences
 * with different configurations.
 */

import { createSignal } from "solid-js";
import {
  createStreamingText,
  StreamingTextOptions,
} from "./StreamingTextRenderer";

export function createStreamingSequence(
  sequences: Array<{ text: string; options?: StreamingTextOptions }>,
) {
  const [currentSequence, setCurrentSequence] = createSignal(0);
  const [isActive, setIsActive] = createSignal(false);

  const currentStream = createStreamingText(
    sequences[currentSequence()]?.text || "",
    sequences[currentSequence()]?.options || {},
  );

  const start = () => {
    setIsActive(true);
    currentStream.start();
  };

  const next = () => {
    const nextIndex = currentSequence() + 1;
    if (nextIndex < sequences.length) {
      setCurrentSequence(nextIndex);
      currentStream.restart();
    } else {
      setIsActive(false);
    }
  };

  const previous = () => {
    const prevIndex = currentSequence() - 1;
    if (prevIndex >= 0) {
      setCurrentSequence(prevIndex);
      currentStream.restart();
    }
  };

  const reset = () => {
    setCurrentSequence(0);
    setIsActive(false);
    currentStream.stop();
  };

  return {
    currentSequence,
    isActive,
    currentStream,
    start,
    next,
    previous,
    reset,
  };
}
