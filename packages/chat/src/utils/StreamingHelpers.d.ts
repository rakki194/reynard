/**
 * Streaming Text Helper Functions
 *
 * Contains utility functions for streaming text operations
 */
import { StreamingTextOptions, StreamingTextState } from "./StreamingTextRenderer";
export declare function calculateCharacterDelay(char: string, options: Required<StreamingTextOptions>): number;
export declare function createInitialState(text: string): StreamingTextState;
export declare function createTimerManager(): {
    clearStreamTimer: () => void;
    clearRestartTimer: () => void;
    setStreamTimer: (callback: () => void, delay: number) => void;
    setRestartTimer: (callback: () => void, delay: number) => void;
    cleanup: () => void;
};
