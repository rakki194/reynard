/**
 * Gallery Component Test Suite
 *
 * Tests for the Gallery component including file management,
 * navigation, and upload functionality.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@solidjs/testing-library";
import { Gallery } from "../../Gallery";

// Mock the child components
vi.mock("../GalleryGrid", () => ({
  GalleryGrid: (props: any) => <div data-testid="gallery-grid" {...props} />,
}));

vi.mock("../BreadcrumbNavigation", () => ({
  BreadcrumbNavigation: (props: any) => (
    <div data-testid="breadcrumb-navigation" {...props} />
  ),
}));

vi.mock("../FileUploadZone", () => ({
  FileUploadZone: (props: any) => (
    <div data-testid="file-upload-zone" {...props} />
  ),
}));

// Mock the composables
vi.mock("../../composables/useGalleryState", () => ({
  useGalleryState: () => ({
    currentPath: "/",
    selectedItems: [],
    viewMode: "grid",
    sortBy: "name",
    sortOrder: "asc",
    filter: "",
    isLoading: false,
    error: null,
  }),
}));

vi.mock("../../composables/useFileUpload", () => ({
  useFileUpload: () => ({
    uploadItems: [],
    isUploading: false,
    uploadProgress: {},
    startUpload: vi.fn(),
    cancelUpload: vi.fn(),
    removeUploadItem: vi.fn(),
  }),
}));

describe("Gallery", () => {
  const mockGalleryData = {
    files: [
      {
        id: "1",
        name: "image1.jpg",
        type: "image",
        size: 1024000,
        modified: new Date("2023-01-01"),
        path: "/image1.jpg",
      },
      {
        id: "2",
        name: "document.pdf",
        type: "document",
        size: 2048000,
        modified: new Date("2023-01-02"),
        path: "/document.pdf",
      },
    ],
    folders: [
      {
        id: "folder1",
        name: "Photos",
        path: "/Photos",
        itemCount: 5,
      },
    ],
  };

  const mockCallbacks = {
    onFileSelect: vi.fn(),
    onFileDoubleClick: vi.fn(),
    onFolderOpen: vi.fn(),
    onFileUpload: vi.fn(),
    onFileDelete: vi.fn(),
    onFileRename: vi.fn(),
    onFileMove: vi.fn(),
    onFileCopy: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render with gallery data", () => {
      render(() => <Gallery data={mockGalleryData} />);

      expect(screen.getByTestId("gallery-grid")).toBeInTheDocument();
    });

    it("should render with custom class name", () => {
      render(() => <Gallery data={mockGalleryData} class="custom-gallery" />);

      const gallery = screen.getByRole("generic");
      expect(gallery).toHaveClass("gallery", "custom-gallery");
    });

    it("should show breadcrumb navigation when enabled", () => {
      render(() => <Gallery data={mockGalleryData} showBreadcrumbs={true} />);

      expect(screen.getByTestId("breadcrumb-navigation")).toBeInTheDocument();
    });

    it("should not show breadcrumb navigation when disabled", () => {
      render(() => <Gallery data={mockGalleryData} showBreadcrumbs={false} />);

      expect(
        screen.queryByTestId("breadcrumb-navigation"),
      ).not.toBeInTheDocument();
    });

    it("should show upload zone when enabled", () => {
      render(() => <Gallery data={mockGalleryData} showUpload={true} />);

      expect(screen.getByTestId("file-upload-zone")).toBeInTheDocument();
    });

    it("should not show upload zone when disabled", () => {
      render(() => <Gallery data={mockGalleryData} showUpload={false} />);

      expect(screen.queryByTestId("file-upload-zone")).not.toBeInTheDocument();
    });
  });

  describe("Loading States", () => {
    it("should show loading state", () => {
      render(() => <Gallery data={mockGalleryData} loading={true} />);

      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it("should show error state", () => {
      const errorMessage = "Failed to load gallery";
      render(() => <Gallery data={mockGalleryData} error={errorMessage} />);

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it("should show empty state when no data", () => {
      render(() => <Gallery data={{ files: [], folders: [] }} />);

      expect(screen.getByText(/no files/i)).toBeInTheDocument();
    });
  });

  describe("Configuration", () => {
    it("should apply view configuration", () => {
      const viewConfig = {
        mode: "list" as const,
        itemsPerPage: 20,
        showThumbnails: true,
        thumbnailSize: 150,
      };

      render(() => <Gallery data={mockGalleryData} viewConfig={viewConfig} />);

      expect(screen.getByTestId("gallery-grid")).toBeInTheDocument();
    });

    it("should apply sort configuration", () => {
      const sortConfig = {
        by: "size" as const,
        order: "desc" as const,
      };

      render(() => <Gallery data={mockGalleryData} sortConfig={sortConfig} />);

      expect(screen.getByTestId("gallery-grid")).toBeInTheDocument();
    });

    it("should apply filter configuration", () => {
      const filterConfig = {
        types: ["image"],
        extensions: [".jpg", ".png"],
        minSize: 1000,
        maxSize: 5000000,
      };

      render(() => (
        <Gallery data={mockGalleryData} filterConfig={filterConfig} />
      ));

      expect(screen.getByTestId("gallery-grid")).toBeInTheDocument();
    });

    it("should apply upload configuration", () => {
      const uploadConfig = {
        maxFileSize: 10 * 1024 * 1024, // 10MB
        allowedTypes: ["image/*", "application/pdf"],
        maxFiles: 5,
        autoUpload: true,
      };

      render(() => (
        <Gallery data={mockGalleryData} uploadConfig={uploadConfig} />
      ));

      expect(screen.getByTestId("file-upload-zone")).toBeInTheDocument();
    });
  });

  describe("Event Handling", () => {
    it("should call onFileSelect when file is selected", () => {
      render(() => (
        <Gallery data={mockGalleryData} callbacks={mockCallbacks} />
      ));

      // Simulate file selection through gallery grid
      const galleryGrid = screen.getByTestId("gallery-grid");
      fireEvent.click(galleryGrid);

      expect(mockCallbacks.onFileSelect).toHaveBeenCalled();
    });

    it("should call onFileDoubleClick when file is double-clicked", () => {
      render(() => (
        <Gallery data={mockGalleryData} callbacks={mockCallbacks} />
      ));

      const galleryGrid = screen.getByTestId("gallery-grid");
      fireEvent.doubleClick(galleryGrid);

      expect(mockCallbacks.onFileDoubleClick).toHaveBeenCalled();
    });

    it("should call onFolderOpen when folder is opened", () => {
      render(() => (
        <Gallery data={mockGalleryData} callbacks={mockCallbacks} />
      ));

      const galleryGrid = screen.getByTestId("gallery-grid");
      fireEvent.click(galleryGrid);

      expect(mockCallbacks.onFolderOpen).toHaveBeenCalled();
    });

    it("should call onFileUpload when files are uploaded", () => {
      render(() => (
        <Gallery data={mockGalleryData} callbacks={mockCallbacks} />
      ));

      const uploadZone = screen.getByTestId("file-upload-zone");
      fireEvent.click(uploadZone);

      expect(mockCallbacks.onFileUpload).toHaveBeenCalled();
    });
  });

  describe("Toolbar", () => {
    it("should show toolbar when enabled", () => {
      render(() => <Gallery data={mockGalleryData} showToolbar={true} />);

      expect(screen.getByRole("toolbar")).toBeInTheDocument();
    });

    it("should not show toolbar when disabled", () => {
      render(() => <Gallery data={mockGalleryData} showToolbar={false} />);

      expect(screen.queryByRole("toolbar")).not.toBeInTheDocument();
    });

    it("should have view mode toggle buttons", () => {
      render(() => <Gallery data={mockGalleryData} showToolbar={true} />);

      expect(
        screen.getByRole("button", { name: /grid view/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /list view/i }),
      ).toBeInTheDocument();
    });

    it("should have sort controls", () => {
      render(() => <Gallery data={mockGalleryData} showToolbar={true} />);

      expect(screen.getByRole("button", { name: /sort/i })).toBeInTheDocument();
    });

    it("should have filter controls", () => {
      render(() => <Gallery data={mockGalleryData} showToolbar={true} />);

      expect(
        screen.getByRole("textbox", { name: /filter/i }),
      ).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels", () => {
      render(() => <Gallery data={mockGalleryData} />);

      const gallery = screen.getByRole("generic");
      expect(gallery).toHaveAttribute("aria-label", "File gallery");
    });

    it("should support keyboard navigation", () => {
      render(() => <Gallery data={mockGalleryData} />);

      const gallery = screen.getByRole("generic");
      expect(gallery).toHaveAttribute("tabindex", "0");
    });

    it("should announce loading state", () => {
      render(() => <Gallery data={mockGalleryData} loading={true} />);

      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("should announce error state", () => {
      render(() => <Gallery data={mockGalleryData} error="Test error" />);

      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });

  describe("Responsive Behavior", () => {
    it("should adapt to different screen sizes", () => {
      render(() => <Gallery data={mockGalleryData} />);

      const gallery = screen.getByRole("generic");
      expect(gallery).toHaveClass("gallery");
    });

    it("should handle mobile layout", () => {
      // Mock mobile viewport
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 600,
      });

      render(() => <Gallery data={mockGalleryData} />);

      const gallery = screen.getByRole("generic");
      expect(gallery).toBeInTheDocument();
    });
  });
});
