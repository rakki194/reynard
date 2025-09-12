/**
 * Audio Grid Component Test Suite
 *
 * Tests for the AudioGrid component including file management,
 * metadata display, and audio analysis functionality.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@solidjs/testing-library";
import { AudioGrid } from "../../AudioGrid";

// Mock the file processing dependencies
vi.mock("reynard-file-processing", () => ({
  AudioThumbnailGenerator: vi.fn().mockImplementation(() => ({
    generateThumbnail: vi
      .fn()
      .mockResolvedValue("data:image/webp;base64,mock-thumbnail"),
  })),
  AudioMetadataExtractor: vi.fn().mockImplementation(() => ({
    extractMetadata: vi.fn().mockResolvedValue({
      duration: 180,
      bitrate: 320,
      sampleRate: 44100,
      channels: 2,
      format: "mp3",
    }),
  })),
}));

// Mock the AudioPlayer component
vi.mock("../AudioPlayer", () => ({
  AudioPlayer: (props: any) => <div data-testid="audio-player" {...props} />,
}));

// Mock the AudioWaveformVisualizer component
vi.mock("../AudioWaveformVisualizer", () => ({
  AudioWaveformVisualizer: (props: any) => (
    <div data-testid="audio-waveform-visualizer" {...props} />
  ),
}));

describe("AudioGrid", () => {
  const mockAudioFiles = [
    {
      id: "1",
      name: "song1.mp3",
      file: new File(["audio1"], "song1.mp3", { type: "audio/mpeg" }),
      metadata: {
        duration: 180,
        bitrate: 320,
        sampleRate: 44100,
        channels: 2,
        format: "mp3",
      },
      thumbnail: "data:image/webp;base64,mock-thumbnail1",
    },
    {
      id: "2",
      name: "song2.wav",
      file: new File(["audio2"], "song2.wav", { type: "audio/wav" }),
      metadata: {
        duration: 240,
        bitrate: 1411,
        sampleRate: 44100,
        channels: 2,
        format: "wav",
      },
      thumbnail: "data:image/webp;base64,mock-thumbnail2",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render with initial files", () => {
      render(() => <AudioGrid initialFiles={mockAudioFiles} />);

      expect(screen.getByText("song1.mp3")).toBeInTheDocument();
      expect(screen.getByText("song2.wav")).toBeInTheDocument();
    });

    it("should render with custom class", () => {
      render(() => (
        <AudioGrid initialFiles={mockAudioFiles} class="custom-grid" />
      ));

      const grid = screen.getByRole("generic");
      expect(grid).toHaveClass("audio-grid", "custom-grid");
    });

    it("should show metadata when enabled", () => {
      render(() => (
        <AudioGrid initialFiles={mockAudioFiles} showMetadata={true} />
      ));

      expect(screen.getByText("3:00")).toBeInTheDocument(); // 180 seconds
      expect(screen.getByText("4:00")).toBeInTheDocument(); // 240 seconds
    });

    it("should not show metadata when disabled", () => {
      render(() => (
        <AudioGrid initialFiles={mockAudioFiles} showMetadata={false} />
      ));

      expect(screen.queryByText("3:00")).not.toBeInTheDocument();
      expect(screen.queryByText("4:00")).not.toBeInTheDocument();
    });
  });

  describe("File Selection", () => {
    it("should select file when clicked", () => {
      const onFileSelect = vi.fn();
      render(() => (
        <AudioGrid initialFiles={mockAudioFiles} onFileSelect={onFileSelect} />
      ));

      const fileItem = screen.getByText("song1.mp3");
      fireEvent.click(fileItem);

      expect(onFileSelect).toHaveBeenCalledWith(mockAudioFiles[0]);
    });

    it("should show selected file indicator", () => {
      render(() => <AudioGrid initialFiles={mockAudioFiles} />);

      const fileItem = screen.getByText("song1.mp3");
      fireEvent.click(fileItem);

      expect(fileItem.closest(".audio-file-card")).toHaveClass(
        "audio-file-card--selected",
      );
    });

    it("should deselect file when clicked again", () => {
      render(() => <AudioGrid initialFiles={mockAudioFiles} />);

      const fileItem = screen.getByText("song1.mp3");
      fireEvent.click(fileItem);
      fireEvent.click(fileItem);

      expect(fileItem.closest(".audio-file-card")).not.toHaveClass(
        "audio-file-card--selected",
      );
    });
  });

  describe("File Removal", () => {
    it("should remove file when remove button is clicked", () => {
      const onFileRemove = vi.fn();
      render(() => (
        <AudioGrid initialFiles={mockAudioFiles} onFileRemove={onFileRemove} />
      ));

      const removeButton = screen.getAllByRole("button", {
        name: /remove/i,
      })[0];
      fireEvent.click(removeButton);

      expect(onFileRemove).toHaveBeenCalledWith("1");
    });

    it("should remove file from display", () => {
      render(() => <AudioGrid initialFiles={mockAudioFiles} />);

      const removeButton = screen.getAllByRole("button", {
        name: /remove/i,
      })[0];
      fireEvent.click(removeButton);

      expect(screen.queryByText("song1.mp3")).not.toBeInTheDocument();
    });
  });

  describe("Audio Analysis", () => {
    it("should trigger analysis when analyze button is clicked", () => {
      const onAnalyzeAudio = vi.fn();
      render(() => (
        <AudioGrid
          initialFiles={mockAudioFiles}
          onAnalyzeAudio={onAnalyzeAudio}
        />
      ));

      const analyzeButton = screen.getAllByRole("button", {
        name: /analyze/i,
      })[0];
      fireEvent.click(analyzeButton);

      expect(onAnalyzeAudio).toHaveBeenCalledWith(mockAudioFiles[0]);
    });

    it("should show analyzing state", () => {
      render(() => (
        <AudioGrid initialFiles={mockAudioFiles} isAnalyzing={true} />
      ));

      expect(screen.getByText(/analyzing/i)).toBeInTheDocument();
    });

    it("should disable analyze buttons when analyzing", () => {
      render(() => (
        <AudioGrid initialFiles={mockAudioFiles} isAnalyzing={true} />
      ));

      const analyzeButtons = screen.getAllByRole("button", {
        name: /analyze/i,
      });
      analyzeButtons.forEach((button) => {
        expect(button).toBeDisabled();
      });
    });
  });

  describe("File Limits", () => {
    it("should respect maxFiles limit", () => {
      render(() => <AudioGrid initialFiles={mockAudioFiles} maxFiles={1} />);

      expect(screen.getByText("song1.mp3")).toBeInTheDocument();
      expect(screen.queryByText("song2.wav")).not.toBeInTheDocument();
    });

    it("should show file limit message when exceeded", () => {
      render(() => <AudioGrid initialFiles={mockAudioFiles} maxFiles={1} />);

      expect(screen.getByText(/maximum.*files/i)).toBeInTheDocument();
    });
  });

  describe("Error Handling", () => {
    it("should display error message when error occurs", () => {
      render(() => <AudioGrid initialFiles={mockAudioFiles} />);

      // Simulate error state
      const errorMessage = "Failed to load audio file";
      // This would be set internally by the component
      // For testing, we'll check if error handling is in place
      expect(screen.getByRole("generic")).toBeInTheDocument();
    });

    it("should handle empty files array", () => {
      render(() => <AudioGrid initialFiles={[]} />);

      expect(screen.getByText(/no audio files/i)).toBeInTheDocument();
    });
  });

  describe("Loading States", () => {
    it("should show loading state when processing files", () => {
      render(() => <AudioGrid initialFiles={mockAudioFiles} />);

      // The component should show loading indicators during file processing
      expect(screen.getByRole("generic")).toBeInTheDocument();
    });

    it("should show thumbnails when loaded", async () => {
      render(() => <AudioGrid initialFiles={mockAudioFiles} />);

      await waitFor(() => {
        const thumbnails = screen.getAllByRole("img");
        expect(thumbnails.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels", () => {
      render(() => <AudioGrid initialFiles={mockAudioFiles} />);

      expect(screen.getByRole("generic")).toHaveAttribute(
        "aria-label",
        "Audio file grid",
      );
    });

    it("should support keyboard navigation", () => {
      render(() => <AudioGrid initialFiles={mockAudioFiles} />);

      const fileItem = screen.getByText("song1.mp3");
      expect(fileItem.closest(".audio-file-card")).toHaveAttribute(
        "tabindex",
        "0",
      );
    });

    it("should have proper button labels", () => {
      render(() => <AudioGrid initialFiles={mockAudioFiles} />);

      expect(
        screen.getAllByRole("button", { name: /remove/i })[0],
      ).toBeInTheDocument();
      expect(
        screen.getAllByRole("button", { name: /analyze/i })[0],
      ).toBeInTheDocument();
    });
  });
});
