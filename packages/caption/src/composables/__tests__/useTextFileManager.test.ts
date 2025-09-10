/**
 * useTextFileManager Tests
 *
 * Test suite for the text file manager composable.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useTextFileManager } from '../useTextFileManager';
import type { TextFile } from '../../types/TextTypes';

describe('useTextFileManager', () => {
  let mockOnFileSelect: any;
  let mockOnFileRemove: any;
  let mockOnFileModify: any;

  beforeEach(() => {
    mockOnFileSelect = vi.fn();
    mockOnFileRemove = vi.fn();
    mockOnFileModify = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with default values', () => {
      const {
        textFiles,
        selectedFile,
      } = useTextFileManager();

      expect(textFiles()).toEqual([]);
      expect(selectedFile()).toBe(null);
    });

    it('should initialize with provided files', () => {
      const initialFiles: TextFile[] = [
        {
          id: '1',
          name: 'test.txt',
          content: 'Hello World',
          size: 11,
          type: 'text/plain',
          uploadedAt: new Date(),
          modifiedAt: new Date(),
        },
      ];

      const { textFiles } = useTextFileManager({ initialFiles });

      expect(textFiles()).toEqual(initialFiles);
    });

    it('should initialize with callbacks', () => {
      const options = {
        onFileSelect: mockOnFileSelect,
        onFileRemove: mockOnFileRemove,
        onFileModify: mockOnFileModify,
      };

      const result = useTextFileManager(options);

      expect(result).toBeDefined();
      expect(typeof result.handleFileSelect).toBe('function');
      expect(typeof result.handleFileRemove).toBe('function');
      expect(typeof result.handleFileModify).toBe('function');
    });
  });

  describe('File Selection', () => {
    it('should select a file', () => {
      const { selectedFile, setSelectedFile } = useTextFileManager();
      const file: TextFile = {
        id: '1',
        name: 'test.txt',
        content: 'Hello World',
        size: 11,
        type: 'text/plain',
        uploadedAt: new Date(),
        modifiedAt: new Date(),
      };

      setSelectedFile(file);
      expect(selectedFile()).toBe(file);
    });

    it('should handle file selection with callback', () => {
      const { handleFileSelect } = useTextFileManager({ onFileSelect: mockOnFileSelect });
      const file: TextFile = {
        id: '1',
        name: 'test.txt',
        content: 'Hello World',
        size: 11,
        type: 'text/plain',
        uploadedAt: new Date(),
        modifiedAt: new Date(),
      };

      handleFileSelect(file);
      expect(mockOnFileSelect).toHaveBeenCalledWith(file);
    });
  });

  describe('File Management', () => {
    it('should remove a file', () => {
      const files: TextFile[] = [
        {
          id: '1',
          name: 'test1.txt',
          content: 'Hello World 1',
          size: 13,
          type: 'text/plain',
          uploadedAt: new Date(),
          modifiedAt: new Date(),
        },
        {
          id: '2',
          name: 'test2.txt',
          content: 'Hello World 2',
          size: 13,
          type: 'text/plain',
          uploadedAt: new Date(),
          modifiedAt: new Date(),
        },
      ];

      const { handleFileRemove } = useTextFileManager({ 
        initialFiles: files, 
        onFileRemove: mockOnFileRemove 
      });

      handleFileRemove('1');
      expect(mockOnFileRemove).toHaveBeenCalledWith('1');
    });

    it('should clear selected file when removing it', () => {
      const file: TextFile = {
        id: '1',
        name: 'test.txt',
        content: 'Hello World',
        size: 11,
        type: 'text/plain',
        uploadedAt: new Date(),
        modifiedAt: new Date(),
      };

      const { setSelectedFile, handleFileRemove, selectedFile } = useTextFileManager({ 
        initialFiles: [file] 
      });

      setSelectedFile(file);
      expect(selectedFile()).toBe(file);

      handleFileRemove('1');
      expect(selectedFile()).toBe(null);
    });

    it('should modify file content', () => {
      const file: TextFile = {
        id: '1',
        name: 'test.txt',
        content: 'Hello World',
        size: 11,
        type: 'text/plain',
        uploadedAt: new Date(),
        modifiedAt: new Date(),
      };

      const { handleFileModify } = useTextFileManager({ 
        initialFiles: [file], 
        onFileModify: mockOnFileModify 
      });
      const newContent = 'Hello Modified World';

      handleFileModify('1', newContent);
      
      expect(mockOnFileModify).toHaveBeenCalledWith('1', newContent);
    });

    it('should not modify non-existent file', () => {
      const file: TextFile = {
        id: '1',
        name: 'test.txt',
        content: 'Hello World',
        size: 11,
        type: 'text/plain',
        uploadedAt: new Date(),
        modifiedAt: new Date(),
      };

      const { handleFileModify } = useTextFileManager({ initialFiles: [file] });
      const originalModifiedAt = file.modifiedAt;

      handleFileModify('non-existent', 'New content');
      
      // The file should remain unchanged
      expect(file.modifiedAt).toBe(originalModifiedAt);
    });

    it('should add new files', () => {
      const initialFiles: TextFile[] = [
        {
          id: '1',
          name: 'test1.txt',
          content: 'Hello World 1',
          size: 13,
          type: 'text/plain',
          uploadedAt: new Date(),
          modifiedAt: new Date(),
        },
      ];

      const newFiles: TextFile[] = [
        {
          id: '2',
          name: 'test2.txt',
          content: 'Hello World 2',
          size: 13,
          type: 'text/plain',
          uploadedAt: new Date(),
          modifiedAt: new Date(),
        },
        {
          id: '3',
          name: 'test3.txt',
          content: 'Hello World 3',
          size: 13,
          type: 'text/plain',
          uploadedAt: new Date(),
          modifiedAt: new Date(),
        },
      ];

      const { addFiles, textFiles } = useTextFileManager({ initialFiles });

      addFiles(newFiles);
      expect(textFiles()).toHaveLength(3);
      expect(textFiles()[0].id).toBe('1');
      expect(textFiles()[1].id).toBe('2');
      expect(textFiles()[2].id).toBe('3');
    });
  });

  describe('Return Values', () => {
    it('should return all required functions and values', () => {
      const result = useTextFileManager();

      expect(typeof result.textFiles).toBe('function');
      expect(typeof result.selectedFile).toBe('function');
      expect(typeof result.setSelectedFile).toBe('function');
      expect(typeof result.handleFileSelect).toBe('function');
      expect(typeof result.handleFileRemove).toBe('function');
      expect(typeof result.handleFileModify).toBe('function');
      expect(typeof result.addFiles).toBe('function');
    });
  });
});
