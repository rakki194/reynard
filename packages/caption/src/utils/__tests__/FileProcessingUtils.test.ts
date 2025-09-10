/**
 * File Processing Utils Tests
 *
 * Comprehensive test suite for file processing utilities.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  determineFileType,
  processFile,
  calculateFileCounts,
  createFileProcessingPipeline,
  getFileIcon,
  getTypeColor,
} from '../FileProcessingUtils';
import type { MultiModalFile, MediaType } from '../../types/MultiModalTypes';

// Mock the file processing pipeline
vi.mock('reynard-file-processing', () => ({
  FileProcessingPipeline: vi.fn().mockImplementation(() => ({
    processFile: vi.fn(),
  })),
}));

describe('File Processing Utils', () => {
  let mockFile: File;
  let mockPipeline: any;

  beforeEach(() => {
    // Create a mock file
    mockFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
    
    // Mock the pipeline
    mockPipeline = {
      processFile: vi.fn(),
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('determineFileType', () => {
    it('should identify image files by MIME type', () => {
      const imageFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
      expect(determineFileType(imageFile)).toBe('image');
    });

    it('should identify image files by extension', () => {
      const imageFile = new File([''], 'test.png', { type: 'application/octet-stream' });
      expect(determineFileType(imageFile)).toBe('image');
    });

    it('should identify video files by MIME type', () => {
      const videoFile = new File([''], 'test.mp4', { type: 'video/mp4' });
      expect(determineFileType(videoFile)).toBe('video');
    });

    it('should identify video files by extension', () => {
      const videoFile = new File([''], 'test.avi', { type: 'application/octet-stream' });
      expect(determineFileType(videoFile)).toBe('video');
    });

    it('should identify audio files by MIME type', () => {
      const audioFile = new File([''], 'test.mp3', { type: 'audio/mpeg' });
      expect(determineFileType(audioFile)).toBe('audio');
    });

    it('should identify audio files by extension', () => {
      const audioFile = new File([''], 'test.wav', { type: 'application/octet-stream' });
      expect(determineFileType(audioFile)).toBe('audio');
    });

    it('should identify text files by MIME type', () => {
      const textFile = new File([''], 'test.txt', { type: 'text/plain' });
      expect(determineFileType(textFile)).toBe('text');
    });

    it('should identify text files by extension', () => {
      const textFile = new File([''], 'test.js', { type: 'application/octet-stream' });
      expect(determineFileType(textFile)).toBe('text');
    });

    it('should identify document files by MIME type', () => {
      const docFile = new File([''], 'test.pdf', { type: 'application/pdf' });
      expect(determineFileType(docFile)).toBe('document');
    });

    it('should identify document files by extension', () => {
      const docFile = new File([''], 'test.docx', { type: 'application/octet-stream' });
      expect(determineFileType(docFile)).toBe('document');
    });

    it('should return unknown for unrecognized files', () => {
      const unknownFile = new File([''], 'test.xyz', { type: 'application/unknown' });
      expect(determineFileType(unknownFile)).toBe('unknown');
    });

    it('should handle files with no extension', () => {
      const noExtFile = new File([''], 'testfile', { type: 'application/octet-stream' });
      expect(determineFileType(noExtFile)).toBe('unknown');
    });

    it('should handle case insensitive extensions', () => {
      const upperCaseFile = new File([''], 'test.JPG', { type: 'application/octet-stream' });
      expect(determineFileType(upperCaseFile)).toBe('image');
    });
  });

  describe('processFile', () => {
    beforeEach(() => {
      // Mock successful pipeline response
      mockPipeline.processFile.mockResolvedValue({
        success: true,
        data: {
          thumbnail: new Blob(['thumbnail']),
          metadata: { width: 100, height: 100 },
          content: 'processed content',
        },
      });
    });

    it('should process a file successfully', async () => {
      const result = await processFile(mockFile, mockPipeline);
      
      expect(result).toMatchObject({
        name: 'test.jpg',
        size: mockFile.size,
        type: 'image/jpeg',
        fileType: 'image',
        metadata: { width: 100, height: 100 },
        content: 'processed content',
      });
      expect(result.id).toBeDefined();
      expect(result.url).toBeDefined();
      expect(result.thumbnail).toBeInstanceOf(Blob);
      expect(result.uploadedAt).toBeInstanceOf(Date);
      expect(result.modifiedAt).toBeInstanceOf(Date);
    });

    it('should handle pipeline processing failure', async () => {
      mockPipeline.processFile.mockResolvedValue({
        success: false,
        error: 'Processing failed',
      });

      await expect(processFile(mockFile, mockPipeline)).rejects.toThrow('Processing failed');
    });

    it('should handle pipeline processing failure without error message', async () => {
      mockPipeline.processFile.mockResolvedValue({
        success: false,
      });

      await expect(processFile(mockFile, mockPipeline)).rejects.toThrow('Failed to process file');
    });

    it('should call pipeline with correct options', async () => {
      await processFile(mockFile, mockPipeline);
      
      expect(mockPipeline.processFile).toHaveBeenCalledWith(mockFile, {
        generateThumbnails: true,
        extractMetadata: true,
        analyzeContent: true,
      });
    });
  });

  describe('calculateFileCounts', () => {
    it('should calculate counts for all file types', () => {
      const files: MultiModalFile[] = [
        { fileType: 'image' } as MultiModalFile,
        { fileType: 'image' } as MultiModalFile,
        { fileType: 'video' } as MultiModalFile,
        { fileType: 'audio' } as MultiModalFile,
        { fileType: 'text' } as MultiModalFile,
        { fileType: 'document' } as MultiModalFile,
        { fileType: 'unknown' } as MultiModalFile,
      ];

      const counts = calculateFileCounts(files);
      
      expect(counts).toEqual({
        all: 7,
        image: 2,
        video: 1,
        audio: 1,
        text: 1,
        document: 1,
      });
    });

    it('should handle empty file array', () => {
      const counts = calculateFileCounts([]);
      
      expect(counts).toEqual({
        all: 0,
        image: 0,
        video: 0,
        audio: 0,
        text: 0,
        document: 0,
      });
    });

    it('should handle files with only one type', () => {
      const files: MultiModalFile[] = [
        { fileType: 'image' } as MultiModalFile,
        { fileType: 'image' } as MultiModalFile,
        { fileType: 'image' } as MultiModalFile,
      ];

      const counts = calculateFileCounts(files);
      
      expect(counts).toEqual({
        all: 3,
        image: 3,
        video: 0,
        audio: 0,
        text: 0,
        document: 0,
      });
    });
  });

  describe('createFileProcessingPipeline', () => {
    it('should create pipeline with default configuration', () => {
      const pipeline = createFileProcessingPipeline();
      expect(pipeline).toBeDefined();
    });
  });

  describe('getFileIcon', () => {
    it('should return correct icons for all media types', () => {
      const iconMap: Record<MediaType, string> = {
        image: '🖼️',
        video: '🎥',
        audio: '🎵',
        text: '📄',
        document: '📋',
        unknown: '📁',
      };

      Object.entries(iconMap).forEach(([type, expectedIcon]) => {
        expect(getFileIcon(type as MediaType)).toBe(expectedIcon);
      });
    });

    it('should return default icon for unknown type', () => {
      expect(getFileIcon('unknown' as MediaType)).toBe('📁');
    });
  });

  describe('getTypeColor', () => {
    it('should return correct colors for all media types', () => {
      const colorMap: Record<MediaType, string> = {
        image: 'oklch(var(--success-color))',
        video: 'oklch(var(--info-color))',
        audio: 'oklch(var(--warning-color))',
        text: 'oklch(var(--primary-color))',
        document: 'oklch(var(--secondary-color))',
        unknown: 'oklch(var(--text-muted))',
      };

      Object.entries(colorMap).forEach(([type, expectedColor]) => {
        expect(getTypeColor(type as MediaType)).toBe(expectedColor);
      });
    });

    it('should return default color for unknown type', () => {
      expect(getTypeColor('unknown' as MediaType)).toBe('oklch(var(--text-muted))');
    });
  });
});
