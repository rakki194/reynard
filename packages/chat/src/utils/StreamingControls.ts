/**
 * Streaming Controls Utilities
 *
 * Contains control functions for managing streaming text state
 */

import {
  StreamingTextState,
  StreamingTextOptions,
} from "./StreamingTextRenderer";
import { createInitialState, createTimerManager } from "./StreamingHelpers";

export function createStreamingControls(
  text: string,
  opts: Required<StreamingTextOptions>,
  state: () => StreamingTextState,
  setState: (fn: (prev: StreamingTextState) => StreamingTextState) => void,
  timers: ReturnType<typeof createTimerManager>,
  streamNext: () => void,
) {
  const start = () => {
    if (state().isStreaming) return;
    setState((prev) => ({
      ...prev,
      isStreaming: true,
      isPaused: false,
      isComplete: false,
      currentIndex: 0,
      currentText: "",
      progress: 0,
    }));
    streamNext();
  };

  const pause = () => {
    timers.clearStreamTimer();
    setState((prev) => ({ ...prev, isPaused: true }));
  };

  const resume = () => {
    if (state().isPaused && !state().isComplete) {
      setState((prev) => ({ ...prev, isPaused: false }));
      streamNext();
    }
  };

  const stop = () => {
    timers.cleanup();
    setState(() => createInitialState(text));
  };

  const restart = () => {
    stop();
    setTimeout(() => start(), 100);
  };

  return { start, pause, resume, stop, restart };
}
