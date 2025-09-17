/**
 * Streaming Sequence Utilities
 *
 * Provides functionality for managing multiple streaming text sequences
 * with different configurations.
 */
import { StreamingTextOptions } from "./StreamingTextRenderer";
export declare function createStreamingSequence(sequences: Array<{
    text: string;
    options?: StreamingTextOptions;
}>): {
    currentSequence: import("solid-js").Accessor<number>;
    isActive: import("solid-js").Accessor<boolean>;
    currentStream: {
        start: () => void;
        pause: () => void;
        resume: () => void;
        stop: () => void;
        restart: () => void;
        state: import("solid-js").Accessor<import("./StreamingTextRenderer").StreamingTextState>;
    };
    start: () => void;
    next: () => void;
    previous: () => void;
    reset: () => void;
};
