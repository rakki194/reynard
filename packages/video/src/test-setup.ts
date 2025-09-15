/**
 * Test setup for video package
 * Provides mocks and test utilities for video components
 */

import { vi } from "vitest";

// Mock HTMLVideoElement
global.HTMLVideoElement = vi.fn().mockImplementation(() => ({
  play: vi.fn().mockResolvedValue(undefined),
  pause: vi.fn(),
  load: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  duration: 120,
  currentTime: 0,
  volume: 1,
  muted: false,
  paused: true,
  ended: false,
  readyState: 4,
  videoWidth: 1920,
  videoHeight: 1080,
  buffered: {
    length: 1,
    start: vi.fn().mockReturnValue(0),
    end: vi.fn().mockReturnValue(120),
  },
  seekable: {
    length: 1,
    start: vi.fn().mockReturnValue(0),
    end: vi.fn().mockReturnValue(120),
  },
  networkState: 1,
  preload: "metadata",
  poster: "",
  src: "",
  currentSrc: "",
  crossOrigin: null,
  controls: false,
  autoplay: false,
  loop: false,
  defaultMuted: false,
  defaultPlaybackRate: 1,
  playbackRate: 1,
  preservesPitch: true,
  disablePictureInPicture: false,
  pictureInPictureEnabled: false,
  requestPictureInPicture: vi.fn().mockResolvedValue(undefined),
  exitPictureInPicture: vi.fn().mockResolvedValue(undefined),
  captureStream: vi.fn().mockReturnValue(new MediaStream()),
  canPlayType: vi.fn().mockReturnValue("probably"),
  load: vi.fn(),
  canPlayType: vi.fn().mockReturnValue("probably"),
}));

// Mock MediaRecorder
global.MediaRecorder = vi.fn().mockImplementation(() => ({
  start: vi.fn(),
  stop: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  requestData: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  state: "inactive",
  mimeType: "video/webm",
  videoBitsPerSecond: 2500000,
  audioBitsPerSecond: 128000,
  stream: new MediaStream(),
}));

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn().mockReturnValue("blob:mock-url");

// Mock URL.revokeObjectURL
global.URL.revokeObjectURL = vi.fn();

// Mock console methods to avoid noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
};
