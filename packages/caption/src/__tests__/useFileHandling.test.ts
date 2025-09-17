/**
 * useFileHandling Tests
 *
 * Test suite for the file handling composable.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useFileHandling } from "../../useFileHandling";
import type { MultiModalFile, MediaType, GalleryView } from "../../../types/MultiModalTypes";

// Mock the file processing utilities
vi.mock("../../utils/FileProcessingUtils", () => ({
  calculateFileCounts: vi.fn(files => {
    if (!files || files.length === 0) {
      return {
        all: 0,
        image: 0,
        video: 0,
        audio: 0,
        text: 0,
        document: 0,
      };
    }
    return {
      all: files.length,
      image: files.filter((f: any) => f.fileType === "image").length,
      video: files.filter((f: any) => f.fileType === "video").length,
      audio: files.filter((f: any) => f.fileType === "audio").length,
      text: files.filter((f: any) => f.fileType === "text").length,
      document: files.filter((f: any) => f.fileType === "document").length,
    };
  }),
}));

describe("useFileHandling", () => {
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

  describe("Initialization", () => {
    it("should initialize with default values", () => {
      const { files, selectedFile, currentView, filterType, filteredFiles, fileCounts } = useFileHandling();

      expect(files()).toEqual([]);
      expect(selectedFile()).toBe(null);
      expect(currentView()).toBe("grid");
      expect(filterType()).toBe("all");
      expect(filteredFiles()).toEqual([]);
      expect(fileCounts()).toEqual({
        all: 0,
        image: 0,
        video: 0,
        audio: 0,
        text: 0,
        document: 0,
      });
    });

    it("should initialize with provided values", () => {
      const initialFiles: MultiModalFile[] = [
        {
          id: "1",
          name: "test.jpg",
          size: 100,
          type: "image/jpeg",
          fileType: "image",
          url: "blob:test",
          uploadedAt: new Date(),
          modifiedAt: new Date(),
        },
      ];

      const { files, currentView, filterType } = useFileHandling(
        initialFiles,
        "list",
        mockOnFileSelect,
        mockOnFileRemove,
        mockOnFileModify
      );

      expect(files()).toEqual(initialFiles);
      expect(currentView()).toBe("list");
      expect(filterType()).toBe("all");
    });
  });

  describe("File Management", () => {
    it("should set files directly", () => {
      const { files, setFiles } = useFileHandling();
      const newFiles: MultiModalFile[] = [
        {
          id: "1",
          name: "test.jpg",
          size: 100,
          type: "image/jpeg",
          fileType: "image",
          url: "blob:test",
          uploadedAt: new Date(),
          modifiedAt: new Date(),
        },
      ];

      setFiles(newFiles);
      expect(files()).toEqual(newFiles);
    });

    it("should set files using function", () => {
      const { files, setFiles } = useFileHandling();
      const initialFiles: MultiModalFile[] = [
        {
          id: "1",
          name: "test.jpg",
          size: 100,
          type: "image/jpeg",
          fileType: "image",
          url: "blob:test",
          uploadedAt: new Date(),
          modifiedAt: new Date(),
        },
      ];

      setFiles(initialFiles);
      setFiles(prev => [
        ...prev,
        {
          id: "2",
          name: "test2.jpg",
          size: 200,
          type: "image/jpeg",
          fileType: "image",
          url: "blob:test2",
          uploadedAt: new Date(),
          modifiedAt: new Date(),
        },
      ]);

      expect(files()).toHaveLength(2);
      expect(files()[1].id).toBe("2");
    });
  });

  describe("File Selection", () => {
    it("should select a file", () => {
      const { selectedFile, setSelectedFile } = useFileHandling();
      const file: MultiModalFile = {
        id: "1",
        name: "test.jpg",
        size: 100,
        type: "image/jpeg",
        fileType: "image",
        url: "blob:test",
        uploadedAt: new Date(),
        modifiedAt: new Date(),
      };

      setSelectedFile(file);
      expect(selectedFile()).toBe(file);
    });

    it("should handle file selection with callback", () => {
      const { handleFileSelect } = useFileHandling([], "grid", mockOnFileSelect);
      const file: MultiModalFile = {
        id: "1",
        name: "test.jpg",
        size: 100,
        type: "image/jpeg",
        fileType: "image",
        url: "blob:test",
        uploadedAt: new Date(),
        modifiedAt: new Date(),
      };

      handleFileSelect(file);
      expect(mockOnFileSelect).toHaveBeenCalledWith(file);
    });
  });

  describe("View Management", () => {
    it("should change current view", () => {
      const { currentView, setCurrentView } = useFileHandling();

      setCurrentView("list");
      expect(currentView()).toBe("list");

      setCurrentView("grid");
      expect(currentView()).toBe("grid");
    });
  });

  describe("Filtering", () => {
    it("should filter files by type", () => {
      const files: MultiModalFile[] = [
        {
          id: "1",
          name: "test.jpg",
          size: 100,
          type: "image/jpeg",
          fileType: "image",
          url: "blob:test",
          uploadedAt: new Date(),
          modifiedAt: new Date(),
        },
        {
          id: "2",
          name: "test.mp4",
          size: 200,
          type: "video/mp4",
          fileType: "video",
          url: "blob:test2",
          uploadedAt: new Date(),
          modifiedAt: new Date(),
        },
      ];

      const { setFiles, filterType, setFilterType, filteredFiles } = useFileHandling();
      setFiles(files);

      // Test all filter
      expect(filteredFiles()).toHaveLength(2);

      // Test image filter
      setFilterType("image");
      expect(filteredFiles()).toHaveLength(1);
      expect(filteredFiles()[0].fileType).toBe("image");

      // Test video filter
      setFilterType("video");
      expect(filteredFiles()).toHaveLength(1);
      expect(filteredFiles()[0].fileType).toBe("video");

      // Test all filter again
      setFilterType("all");
      expect(filteredFiles()).toHaveLength(2);
    });

    it("should update file counts when files change", () => {
      const { files, setFiles, fileCounts } = useFileHandling();

      expect(fileCounts().all).toBe(0);

      const newFiles: MultiModalFile[] = [
        {
          id: "1",
          name: "test.jpg",
          size: 100,
          type: "image/jpeg",
          fileType: "image",
          url: "blob:test",
          uploadedAt: new Date(),
          modifiedAt: new Date(),
        },
        {
          id: "2",
          name: "test2.jpg",
          size: 200,
          type: "image/jpeg",
          fileType: "image",
          url: "blob:test2",
          uploadedAt: new Date(),
          modifiedAt: new Date(),
        },
      ];

      setFiles(newFiles);
      expect(fileCounts().all).toBe(2);
      expect(fileCounts().image).toBe(2);
    });
  });

  describe("File Operations", () => {
    it("should remove a file", () => {
      const files: MultiModalFile[] = [
        {
          id: "1",
          name: "test.jpg",
          size: 100,
          type: "image/jpeg",
          fileType: "image",
          url: "blob:test",
          uploadedAt: new Date(),
          modifiedAt: new Date(),
        },
        {
          id: "2",
          name: "test2.jpg",
          size: 200,
          type: "image/jpeg",
          fileType: "image",
          url: "blob:test2",
          uploadedAt: new Date(),
          modifiedAt: new Date(),
        },
      ];

      const { setFiles, handleFileRemove, files: getFiles } = useFileHandling([], "grid", undefined, mockOnFileRemove);
      setFiles(files);

      handleFileRemove("1");
      expect(getFiles()).toHaveLength(1);
      expect(getFiles()[0].id).toBe("2");
      expect(mockOnFileRemove).toHaveBeenCalledWith("1");
    });

    it("should clear selected file when removing it", () => {
      const file: MultiModalFile = {
        id: "1",
        name: "test.jpg",
        size: 100,
        type: "image/jpeg",
        fileType: "image",
        url: "blob:test",
        uploadedAt: new Date(),
        modifiedAt: new Date(),
      };

      const { setFiles, setSelectedFile, handleFileRemove, selectedFile } = useFileHandling([file]);

      setSelectedFile(file);
      expect(selectedFile()).toBe(file);

      handleFileRemove("1");
      expect(selectedFile()).toBe(null);
    });

    it("should modify a file", () => {
      const file: MultiModalFile = {
        id: "1",
        name: "test.jpg",
        size: 100,
        type: "image/jpeg",
        fileType: "image",
        url: "blob:test",
        uploadedAt: new Date(),
        modifiedAt: new Date(),
      };

      const { setFiles, handleFileModify, files } = useFileHandling(
        [file],
        "grid",
        undefined,
        undefined,
        mockOnFileModify
      );
      const newContent = { caption: "New caption" };

      handleFileModify("1", newContent);

      const updatedFile = files()[0];
      expect(updatedFile.content).toBe(newContent);
      expect(updatedFile.modifiedAt).toBeInstanceOf(Date);
      expect(mockOnFileModify).toHaveBeenCalledWith("1", newContent);
    });

    it("should not modify non-existent file", () => {
      const file: MultiModalFile = {
        id: "1",
        name: "test.jpg",
        size: 100,
        type: "image/jpeg",
        fileType: "image",
        url: "blob:test",
        uploadedAt: new Date(),
        modifiedAt: new Date(),
      };

      const { setFiles, handleFileModify, files } = useFileHandling([file]);
      const originalModifiedAt = file.modifiedAt;

      handleFileModify("non-existent", { caption: "New caption" });

      const unchangedFile = files()[0];
      expect(unchangedFile.content).toBeUndefined();
      expect(unchangedFile.modifiedAt).toBe(originalModifiedAt);
    });
  });

  describe("Return Values", () => {
    it("should return all required functions and values", () => {
      const result = useFileHandling();

      expect(typeof result.files).toBe("function");
      expect(typeof result.setFiles).toBe("function");
      expect(typeof result.selectedFile).toBe("function");
      expect(typeof result.setSelectedFile).toBe("function");
      expect(typeof result.currentView).toBe("function");
      expect(typeof result.setCurrentView).toBe("function");
      expect(typeof result.filterType).toBe("function");
      expect(typeof result.setFilterType).toBe("function");
      expect(typeof result.filteredFiles).toBe("function");
      expect(typeof result.fileCounts).toBe("function");
      expect(typeof result.handleFileSelect).toBe("function");
      expect(typeof result.handleFileRemove).toBe("function");
      expect(typeof result.handleFileModify).toBe("function");
    });
  });
});
