/**
 * Streaming Text Helper Functions
 *
 * Contains utility functions for streaming text operations
 */

import {
  StreamingTextOptions,
  StreamingTextState,
} from "./StreamingTextRenderer";

export function calculateCharacterDelay(
  char: string,
  options: Required<StreamingTextOptions>,
): number {
  let delay = options.speed;

  if (/[.!?;:]/.test(char)) {
    delay += options.pauseAtPunctuation;
  } else if (char === "\n") {
    delay += options.pauseAtLineBreak;
  } else if (options.pauseAtWords && char === " ") {
    delay += options.wordPause;
  }

  return delay;
}

export function createInitialState(text: string): StreamingTextState {
  return {
    currentText: "",
    isStreaming: false,
    isPaused: false,
    isComplete: false,
    currentIndex: 0,
    totalCharacters: text.length,
    progress: 0,
  };
}

export function createTimerManager() {
  let streamTimer: number | null = null;
  let restartTimer: number | null = null;

  const clearStreamTimer = () => {
    if (streamTimer) {
      clearTimeout(streamTimer);
      streamTimer = null;
    }
  };

  const clearRestartTimer = () => {
    if (restartTimer) {
      clearTimeout(restartTimer);
      restartTimer = null;
    }
  };

  const setStreamTimer = (callback: () => void, delay: number) => {
    streamTimer = window.setTimeout(callback, delay);
  };

  const setRestartTimer = (callback: () => void, delay: number) => {
    restartTimer = window.setTimeout(callback, delay);
  };

  const cleanup = () => {
    clearStreamTimer();
    clearRestartTimer();
  };

  return {
    clearStreamTimer,
    clearRestartTimer,
    setStreamTimer,
    setRestartTimer,
    cleanup,
  };
}
