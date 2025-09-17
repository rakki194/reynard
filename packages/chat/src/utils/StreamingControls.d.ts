/**
 * Streaming Controls Utilities
 *
 * Contains control functions for managing streaming text state
 */
import { StreamingTextState, StreamingTextOptions } from "./StreamingTextRenderer";
import { createTimerManager } from "./StreamingHelpers";
export declare function createStreamingControls(text: string, opts: Required<StreamingTextOptions>, state: () => StreamingTextState, setState: (fn: (prev: StreamingTextState) => StreamingTextState) => void, timers: ReturnType<typeof createTimerManager>, streamNext: () => void): {
    start: () => void;
    pause: () => void;
    resume: () => void;
    stop: () => void;
    restart: () => void;
};
