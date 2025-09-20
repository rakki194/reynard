/**
 * Test setup for audio package
 * Provides mocks and test utilities for audio components
 */
import { vi } from "vitest";
// Mock Web Audio API for testing
global.AudioContext = vi.fn().mockImplementation(() => ({
    createAnalyser: vi.fn().mockReturnValue({
        frequencyBinCount: 1024,
        getByteFrequencyData: vi.fn(),
        getByteTimeDomainData: vi.fn(),
    }),
    createGain: vi.fn().mockReturnValue({
        connect: vi.fn(),
        disconnect: vi.fn(),
        gain: { value: 1 },
    }),
    createOscillator: vi.fn().mockReturnValue({
        connect: vi.fn(),
        disconnect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
        frequency: { value: 440 },
    }),
    createBufferSource: vi.fn().mockReturnValue({
        connect: vi.fn(),
        disconnect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
        buffer: null,
    }),
    decodeAudioData: vi.fn().mockResolvedValue({
        duration: 10,
        sampleRate: 44100,
        numberOfChannels: 2,
    }),
    destination: {
        connect: vi.fn(),
        disconnect: vi.fn(),
    },
    state: "running",
    sampleRate: 44100,
}));
// Mock HTMLAudioElement
global.HTMLAudioElement = vi.fn().mockImplementation(() => ({
    play: vi.fn().mockResolvedValue(undefined),
    pause: vi.fn(),
    load: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    duration: 10,
    currentTime: 0,
    volume: 1,
    muted: false,
    paused: true,
    ended: false,
    readyState: 4,
}));
// Mock console methods to avoid noise in tests
global.console = {
    ...console,
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
};
