/**
 * Audio Utils Test Suite
 * 
 * Tests for audio utility functions including file validation,
 * formatting, and helper functions.
 */

import { describe, it, expect } from "vitest";
import { isAudioFile, getFileExtension, formatDuration, formatFileSize } from "../audioUtils";

describe("audioUtils", () => {
  describe("isAudioFile", () => {
    it("should return true for valid audio file extensions", () => {
      const audioFiles = [
        new File([], "test.mp3", { type: "audio/mpeg" }),
        new File([], "test.wav", { type: "audio/wav" }),
        new File([], "test.flac", { type: "audio/flac" }),
        new File([], "test.aac", { type: "audio/aac" }),
        new File([], "test.ogg", { type: "audio/ogg" }),
        new File([], "test.m4a", { type: "audio/mp4" }),
        new File([], "test.wma", { type: "audio/x-ms-wma" }),
        new File([], "test.opus", { type: "audio/opus" }),
      ];

      audioFiles.forEach(file => {
        expect(isAudioFile(file)).toBe(true);
      });
    });

    it("should return false for non-audio file extensions", () => {
      const nonAudioFiles = [
        new File([], "test.txt", { type: "text/plain" }),
        new File([], "test.jpg", { type: "image/jpeg" }),
        new File([], "test.pdf", { type: "application/pdf" }),
        new File([], "test.mp4", { type: "video/mp4" }),
        new File([], "test.doc", { type: "application/msword" }),
      ];

      nonAudioFiles.forEach(file => {
        expect(isAudioFile(file)).toBe(false);
      });
    });

    it("should handle case-insensitive extensions", () => {
      const caseVariations = [
        new File([], "test.MP3", { type: "audio/mpeg" }),
        new File([], "test.WAV", { type: "audio/wav" }),
        new File([], "test.Flac", { type: "audio/flac" }),
        new File([], "test.AAC", { type: "audio/aac" }),
      ];

      caseVariations.forEach(file => {
        expect(isAudioFile(file)).toBe(true);
      });
    });

    it("should handle files without extensions", () => {
      const fileWithoutExtension = new File([], "test", { type: "audio/mpeg" });
      expect(isAudioFile(fileWithoutExtension)).toBe(false);
    });
  });

  describe("getFileExtension", () => {
    it("should extract file extension with dot", () => {
      expect(getFileExtension("test.mp3")).toBe(".mp3");
      expect(getFileExtension("audio.wav")).toBe(".wav");
      expect(getFileExtension("song.flac")).toBe(".flac");
    });

    it("should handle case-insensitive extensions", () => {
      expect(getFileExtension("test.MP3")).toBe(".mp3");
      expect(getFileExtension("audio.WAV")).toBe(".wav");
      expect(getFileExtension("song.Flac")).toBe(".flac");
    });

    it("should handle files with multiple dots", () => {
      expect(getFileExtension("my.audio.file.mp3")).toBe(".mp3");
      expect(getFileExtension("test.backup.wav")).toBe(".wav");
    });

    it("should handle files without extensions", () => {
      expect(getFileExtension("test")).toBe(".");
      expect(getFileExtension("audio")).toBe(".");
    });

    it("should handle empty filename", () => {
      expect(getFileExtension("")).toBe(".");
    });
  });

  describe("formatDuration", () => {
    it("should format seconds correctly", () => {
      expect(formatDuration(0)).toBe("0:00");
      expect(formatDuration(30)).toBe("0:30");
      expect(formatDuration(60)).toBe("1:00");
      expect(formatDuration(90)).toBe("1:30");
      expect(formatDuration(125)).toBe("2:05");
    });

    it("should format hours correctly", () => {
      expect(formatDuration(3600)).toBe("1:00:00");
      expect(formatDuration(3661)).toBe("1:01:01");
      expect(formatDuration(7325)).toBe("2:02:05");
    });

    it("should handle undefined input", () => {
      expect(formatDuration(undefined)).toBe("Unknown");
    });

    it("should handle null input", () => {
      expect(formatDuration(null as any)).toBe("Unknown");
    });

    it("should handle decimal seconds", () => {
      expect(formatDuration(30.5)).toBe("0:30");
      expect(formatDuration(90.7)).toBe("1:30");
    });
  });

  describe("formatFileSize", () => {
    it("should format bytes correctly", () => {
      expect(formatFileSize(0)).toBe("0 B");
      expect(formatFileSize(500)).toBe("500 B");
      expect(formatFileSize(1024)).toBe("1 KB");
      expect(formatFileSize(1536)).toBe("1.5 KB");
      expect(formatFileSize(1048576)).toBe("1 MB");
      expect(formatFileSize(1073741824)).toBe("1 GB");
      expect(formatFileSize(1099511627776)).toBe("1 TB");
    });

    it("should handle large file sizes", () => {
      expect(formatFileSize(5 * 1024 * 1024)).toBe("5 MB");
      expect(formatFileSize(2.5 * 1024 * 1024 * 1024)).toBe("2.5 GB");
    });

    it("should handle very small file sizes", () => {
      expect(formatFileSize(1)).toBe("1 B");
      expect(formatFileSize(999)).toBe("999 B");
    });

    it("should round to 2 decimal places", () => {
      expect(formatFileSize(1536)).toBe("1.5 KB");
      expect(formatFileSize(1537)).toBe("1.5 KB");
      expect(formatFileSize(1538)).toBe("1.5 KB");
    });
  });
});
