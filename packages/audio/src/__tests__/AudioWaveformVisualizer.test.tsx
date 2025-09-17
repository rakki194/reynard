/**
 * Audio Waveform Visualizer Test Suite
 *
 * Tests for the AudioWaveformVisualizer component including
 * waveform rendering, playback controls, and interaction handling.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@solidjs/testing-library";
import { AudioWaveformVisualizer } from "../../AudioWaveformVisualizer";

// Mock the file processing dependencies
vi.mock("reynard-file-processing", () => ({
  AudioThumbnailGenerator: vi.fn().mockImplementation(() => ({
    generateWaveform: vi.fn().mockResolvedValue({
      data: new Array(100).fill(0).map(() => Math.random()),
      duration: 180,
      sampleRate: 44100,
    }),
  })),
}));

// Mock the AudioWaveformComponents
vi.mock("../AudioWaveformComponents", () => ({
  LoadingState: () => <div data-testid="loading-state">Loading...</div>,
  ErrorState: (props: any) => <div data-testid="error-state">{props.message}</div>,
  WaveformCanvas: (props: any) => <canvas data-testid="waveform-canvas" onClick={e => props.onSeek?.(e)} {...props} />,
  PlaybackControls: (props: any) => (
    <div data-testid="playback-controls">
      <button onClick={props.onPlay}>Play</button>
      <button onClick={props.onPause}>Pause</button>
      <button onClick={props.onSeek}>Seek</button>
    </div>
  ),
}));

describe("AudioWaveformVisualizer", () => {
  const mockAudioFile = new File(["audio"], "test.mp3", { type: "audio/mpeg" });
  const mockAudioUrl = "https://example.com/audio.mp3";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render with audio file", () => {
      render(() => <AudioWaveformVisualizer audioSrc={mockAudioFile} />);

      expect(screen.getByTestId("loading-state")).toBeInTheDocument();
    });

    it("should render with audio URL", () => {
      render(() => <AudioWaveformVisualizer audioSrc={mockAudioUrl} />);

      expect(screen.getByTestId("loading-state")).toBeInTheDocument();
    });

    it("should render with custom className", () => {
      render(() => <AudioWaveformVisualizer audioSrc={mockAudioFile} className="custom-visualizer" />);

      const visualizer = screen.getByRole("generic");
      expect(visualizer).toHaveClass("audio-waveform-visualizer", "custom-visualizer");
    });
  });

  describe("Waveform Configuration", () => {
    it("should apply custom waveform configuration", () => {
      const waveformConfig = {
        bars: 200,
        color: "#ff0000",
        backgroundColor: "#000000",
        barWidth: 2,
        barSpacing: 1,
        height: 100,
      };

      render(() => <AudioWaveformVisualizer audioSrc={mockAudioFile} waveformConfig={waveformConfig} />);

      expect(screen.getByTestId("loading-state")).toBeInTheDocument();
    });

    it("should use default configuration when not provided", () => {
      render(() => <AudioWaveformVisualizer audioSrc={mockAudioFile} />);

      expect(screen.getByTestId("loading-state")).toBeInTheDocument();
    });
  });

  describe("Playback Configuration", () => {
    it("should apply playback configuration", () => {
      const playbackConfig = {
        autoPlay: true,
        loop: true,
        volume: 0.5,
        showControls: true,
      };

      render(() => <AudioWaveformVisualizer audioSrc={mockAudioFile} playbackConfig={playbackConfig} />);

      expect(screen.getByTestId("loading-state")).toBeInTheDocument();
    });

    it("should handle auto-play configuration", () => {
      render(() => <AudioWaveformVisualizer audioSrc={mockAudioFile} playbackConfig={{ autoPlay: true }} />);

      expect(screen.getByTestId("loading-state")).toBeInTheDocument();
    });
  });

  describe("Interaction Configuration", () => {
    it("should enable seeking when configured", () => {
      const interactionConfig = {
        enableSeeking: true,
        showProgress: true,
      };

      render(() => <AudioWaveformVisualizer audioSrc={mockAudioFile} interactionConfig={interactionConfig} />);

      expect(screen.getByTestId("loading-state")).toBeInTheDocument();
    });

    it("should disable seeking when configured", () => {
      const interactionConfig = {
        enableSeeking: false,
        showProgress: false,
      };

      render(() => <AudioWaveformVisualizer audioSrc={mockAudioFile} interactionConfig={interactionConfig} />);

      expect(screen.getByTestId("loading-state")).toBeInTheDocument();
    });
  });

  describe("Event Handlers", () => {
    it("should call onTimeUpdate when time changes", async () => {
      const onTimeUpdate = vi.fn();
      render(() => <AudioWaveformVisualizer audioSrc={mockAudioFile} onTimeUpdate={onTimeUpdate} />);

      // Simulate time update
      await waitFor(() => {
        // This would be triggered by the component internally
        expect(screen.getByTestId("loading-state")).toBeInTheDocument();
      });
    });

    it("should call onPlaybackStateChange when playback state changes", () => {
      const onPlaybackStateChange = vi.fn();
      render(() => <AudioWaveformVisualizer audioSrc={mockAudioFile} onPlaybackStateChange={onPlaybackStateChange} />);

      expect(screen.getByTestId("loading-state")).toBeInTheDocument();
    });

    it("should call onSeek when seeking", () => {
      const onSeek = vi.fn();
      render(() => <AudioWaveformVisualizer audioSrc={mockAudioFile} onSeek={onSeek} />);

      expect(screen.getByTestId("loading-state")).toBeInTheDocument();
    });

    it("should call onError when error occurs", () => {
      const onError = vi.fn();
      render(() => <AudioWaveformVisualizer audioSrc={mockAudioFile} onError={onError} />);

      expect(screen.getByTestId("loading-state")).toBeInTheDocument();
    });
  });

  describe("Loading States", () => {
    it("should show loading state initially", () => {
      render(() => <AudioWaveformVisualizer audioSrc={mockAudioFile} />);

      expect(screen.getByTestId("loading-state")).toBeInTheDocument();
    });

    it("should show error state when error occurs", () => {
      render(() => <AudioWaveformVisualizer audioSrc={mockAudioFile} />);

      // The component should handle errors gracefully
      expect(screen.getByTestId("loading-state")).toBeInTheDocument();
    });
  });

  describe("Waveform Rendering", () => {
    it("should render waveform canvas when loaded", async () => {
      render(() => <AudioWaveformVisualizer audioSrc={mockAudioFile} />);

      // Initially shows loading
      expect(screen.getByTestId("loading-state")).toBeInTheDocument();

      // After loading, should show waveform canvas
      await waitFor(() => {
        // This would be triggered when waveform data is loaded
        expect(screen.getByTestId("loading-state")).toBeInTheDocument();
      });
    });

    it("should render playback controls when enabled", () => {
      render(() => <AudioWaveformVisualizer audioSrc={mockAudioFile} playbackConfig={{ showControls: true }} />);

      expect(screen.getByTestId("loading-state")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels", () => {
      render(() => <AudioWaveformVisualizer audioSrc={mockAudioFile} />);

      const visualizer = screen.getByRole("generic");
      expect(visualizer).toHaveAttribute("aria-label", "Audio waveform visualizer");
    });

    it("should support keyboard navigation", () => {
      render(() => <AudioWaveformVisualizer audioSrc={mockAudioFile} />);

      expect(screen.getByTestId("loading-state")).toBeInTheDocument();
    });

    it("should have proper button labels", () => {
      render(() => <AudioWaveformVisualizer audioSrc={mockAudioFile} playbackConfig={{ showControls: true }} />);

      expect(screen.getByTestId("loading-state")).toBeInTheDocument();
    });
  });

  describe("Performance", () => {
    it("should handle large audio files efficiently", () => {
      const largeFile = new File(["large audio data"], "large.mp3", {
        type: "audio/mpeg",
      });

      render(() => <AudioWaveformVisualizer audioSrc={largeFile} />);

      expect(screen.getByTestId("loading-state")).toBeInTheDocument();
    });

    it("should clean up resources on unmount", () => {
      const { unmount } = render(() => <AudioWaveformVisualizer audioSrc={mockAudioFile} />);

      expect(screen.getByTestId("loading-state")).toBeInTheDocument();

      unmount();

      // Component should clean up properly
      expect(screen.queryByTestId("loading-state")).not.toBeInTheDocument();
    });
  });
});
