/**
 * Streaming Text Renderer for Real-time Text Animation
 *
 * Provides smooth character-by-character text streaming with configurable
 * speed, pause patterns, and restart capabilities.
 */
import { createSignal, onCleanup } from "solid-js";
const DEFAULT_OPTIONS = {
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
import { calculateCharacterDelay, createInitialState, createTimerManager, } from "./StreamingHelpers";
import { createStreamingControls } from "./StreamingControls";
export function createStreamingText(text, options = {}) {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const [state, setState] = createSignal(createInitialState(text));
    const timers = createTimerManager();
    const streamNext = () => {
        const currentState = state();
        if (currentState.isPaused || currentState.isComplete)
            return;
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
