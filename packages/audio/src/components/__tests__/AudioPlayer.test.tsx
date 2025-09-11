/**
 * Audio Player Component Test Suite
 * 
 * Comprehensive tests for the AudioPlayer component including
 * playback controls, playlist management, and keyboard shortcuts.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@solidjs/testing-library";
import { AudioPlayer } from "../AudioPlayer";

// Mock the AudioWaveformVisualizer component
vi.mock("../AudioWaveformVisualizer", () => ({
  AudioWaveformVisualizer: (props: any) => (
    <div data-testid="audio-waveform-visualizer" {...props} />
  ),
}));

// Mock URL.createObjectURL
const mockCreateObjectURL = vi.fn();
Object.defineProperty(URL, "createObjectURL", {
  value: mockCreateObjectURL,
  writable: true,
});

// Mock HTMLAudioElement
const mockAudioElement = {
  play: vi.fn(),
  pause: vi.fn(),
  load: vi.fn(),
  currentTime: 0,
  duration: 0,
  volume: 1,
  loop: false,
  preload: "metadata",
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
};

describe("AudioPlayer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateObjectURL.mockReturnValue("blob:mock-url");
    
    // Mock HTMLAudioElement constructor
    global.HTMLAudioElement = vi.fn(() => mockAudioElement) as any;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const mockAudioFiles = [
    new File(["audio1"], "song1.mp3", { type: "audio/mpeg" }),
    new File(["audio2"], "song2.wav", { type: "audio/wav" }),
    "https://example.com/audio3.mp3",
  ];

  describe("Rendering", () => {
    it("should render with audio files", () => {
      render(() => <AudioPlayer audioFiles={mockAudioFiles} />);
      
      expect(screen.getByText("song1.mp3")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /play\/pause/i })).toBeInTheDocument();
    });

    it("should render with custom className", () => {
      render(() => <AudioPlayer audioFiles={mockAudioFiles} className="custom-player" />);
      
      const player = screen.getByRole("generic");
      expect(player).toHaveClass("audio-player", "custom-player");
    });

    it("should show playlist when multiple files provided", () => {
      render(() => <AudioPlayer audioFiles={mockAudioFiles} />);
      
      expect(screen.getByText("Playlist")).toBeInTheDocument();
      expect(screen.getByText("song1.mp3")).toBeInTheDocument();
      expect(screen.getByText("song2.wav")).toBeInTheDocument();
    });

    it("should not show playlist when single file provided", () => {
      render(() => <AudioPlayer audioFiles={[mockAudioFiles[0]]} />);
      
      expect(screen.queryByText("Playlist")).not.toBeInTheDocument();
    });
  });

  describe("Playback Controls", () => {
    it("should toggle playback when play button is clicked", async () => {
      render(() => <AudioPlayer audioFiles={mockAudioFiles} />);
      
      const playButton = screen.getByRole("button", { name: /play\/pause/i });
      fireEvent.click(playButton);
      
      expect(mockAudioElement.play).toHaveBeenCalled();
    });

    it("should navigate to next track", () => {
      render(() => <AudioPlayer audioFiles={mockAudioFiles} />);
      
      const nextButton = screen.getByRole("button", { name: /next/i });
      fireEvent.click(nextButton);
      
      expect(screen.getByText("song2.wav")).toBeInTheDocument();
    });

    it("should navigate to previous track", () => {
      render(() => <AudioPlayer audioFiles={mockAudioFiles} initialTrack={1} />);
      
      const prevButton = screen.getByRole("button", { name: /previous/i });
      fireEvent.click(prevButton);
      
      expect(screen.getByText("song1.mp3")).toBeInTheDocument();
    });

    it("should disable previous button on first track", () => {
      render(() => <AudioPlayer audioFiles={mockAudioFiles} initialTrack={0} />);
      
      const prevButton = screen.getByRole("button", { name: /previous/i });
      expect(prevButton).toBeDisabled();
    });

    it("should disable next button on last track", () => {
      render(() => <AudioPlayer audioFiles={mockAudioFiles} initialTrack={2} />);
      
      const nextButton = screen.getByRole("button", { name: /next/i });
      expect(nextButton).toBeDisabled();
    });
  });

  describe("Volume Control", () => {
    it("should update volume when slider is moved", () => {
      render(() => <AudioPlayer audioFiles={mockAudioFiles} />);
      
      const volumeSlider = screen.getByRole("slider");
      fireEvent.input(volumeSlider, { target: { value: "0.5" } });
      
      expect(mockAudioElement.volume).toBe(0.5);
    });

    it("should clamp volume to valid range", () => {
      render(() => <AudioPlayer audioFiles={mockAudioFiles} />);
      
      const volumeSlider = screen.getByRole("slider");
      fireEvent.input(volumeSlider, { target: { value: "1.5" } });
      
      expect(mockAudioElement.volume).toBe(1);
    });
  });

  describe("Shuffle Functionality", () => {
    it("should toggle shuffle when shuffle button is clicked", () => {
      render(() => <AudioPlayer audioFiles={mockAudioFiles} />);
      
      const shuffleButton = screen.getByRole("button", { name: /shuffle/i });
      fireEvent.click(shuffleButton);
      
      expect(shuffleButton).toHaveClass("active");
    });

    it("should enable shuffle from config", () => {
      render(() => 
        <AudioPlayer 
          audioFiles={mockAudioFiles} 
          playerConfig={{ shuffle: true }} 
        />
      );
      
      const shuffleButton = screen.getByRole("button", { name: /shuffle/i });
      expect(shuffleButton).toHaveClass("active");
    });
  });

  describe("Playlist Management", () => {
    it("should select track when playlist item is clicked", () => {
      render(() => <AudioPlayer audioFiles={mockAudioFiles} />);
      
      const playlistItems = screen.getAllByRole("generic");
      const secondTrack = playlistItems.find(item => 
        item.textContent?.includes("song2.wav")
      );
      
      if (secondTrack) {
        fireEvent.click(secondTrack);
        expect(secondTrack).toHaveClass("playlist-item--selected");
      }
    });

    it("should show playing indicator for current track", () => {
      render(() => <AudioPlayer audioFiles={mockAudioFiles} />);
      
      // Start playing
      const playButton = screen.getByRole("button", { name: /play\/pause/i });
      fireEvent.click(playButton);
      
      // Simulate play event
      mockAudioElement.dispatchEvent(new Event("play"));
      
      // Check for playing indicator
      expect(screen.getByText("♪")).toBeInTheDocument();
    });
  });

  describe("Configuration", () => {
    it("should respect autoPlayNext configuration", () => {
      const onPlaylistEnd = vi.fn();
      render(() => 
        <AudioPlayer 
          audioFiles={mockAudioFiles} 
          playerConfig={{ autoPlayNext: false }}
          onPlaylistEnd={onPlaylistEnd}
        />
      );
      
      // Navigate to last track
      const nextButton = screen.getByRole("button", { name: /next/i });
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);
      
      // Try to go to next (should trigger onPlaylistEnd)
      fireEvent.click(nextButton);
      
      expect(onPlaylistEnd).toHaveBeenCalled();
    });

    it("should respect loopPlaylist configuration", () => {
      render(() => 
        <AudioPlayer 
          audioFiles={mockAudioFiles} 
          playerConfig={{ loopPlaylist: true }}
        />
      );
      
      // Navigate to last track
      const nextButton = screen.getByRole("button", { name: /next/i });
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);
      
      // Next button should not be disabled with loop enabled
      expect(nextButton).not.toBeDisabled();
    });

    it("should respect showWaveform configuration", () => {
      render(() => 
        <AudioPlayer 
          audioFiles={mockAudioFiles} 
          playerConfig={{ showWaveform: false }}
        />
      );
      
      expect(screen.queryByTestId("audio-waveform-visualizer")).not.toBeInTheDocument();
    });

    it("should respect showPlaylist configuration", () => {
      render(() => 
        <AudioPlayer 
          audioFiles={mockAudioFiles} 
          playerConfig={{ showPlaylist: false }}
        />
      );
      
      expect(screen.queryByText("Playlist")).not.toBeInTheDocument();
    });
  });

  describe("Callbacks", () => {
    it("should call onTrackChange when track changes", () => {
      const onTrackChange = vi.fn();
      render(() => 
        <AudioPlayer 
          audioFiles={mockAudioFiles} 
          onTrackChange={onTrackChange}
        />
      );
      
      const nextButton = screen.getByRole("button", { name: /next/i });
      fireEvent.click(nextButton);
      
      expect(onTrackChange).toHaveBeenCalledWith(1, mockAudioFiles[1]);
    });

    it("should call onPlaybackStateChange when playback state changes", () => {
      const onPlaybackStateChange = vi.fn();
      render(() => 
        <AudioPlayer 
          audioFiles={mockAudioFiles} 
          onPlaybackStateChange={onPlaybackStateChange}
        />
      );
      
      const playButton = screen.getByRole("button", { name: /play\/pause/i });
      fireEvent.click(playButton);
      
      // Simulate play event
      mockAudioElement.dispatchEvent(new Event("play"));
      
      expect(onPlaybackStateChange).toHaveBeenCalledWith(true);
    });
  });

  describe("Keyboard Shortcuts", () => {
    it("should handle space key for play/pause", () => {
      render(() => <AudioPlayer audioFiles={mockAudioFiles} />);
      
      fireEvent.keyDown(document, { code: "Space" });
      
      expect(mockAudioElement.play).toHaveBeenCalled();
    });

    it("should handle arrow keys for seeking", () => {
      render(() => <AudioPlayer audioFiles={mockAudioFiles} />);
      
      fireEvent.keyDown(document, { code: "ArrowRight" });
      expect(mockAudioElement.currentTime).toBe(10);
      
      fireEvent.keyDown(document, { code: "ArrowLeft" });
      expect(mockAudioElement.currentTime).toBe(0);
    });

    it("should handle volume keys", () => {
      render(() => <AudioPlayer audioFiles={mockAudioFiles} />);
      
      fireEvent.keyDown(document, { code: "ArrowUp" });
      expect(mockAudioElement.volume).toBe(0.9);
      
      fireEvent.keyDown(document, { code: "ArrowDown" });
      expect(mockAudioElement.volume).toBe(0.8);
    });

    it("should handle track navigation keys", () => {
      render(() => <AudioPlayer audioFiles={mockAudioFiles} />);
      
      fireEvent.keyDown(document, { code: "KeyN" });
      expect(screen.getByText("song2.wav")).toBeInTheDocument();
      
      fireEvent.keyDown(document, { code: "KeyP" });
      expect(screen.getByText("song1.mp3")).toBeInTheDocument();
    });

    it("should handle shuffle toggle key", () => {
      render(() => <AudioPlayer audioFiles={mockAudioFiles} />);
      
      fireEvent.keyDown(document, { code: "KeyS" });
      
      const shuffleButton = screen.getByRole("button", { name: /shuffle/i });
      expect(shuffleButton).toHaveClass("active");
    });

    it("should not trigger shortcuts when input is focused", () => {
      render(() => <AudioPlayer audioFiles={mockAudioFiles} />);
      
      const volumeSlider = screen.getByRole("slider");
      volumeSlider.focus();
      
      fireEvent.keyDown(volumeSlider, { code: "Space" });
      
      expect(mockAudioElement.play).not.toHaveBeenCalled();
    });
  });

  describe("Error Handling", () => {
    it("should handle audio load errors gracefully", () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      
      render(() => <AudioPlayer audioFiles={mockAudioFiles} />);
      
      // Simulate error event
      mockAudioElement.dispatchEvent(new Event("error"));
      
      expect(consoleSpy).toHaveBeenCalledWith("Audio playback error");
      
      consoleSpy.mockRestore();
    });

    it("should handle empty audio files array", () => {
      render(() => <AudioPlayer audioFiles={[]} />);
      
      expect(screen.getByText("No track selected")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /play\/pause/i })).toBeDisabled();
    });
  });
});
