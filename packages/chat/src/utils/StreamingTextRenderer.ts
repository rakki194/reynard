/**
 * Streaming Text Renderer for Real-time Text Animation
 *
 * Provides smooth character-by-character text streaming with configurable
 * speed, pause patterns, and restart capabilities.
 */

import { createSignal, createEffect, onCleanup } from "solid-js";

export interface StreamingTextOptions {
  /** Speed of character rendering in milliseconds */
  speed?: number;
  /** Pause duration at punctuation marks */
  pauseAtPunctuation?: number;
  /** Pause duration at line breaks */
  pauseAtLineBreak?: number;
  /** Whether to restart automatically after completion */
  autoRestart?: boolean;
  /** Delay before restarting */
  restartDelay?: number;
  /** Whether to show cursor during streaming */
  showCursor?: boolean;
  /** Cursor character */
  cursorChar?: string;
  /** Whether to pause at word boundaries */
  pauseAtWords?: boolean;
  /** Word pause duration */
  wordPause?: number;
}

export interface StreamingTextState {
  /** Current displayed text */
  currentText: string;
  /** Whether streaming is active */
  isStreaming: boolean;
  /** Whether streaming is paused */
  isPaused: boolean;
  /** Whether streaming is complete */
  isComplete: boolean;
  /** Current character index */
  currentIndex: number;
  /** Total characters to stream */
  totalCharacters: number;
  /** Progress percentage (0-100) */
  progress: number;
}

const DEFAULT_OPTIONS: Required<StreamingTextOptions> = {
  speed: 30,
  pauseAtPunctuation: 200,
  pauseAtLineBreak: 500,
  autoRestart: false,
  restartDelay: 2000,
  showCursor: true,
  cursorChar: "|",
  pauseAtWords: false,
  wordPause: 50,
};

export function createStreamingText(
  text: string,
  options: StreamingTextOptions = {},
) {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const [state, setState] = createSignal<StreamingTextState>({
    currentText: "",
    isStreaming: false,
    isPaused: false,
    isComplete: false,
    currentIndex: 0,
    totalCharacters: text.length,
    progress: 0,
  });

  let streamTimer: number | null = null;
  let restartTimer: number | null = null;

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
    if (streamTimer) {
      clearTimeout(streamTimer);
      streamTimer = null;
    }
    setState((prev) => ({ ...prev, isPaused: true }));
  };

  const resume = () => {
    if (state().isPaused && !state().isComplete) {
      setState((prev) => ({ ...prev, isPaused: false }));
      streamNext();
    }
  };

  const stop = () => {
    if (streamTimer) {
      clearTimeout(streamTimer);
      streamTimer = null;
    }
    if (restartTimer) {
      clearTimeout(restartTimer);
      restartTimer = null;
    }
    setState((prev) => ({
      ...prev,
      isStreaming: false,
      isPaused: false,
      isComplete: false,
      currentIndex: 0,
      currentText: "",
      progress: 0,
    }));
  };

  const restart = () => {
    stop();
    setTimeout(() => start(), 100);
  };

  const streamNext = () => {
    const currentState = state();
    if (currentState.isPaused || currentState.isComplete) return;

    if (currentState.currentIndex >= text.length) {
      // Streaming complete
      setState((prev) => ({
        ...prev,
        isStreaming: false,
        isComplete: true,
        progress: 100,
      }));

      if (opts.autoRestart) {
        restartTimer = window.setTimeout(() => {
          restart();
        }, opts.restartDelay);
      }
      return;
    }

    const char = text[currentState.currentIndex];
    const nextText = currentState.currentText + char;
    const nextIndex = currentState.currentIndex + 1;
    const progress = (nextIndex / text.length) * 100;

    setState((prev) => ({
      ...prev,
      currentText: nextText,
      currentIndex: nextIndex,
      progress,
    }));

    // Calculate delay for next character
    let delay = opts.speed;

    // Pause at punctuation
    if (/[.!?;:]/.test(char)) {
      delay += opts.pauseAtPunctuation;
    }
    // Pause at line breaks
    else if (char === "\n") {
      delay += opts.pauseAtLineBreak;
    }
    // Pause at word boundaries
    else if (opts.pauseAtWords && char === " ") {
      delay += opts.wordPause;
    }

    streamTimer = window.setTimeout(() => {
      streamNext();
    }, delay);
  };

  // Cleanup on unmount
  onCleanup(() => {
    if (streamTimer) clearTimeout(streamTimer);
    if (restartTimer) clearTimeout(restartTimer);
  });

  return {
    state,
    start,
    pause,
    resume,
    stop,
    restart,
  };
}

/**
 * Hook for streaming multiple text sequences with different configurations
 */
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

/**
 * Utility for creating markdown streaming with syntax highlighting
 */
export function createMarkdownStreaming(
  markdownText: string,
  options: StreamingTextOptions = {},
) {
  const stream = createStreamingText(markdownText, options);

  // Enhanced state that includes parsed markdown
  const [parsedContent, setParsedContent] = createSignal("");

  createEffect(() => {
    const currentText = stream.state().currentText;
    if (currentText) {
      // Basic markdown parsing for streaming display
      const parsed = currentText
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.*?)\*/g, "<em>$1</em>")
        .replace(/`(.*?)`/g, "<code>$1</code>")
        .replace(/^### (.*$)/gm, "<h3>$1</h3>")
        .replace(/^## (.*$)/gm, "<h2>$1</h2>")
        .replace(/^# (.*$)/gm, "<h1>$1</h1>")
        .replace(/^- (.*$)/gm, "<li>$1</li>")
        .replace(/\n/g, "<br>");

      setParsedContent(parsed);
    }
  });

  return {
    ...stream,
    parsedContent,
  };
}
