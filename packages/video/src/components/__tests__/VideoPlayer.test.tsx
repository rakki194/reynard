/**
 * Video Player Component Test Suite
 * 
 * Tests for the VideoPlayer component including playback controls,
 * video management, and interaction handling.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@solidjs/testing-library";
import { VideoPlayer } from "../VideoPlayer";

describe("VideoPlayer", () => {
  const mockVideoFile = new File(["video"], "test.mp4", { type: "video/mp4" });
  const mockVideoUrl = "https://example.com/video.mp4";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render with video file", () => {
      render(() => <VideoPlayer videoSrc={mockVideoFile} />);
      
      const videoElement = screen.getByRole("video");
      expect(videoElement).toBeInTheDocument();
    });

    it("should render with video URL", () => {
      render(() => <VideoPlayer videoSrc={mockVideoUrl} />);
      
      const videoElement = screen.getByRole("video");
      expect(videoElement).toBeInTheDocument();
    });

    it("should render with custom class name", () => {
      render(() => 
        <VideoPlayer 
          videoSrc={mockVideoFile} 
          class="custom-player" 
        />
      );
      
      const player = screen.getByRole("generic");
      expect(player).toHaveClass("video-player", "custom-player");
    });
  });

  describe("Playback Controls", () => {
    it("should show play button when paused", () => {
      render(() => <VideoPlayer videoSrc={mockVideoFile} />);
      
      expect(screen.getByRole("button", { name: /play/i })).toBeInTheDocument();
    });

    it("should show pause button when playing", () => {
      render(() => <VideoPlayer videoSrc={mockVideoFile} />);
      
      const playButton = screen.getByRole("button", { name: /play/i });
      fireEvent.click(playButton);
      
      expect(screen.getByRole("button", { name: /pause/i })).toBeInTheDocument();
    });

    it("should show progress bar", () => {
      render(() => <VideoPlayer videoSrc={mockVideoFile} />);
      
      expect(screen.getByRole("slider")).toBeInTheDocument();
    });

    it("should show volume control", () => {
      render(() => <VideoPlayer videoSrc={mockVideoFile} />);
      
      expect(screen.getByRole("slider", { name: /volume/i })).toBeInTheDocument();
    });

    it("should show fullscreen button", () => {
      render(() => <VideoPlayer videoSrc={mockVideoFile} />);
      
      expect(screen.getByRole("button", { name: /fullscreen/i })).toBeInTheDocument();
    });
  });

  describe("Video Configuration", () => {
    it("should apply autoplay configuration", () => {
      render(() => 
        <VideoPlayer 
          videoSrc={mockVideoFile} 
          autoplay={true}
        />
      );
      
      const videoElement = screen.getByRole("video");
      expect(videoElement).toHaveAttribute("autoplay");
    });

    it("should apply loop configuration", () => {
      render(() => 
        <VideoPlayer 
          videoSrc={mockVideoFile} 
          loop={true}
        />
      );
      
      const videoElement = screen.getByRole("video");
      expect(videoElement).toHaveAttribute("loop");
    });

    it("should apply muted configuration", () => {
      render(() => 
        <VideoPlayer 
          videoSrc={mockVideoFile} 
          muted={true}
        />
      );
      
      const videoElement = screen.getByRole("video");
      expect(videoElement).toHaveAttribute("muted");
    });

    it("should apply controls configuration", () => {
      render(() => 
        <VideoPlayer 
          videoSrc={mockVideoFile} 
          controls={true}
        />
      );
      
      const videoElement = screen.getByRole("video");
      expect(videoElement).toHaveAttribute("controls");
    });
  });

  describe("Event Handling", () => {
    it("should call onPlay when video plays", () => {
      const onPlay = vi.fn();
      render(() => 
        <VideoPlayer 
          videoSrc={mockVideoFile} 
          onPlay={onPlay}
        />
      );
      
      const playButton = screen.getByRole("button", { name: /play/i });
      fireEvent.click(playButton);
      
      expect(onPlay).toHaveBeenCalled();
    });

    it("should call onPause when video pauses", () => {
      const onPause = vi.fn();
      render(() => 
        <VideoPlayer 
          videoSrc={mockVideoFile} 
          onPause={onPause}
        />
      );
      
      const playButton = screen.getByRole("button", { name: /play/i });
      fireEvent.click(playButton);
      fireEvent.click(playButton);
      
      expect(onPause).toHaveBeenCalled();
    });

    it("should call onTimeUpdate when time changes", () => {
      const onTimeUpdate = vi.fn();
      render(() => 
        <VideoPlayer 
          videoSrc={mockVideoFile} 
          onTimeUpdate={onTimeUpdate}
        />
      );
      
      const videoElement = screen.getByRole("video");
      fireEvent.timeUpdate(videoElement);
      
      expect(onTimeUpdate).toHaveBeenCalled();
    });

    it("should call onVolumeChange when volume changes", () => {
      const onVolumeChange = vi.fn();
      render(() => 
        <VideoPlayer 
          videoSrc={mockVideoFile} 
          onVolumeChange={onVolumeChange}
        />
      );
      
      const volumeSlider = screen.getByRole("slider", { name: /volume/i });
      fireEvent.input(volumeSlider, { target: { value: "0.5" } });
      
      expect(onVolumeChange).toHaveBeenCalled();
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels", () => {
      render(() => <VideoPlayer videoSrc={mockVideoFile} />);
      
      const videoElement = screen.getByRole("video");
      expect(videoElement).toHaveAttribute("aria-label", "Video player");
    });

    it("should support keyboard navigation", () => {
      render(() => <VideoPlayer videoSrc={mockVideoFile} />);
      
      const playButton = screen.getByRole("button", { name: /play/i });
      expect(playButton).toHaveAttribute("tabindex", "0");
    });

    it("should announce playback state", () => {
      render(() => <VideoPlayer videoSrc={mockVideoFile} />);
      
      const playButton = screen.getByRole("button", { name: /play/i });
      expect(playButton).toHaveAttribute("aria-label", "Play video");
    });
  });

  describe("Error Handling", () => {
    it("should handle video load errors", () => {
      const onError = vi.fn();
      render(() => 
        <VideoPlayer 
          videoSrc={mockVideoFile} 
          onError={onError}
        />
      );
      
      const videoElement = screen.getByRole("video");
      fireEvent.error(videoElement);
      
      expect(onError).toHaveBeenCalled();
    });

    it("should show error message when video fails to load", () => {
      render(() => <VideoPlayer videoSrc="invalid-url" />);
      
      const videoElement = screen.getByRole("video");
      fireEvent.error(videoElement);
      
      expect(screen.getByText(/error loading video/i)).toBeInTheDocument();
    });
  });
});
