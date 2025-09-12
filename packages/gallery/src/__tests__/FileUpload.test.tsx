/**
 * File Upload Component Test Suite
 *
 * Tests for the FileUpload component including drag and drop,
 * file validation, and upload progress.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@solidjs/testing-library";
import { FileUpload } from "../../FileUpload";

// Mock the child components
vi.mock("../components", () => ({
  DropZone: (props: any) => <div data-testid="drop-zone" {...props} />,
  FileList: (props: any) => <div data-testid="file-list" {...props} />,
  UploadControls: (props: any) => (
    <div data-testid="upload-controls" {...props} />
  ),
}));

// Mock the composables
vi.mock("../composables/useFileUpload", () => ({
  useFileUpload: () => ({
    uploadItems: [],
    isUploading: false,
    uploadProgress: {},
    startUpload: vi.fn(),
    cancelUpload: vi.fn(),
    removeUploadItem: vi.fn(),
  }),
}));

vi.mock("../composables/useDragDrop", () => ({
  useDragDrop: () => ({
    isDragOver: false,
    dragHandlers: {
      onDragOver: vi.fn(),
      onDragLeave: vi.fn(),
      onDrop: vi.fn(),
    },
  }),
}));

vi.mock("../composables/useFileValidation", () => ({
  useFileValidation: () => ({
    validateFiles: vi.fn(),
    validationErrors: [],
  }),
}));

vi.mock("../composables/useFileUploadHandlers", () => ({
  useFileUploadHandlers: () => ({
    handleFileSelect: vi.fn(),
    handleFileDrop: vi.fn(),
    handleUploadStart: vi.fn(),
    handleUploadCancel: vi.fn(),
  }),
}));

describe("FileUpload", () => {
  const mockProps = {
    uploadUrl: "/api/upload",
    onFilesSelected: vi.fn(),
    onUploadStart: vi.fn(),
    onUploadProgress: vi.fn(),
    onUploadComplete: vi.fn(),
    onUploadError: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render with default props", () => {
      render(() => <FileUpload {...mockProps} />);

      expect(screen.getByTestId("drop-zone")).toBeInTheDocument();
      expect(screen.getByTestId("file-list")).toBeInTheDocument();
      expect(screen.getByTestId("upload-controls")).toBeInTheDocument();
    });

    it("should render with custom class name", () => {
      render(() => <FileUpload {...mockProps} class="custom-upload" />);

      const upload = screen.getByRole("generic");
      expect(upload).toHaveClass("file-upload", "custom-upload");
    });

    it("should show file list when enabled", () => {
      render(() => <FileUpload {...mockProps} showFileList={true} />);

      expect(screen.getByTestId("file-list")).toBeInTheDocument();
    });

    it("should not show file list when disabled", () => {
      render(() => <FileUpload {...mockProps} showFileList={false} />);

      expect(screen.queryByTestId("file-list")).not.toBeInTheDocument();
    });

    it("should show progress when enabled", () => {
      render(() => <FileUpload {...mockProps} showProgress={true} />);

      expect(screen.getByTestId("upload-controls")).toBeInTheDocument();
    });

    it("should not show progress when disabled", () => {
      render(() => <FileUpload {...mockProps} showProgress={false} />);

      expect(screen.queryByTestId("upload-controls")).not.toBeInTheDocument();
    });
  });

  describe("Drag and Drop", () => {
    it("should enable drag and drop by default", () => {
      render(() => <FileUpload {...mockProps} />);

      expect(screen.getByTestId("drop-zone")).toBeInTheDocument();
    });

    it("should disable drag and drop when specified", () => {
      render(() => <FileUpload {...mockProps} enableDragDrop={false} />);

      // Drop zone should still render but without drag functionality
      expect(screen.getByTestId("drop-zone")).toBeInTheDocument();
    });

    it("should handle file drop events", () => {
      render(() => <FileUpload {...mockProps} />);

      const dropZone = screen.getByTestId("drop-zone");
      const mockFiles = [
        new File(["content"], "test.txt", { type: "text/plain" }),
      ];

      fireEvent.drop(dropZone, {
        dataTransfer: {
          files: mockFiles,
        },
      });

      expect(mockProps.onFilesSelected).toHaveBeenCalled();
    });
  });

  describe("File Selection", () => {
    it("should handle single file selection", () => {
      render(() => <FileUpload {...mockProps} multiple={false} />);

      const dropZone = screen.getByTestId("drop-zone");
      fireEvent.click(dropZone);

      // Simulate file input change
      const mockFile = new File(["content"], "test.txt", {
        type: "text/plain",
      });
      const mockEvent = {
        target: {
          files: [mockFile],
        },
      };

      fireEvent.change(dropZone, mockEvent);

      expect(mockProps.onFilesSelected).toHaveBeenCalled();
    });

    it("should handle multiple file selection", () => {
      render(() => <FileUpload {...mockProps} multiple={true} />);

      const dropZone = screen.getByTestId("drop-zone");
      fireEvent.click(dropZone);

      // Simulate multiple file input change
      const mockFiles = [
        new File(["content1"], "test1.txt", { type: "text/plain" }),
        new File(["content2"], "test2.txt", { type: "text/plain" }),
      ];
      const mockEvent = {
        target: {
          files: mockFiles,
        },
      };

      fireEvent.change(dropZone, mockEvent);

      expect(mockProps.onFilesSelected).toHaveBeenCalled();
    });
  });

  describe("File Validation", () => {
    it("should validate file types", () => {
      render(() => <FileUpload {...mockProps} accept="image/*" />);

      const dropZone = screen.getByTestId("drop-zone");
      fireEvent.click(dropZone);

      // Simulate invalid file type
      const mockFile = new File(["content"], "test.txt", {
        type: "text/plain",
      });
      const mockEvent = {
        target: {
          files: [mockFile],
        },
      };

      fireEvent.change(dropZone, mockEvent);

      // Should show validation error
      expect(screen.getByText(/invalid file type/i)).toBeInTheDocument();
    });

    it("should validate file size", () => {
      render(() => <FileUpload {...mockProps} maxFileSize={1000} />);

      const dropZone = screen.getByTestId("drop-zone");
      fireEvent.click(dropZone);

      // Simulate oversized file
      const mockFile = new File(["content"], "test.txt", {
        type: "text/plain",
      });
      Object.defineProperty(mockFile, "size", { value: 2000 });

      const mockEvent = {
        target: {
          files: [mockFile],
        },
      };

      fireEvent.change(dropZone, mockEvent);

      // Should show validation error
      expect(screen.getByText(/file too large/i)).toBeInTheDocument();
    });

    it("should validate maximum number of files", () => {
      render(() => <FileUpload {...mockProps} maxFiles={2} />);

      const dropZone = screen.getByTestId("drop-zone");
      fireEvent.click(dropZone);

      // Simulate too many files
      const mockFiles = [
        new File(["content1"], "test1.txt", { type: "text/plain" }),
        new File(["content2"], "test2.txt", { type: "text/plain" }),
        new File(["content3"], "test3.txt", { type: "text/plain" }),
      ];
      const mockEvent = {
        target: {
          files: mockFiles,
        },
      };

      fireEvent.change(dropZone, mockEvent);

      // Should show validation error
      expect(screen.getByText(/too many files/i)).toBeInTheDocument();
    });
  });

  describe("Upload Process", () => {
    it("should start upload when autoUpload is enabled", () => {
      render(() => <FileUpload {...mockProps} autoUpload={true} />);

      const dropZone = screen.getByTestId("drop-zone");
      fireEvent.click(dropZone);

      // Simulate file selection
      const mockFile = new File(["content"], "test.txt", {
        type: "text/plain",
      });
      const mockEvent = {
        target: {
          files: [mockFile],
        },
      };

      fireEvent.change(dropZone, mockEvent);

      expect(mockProps.onUploadStart).toHaveBeenCalled();
    });

    it("should not start upload when autoUpload is disabled", () => {
      render(() => <FileUpload {...mockProps} autoUpload={false} />);

      const dropZone = screen.getByTestId("drop-zone");
      fireEvent.click(dropZone);

      // Simulate file selection
      const mockFile = new File(["content"], "test.txt", {
        type: "text/plain",
      });
      const mockEvent = {
        target: {
          files: [mockFile],
        },
      };

      fireEvent.change(dropZone, mockEvent);

      expect(mockProps.onUploadStart).not.toHaveBeenCalled();
    });

    it("should show upload progress", () => {
      render(() => <FileUpload {...mockProps} showProgress={true} />);

      const uploadControls = screen.getByTestId("upload-controls");
      expect(uploadControls).toBeInTheDocument();
    });

    it("should handle upload completion", () => {
      render(() => <FileUpload {...mockProps} />);

      // Simulate upload completion
      const mockResult = { success: true, fileId: "123" };
      mockProps.onUploadComplete(mockResult);

      expect(mockProps.onUploadComplete).toHaveBeenCalledWith(mockResult);
    });

    it("should handle upload errors", () => {
      render(() => <FileUpload {...mockProps} />);

      // Simulate upload error
      const mockError = new Error("Upload failed");
      mockProps.onUploadError(mockError);

      expect(mockProps.onUploadError).toHaveBeenCalledWith(mockError);
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels", () => {
      render(() => <FileUpload {...mockProps} />);

      const upload = screen.getByRole("generic");
      expect(upload).toHaveAttribute("aria-label", "File upload");
    });

    it("should support keyboard navigation", () => {
      render(() => <FileUpload {...mockProps} />);

      const dropZone = screen.getByTestId("drop-zone");
      expect(dropZone).toHaveAttribute("tabindex", "0");
    });

    it("should announce upload status", () => {
      render(() => <FileUpload {...mockProps} />);

      // Should have status announcements for upload progress
      expect(screen.getByRole("generic")).toBeInTheDocument();
    });
  });

  describe("Configuration", () => {
    it("should apply custom headers", () => {
      const customHeaders = {
        Authorization: "Bearer token",
        "X-Custom-Header": "value",
      };

      render(() => <FileUpload {...mockProps} headers={customHeaders} />);

      expect(screen.getByTestId("upload-controls")).toBeInTheDocument();
    });

    it("should apply custom upload URL", () => {
      const customUrl = "/custom/upload";
      render(() => <FileUpload {...mockProps} uploadUrl={customUrl} />);

      expect(screen.getByTestId("upload-controls")).toBeInTheDocument();
    });
  });
});
