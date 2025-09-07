/**
 * Streaming Text Renderer for Real-time Text Animation
 *
 * Provides smooth character-by-character text streaming with configurable
 * speed, pause patterns, and restart capabilities.
 */

import { createSignal, onCleanup } from "solid-js";

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

import { 
  calculateCharacterDelay, 
  createInitialState, 
  createTimerManager 
} from "./StreamingHelpers";
import { createStreamingControls } from "./StreamingControls";

export function createStreamingText(
  text: string,
  options: StreamingTextOptions = {},
) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const [state, setState] = createSignal<StreamingTextState>(createInitialState(text));
  const timers = createTimerManager();

  const streamNext = () => {
    const currentState = state();
    if (currentState.isPaused || currentState.isComplete) return;

    if (currentState.currentIndex >= text.length) {
      handleStreamingComplete();
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

    const delay = calculateCharacterDelay(char, opts);
    timers.setStreamTimer(streamNext, delay);
  };

  const handleStreamingComplete = () => {
    setState((prev) => ({
      ...prev,
      isStreaming: false,
      isComplete: true,
      progress: 100,
    }));

    if (opts.autoRestart) {
      timers.setRestartTimer(restart, opts.restartDelay);
    }
  };

  const controls = createStreamingControls(text, opts, state, setState, timers, streamNext);
  const { restart } = controls;

  onCleanup(timers.cleanup);

  return { state, ...controls };
}

