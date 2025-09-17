/**
 * Streaming Text Renderer for Real-time Text Animation
 *
 * Provides smooth character-by-character text streaming with configurable
 * speed, pause patterns, and restart capabilities.
 */
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
export declare function createStreamingText(text: string, options?: StreamingTextOptions): {
    start: () => void;
    pause: () => void;
    resume: () => void;
    stop: () => void;
    restart: () => void;
    state: import("solid-js").Accessor<StreamingTextState>;
};
