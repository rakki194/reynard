/**
 * Streaming Text Helper Functions
 *
 * Contains utility functions for streaming text operations
 */
export function calculateCharacterDelay(char, options) {
    let delay = options.speed;
    if (/[.!?;:]/.test(char)) {
        delay += options.pauseAtPunctuation;
    }
    else if (char === "\n") {
        delay += options.pauseAtLineBreak;
    }
    else if (options.pauseAtWords && char === " ") {
        delay += options.wordPause;
    }
    return delay;
}
export function createInitialState(text) {
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
    let streamTimer = null;
    let restartTimer = null;
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
    const setStreamTimer = (callback, delay) => {
        streamTimer = window.setTimeout(callback, delay);
    };
    const setRestartTimer = (callback, delay) => {
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
