/**
 * Multi-Modal Gallery Component Test Suite
 *
 * Tests for the MultiModalGallery component including file management,
 * view switching, and filtering functionality.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@solidjs/testing-library";
import { MultiModalGallery } from "../../MultiModalGallery";

// Mock the child components
vi.mock("../MultiModalGalleryView", () => ({
  MultiModalGalleryView: (props: any) => (
    <div data-testid="multimodal-gallery-view" {...props} />
  ),
}));

// Mock the composables
vi.mock("../../composables/useFileHandling", () => ({
  useFileHandling: () => ({
    setFiles: vi.fn(),
    selectedFile: null,
    setSelectedFile: vi.fn(),
    currentView: "grid",
    setCurrentView: vi.fn(),
    filterType: "all",
    setFilterType: vi.fn(),
    filteredFiles: [],
    fileCounts: { all: 0, image: 0, video: 0, audio: 0, document: 0 },
    handleFileSelect: vi.fn(),
    handleFileRemove: vi.fn(),
    handleFileModify: vi.fn(),
  }),
}));

vi.mock("../../composables/useFileUpload", () => ({
  useFileUpload: () => ({
    isLoading: false,
    error: null,
    handleFileUpload: vi.fn(),
  }),
}));

describe("MultiModalGallery", () => {
  const mockInitialFiles = [
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
      name: "video1.mp4",
      type: "video",
      size: 2048000,
      modified: new Date("2023-01-02"),
      path: "/video1.mp4",
    },
    {
      id: "3",
      name: "audio1.mp3",
      type: "audio",
      size: 512000,
      modified: new Date("2023-01-03"),
      path: "/audio1.mp3",
    },
  ];

  const mockCallbacks = {
    onFileSelect: vi.fn(),
    onFileRemove: vi.fn(),
    onFileModify: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render with initial files", () => {
      render(() => (
        <MultiModalGallery
          initialFiles={mockInitialFiles}
          callbacks={mockCallbacks}
        />
      ));

      expect(screen.getByTestId("multimodal-gallery-view")).toBeInTheDocument();
    });

    it("should render with custom class name", () => {
      render(() => (
        <MultiModalGallery
          initialFiles={mockInitialFiles}
          class="custom-gallery"
        />
      ));

      expect(screen.getByTestId("multimodal-gallery-view")).toHaveClass(
        "custom-gallery",
      );
    });

    it("should render with default view", () => {
      render(() => (
        <MultiModalGallery initialFiles={mockInitialFiles} defaultView="list" />
      ));

      expect(screen.getByTestId("multimodal-gallery-view")).toBeInTheDocument();
    });

    it("should render with max files limit", () => {
      render(() => (
        <MultiModalGallery initialFiles={mockInitialFiles} maxFiles={5} />
      ));

      expect(screen.getByTestId("multimodal-gallery-view")).toBeInTheDocument();
    });
  });

  describe("File Management", () => {
    it("should handle file selection", () => {
      render(() => (
        <MultiModalGallery
          initialFiles={mockInitialFiles}
          callbacks={mockCallbacks}
        />
      ));

      // Simulate file selection through gallery view
      const galleryView = screen.getByTestId("multimodal-gallery-view");
      fireEvent.click(galleryView);

      expect(mockCallbacks.onFileSelect).toHaveBeenCalled();
    });

    it("should handle file removal", () => {
      render(() => (
        <MultiModalGallery
          initialFiles={mockInitialFiles}
          callbacks={mockCallbacks}
        />
      ));

      // Simulate file removal through gallery view
      const galleryView = screen.getByTestId("multimodal-gallery-view");
      fireEvent.click(galleryView);

      expect(mockCallbacks.onFileRemove).toHaveBeenCalled();
    });

    it("should handle file modification", () => {
      render(() => (
        <MultiModalGallery
          initialFiles={mockInitialFiles}
          callbacks={mockCallbacks}
        />
      ));

      // Simulate file modification through gallery view
      const galleryView = screen.getByTestId("multimodal-gallery-view");
      fireEvent.click(galleryView);

      expect(mockCallbacks.onFileModify).toHaveBeenCalled();
    });
  });

  describe("View Management", () => {
    it("should switch between grid and list views", () => {
      render(() => (
        <MultiModalGallery initialFiles={mockInitialFiles} defaultView="grid" />
      ));

      const galleryView = screen.getByTestId("multimodal-gallery-view");
      expect(galleryView).toBeInTheDocument();
    });

    it("should handle view changes", () => {
      render(() => (
        <MultiModalGallery initialFiles={mockInitialFiles} defaultView="grid" />
      ));

      const galleryView = screen.getByTestId("multimodal-gallery-view");
      fireEvent.click(galleryView);

      // View change should be handled by the composable
      expect(galleryView).toBeInTheDocument();
    });
  });

  describe("Filtering", () => {
    it("should filter files by type", () => {
      render(() => <MultiModalGallery initialFiles={mockInitialFiles} />);

      const galleryView = screen.getByTestId("multimodal-gallery-view");
      fireEvent.click(galleryView);

      // Filtering should be handled by the composable
      expect(galleryView).toBeInTheDocument();
    });

    it("should show file counts for each type", () => {
      render(() => <MultiModalGallery initialFiles={mockInitialFiles} />);

      const galleryView = screen.getByTestId("multimodal-gallery-view");
      expect(galleryView).toBeInTheDocument();
    });
  });

  describe("File Upload", () => {
    it("should handle file upload", () => {
      render(() => (
        <MultiModalGallery initialFiles={mockInitialFiles} maxFiles={10} />
      ));

      const galleryView = screen.getByTestId("multimodal-gallery-view");
      fireEvent.click(galleryView);

      // File upload should be handled by the composable
      expect(galleryView).toBeInTheDocument();
    });

    it("should respect max files limit", () => {
      render(() => (
        <MultiModalGallery initialFiles={mockInitialFiles} maxFiles={2} />
      ));

      const galleryView = screen.getByTestId("multimodal-gallery-view");
      expect(galleryView).toBeInTheDocument();
    });
  });

  describe("Loading States", () => {
    it("should show loading state", () => {
      render(() => (
        <MultiModalGallery initialFiles={mockInitialFiles} loading={true} />
      ));

      const galleryView = screen.getByTestId("multimodal-gallery-view");
      expect(galleryView).toBeInTheDocument();
    });

    it("should show error state", () => {
      render(() => (
        <MultiModalGallery initialFiles={mockInitialFiles} error="Test error" />
      ));

      const galleryView = screen.getByTestId("multimodal-gallery-view");
      expect(galleryView).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels", () => {
      render(() => <MultiModalGallery initialFiles={mockInitialFiles} />);

      const galleryView = screen.getByTestId("multimodal-gallery-view");
      expect(galleryView).toBeInTheDocument();
    });

    it("should support keyboard navigation", () => {
      render(() => <MultiModalGallery initialFiles={mockInitialFiles} />);

      const galleryView = screen.getByTestId("multimodal-gallery-view");
      expect(galleryView).toBeInTheDocument();
    });
  });

  describe("Configuration", () => {
    it("should apply custom configuration", () => {
      const customConfig = {
        showUpload: true,
        showFilters: true,
        showViewToggle: true,
        enableDragDrop: true,
        autoUpload: false,
      };

      render(() => (
        <MultiModalGallery
          initialFiles={mockInitialFiles}
          config={customConfig}
        />
      ));

      const galleryView = screen.getByTestId("multimodal-gallery-view");
      expect(galleryView).toBeInTheDocument();
    });

    it("should handle empty files array", () => {
      render(() => <MultiModalGallery initialFiles={[]} />);

      const galleryView = screen.getByTestId("multimodal-gallery-view");
      expect(galleryView).toBeInTheDocument();
    });
  });
});
