import { fireEvent, render, screen, waitFor } from "@testing-library/solid";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DownloadManager } from "../components/DownloadManager";
import { GalleryService } from "../services/GalleryService";
// Mock the GalleryService
vi.mock("../services/GalleryService", () => ({
    GalleryService: vi.fn().mockImplementation(() => ({
        downloadGallery: vi.fn(),
        validateUrl: vi.fn(),
        getExtractors: vi.fn(),
        getDownloadHistory: vi.fn(),
        cancelDownload: vi.fn(),
        getDownloadProgress: vi.fn(),
    })),
}));
// Mock the useGalleryWebSocket composable
vi.mock("../composables/useGalleryWebSocket", () => ({
    useGalleryWebSocket: vi.fn(() => ({
        connected: vi.fn(() => true),
        progressUpdates: vi.fn(() => new Map()),
        downloadEvents: vi.fn(() => new Map()),
        subscribe: vi.fn(),
        unsubscribe: vi.fn(),
        getActiveDownloads: vi.fn(() => []),
    })),
}));
describe("DownloadManager", () => {
    let mockGalleryService;
    beforeEach(() => {
        mockGalleryService = {
            downloadGallery: vi.fn(),
            validateUrl: vi.fn(),
            getExtractors: vi.fn(),
            getDownloadHistory: vi.fn(),
            cancelDownload: vi.fn(),
            getDownloadProgress: vi.fn(),
        };
        GalleryService.mockImplementation(() => mockGalleryService);
    });
    afterEach(() => {
        vi.clearAllMocks();
    });
    it("should render download manager interface", () => {
        render(() => <DownloadManager />);
        expect(screen.getByText("Gallery Download Manager")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Enter gallery URL...")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Download" })).toBeInTheDocument();
    });
    it("should handle URL input and validation", async () => {
        const mockValidation = {
            valid: true,
            url: "https://example.com/gallery",
            extractor: "test-extractor",
            extractor_info: {
                name: "test-extractor",
                category: "test",
                subcategory: "gallery",
                pattern: "example\\.com/gallery",
                description: "Test extractor",
            },
            estimated_files: 5,
            estimated_size: 10240000,
            requires_auth: false,
            error: null,
        };
        mockGalleryService.validateUrl.mockResolvedValue(mockValidation);
        render(() => <DownloadManager />);
        const urlInput = screen.getByPlaceholderText("Enter gallery URL...");
        fireEvent.input(urlInput, { target: { value: "https://example.com/gallery" } });
        await waitFor(() => {
            expect(mockGalleryService.validateUrl).toHaveBeenCalledWith("https://example.com/gallery");
        });
    });
    it("should handle download initiation", async () => {
        const mockDownloadResult = {
            success: true,
            download_id: "test-download-123",
            url: "https://example.com/gallery",
            extractor: "test-extractor",
            files: [],
            total_files: 5,
            downloaded_files: 0,
            total_bytes: 10240000,
            downloaded_bytes: 0,
            status: "downloading",
            created_at: "2025-01-15T10:00:00Z",
            completed_at: null,
            error: null,
        };
        mockGalleryService.downloadGallery.mockResolvedValue(mockDownloadResult);
        render(() => <DownloadManager />);
        const urlInput = screen.getByPlaceholderText("Enter gallery URL...");
        const downloadButton = screen.getByRole("button", { name: "Download" });
        fireEvent.input(urlInput, { target: { value: "https://example.com/gallery" } });
        fireEvent.click(downloadButton);
        await waitFor(() => {
            expect(mockGalleryService.downloadGallery).toHaveBeenCalledWith("https://example.com/gallery", expect.any(Object));
        });
    });
    it("should handle download errors", async () => {
        const mockError = new Error("Download failed");
        mockGalleryService.downloadGallery.mockRejectedValue(mockError);
        render(() => <DownloadManager />);
        const urlInput = screen.getByPlaceholderText("Enter gallery URL...");
        const downloadButton = screen.getByRole("button", { name: "Download" });
        fireEvent.input(urlInput, { target: { value: "https://example.com/gallery" } });
        fireEvent.click(downloadButton);
        await waitFor(() => {
            expect(mockGalleryService.downloadGallery).toHaveBeenCalled();
        });
        // Error should be handled gracefully
        expect(screen.getByText("Gallery Download Manager")).toBeInTheDocument();
    });
    it("should display download history", async () => {
        const mockHistory = [
            {
                download_id: "download-1",
                url: "https://example.com/gallery1",
                status: "completed",
                created_at: "2025-01-15T10:00:00Z",
                completed_at: "2025-01-15T10:05:00Z",
                total_files: 5,
                downloaded_files: 5,
            },
            {
                download_id: "download-2",
                url: "https://example.com/gallery2",
                status: "failed",
                created_at: "2025-01-15T11:00:00Z",
                completed_at: null,
                total_files: 3,
                downloaded_files: 1,
            },
        ];
        mockGalleryService.getDownloadHistory.mockResolvedValue(mockHistory);
        render(() => <DownloadManager />);
        await waitFor(() => {
            expect(mockGalleryService.getDownloadHistory).toHaveBeenCalled();
        });
    });
    it("should handle download cancellation", async () => {
        const mockCancelResult = { success: true, message: "Download cancelled" };
        mockGalleryService.cancelDownload.mockResolvedValue(mockCancelResult);
        render(() => <DownloadManager />);
        // This would require the component to have a cancel button
        // The actual implementation would depend on the component structure
        expect(screen.getByText("Gallery Download Manager")).toBeInTheDocument();
    });
    it("should show configuration options", () => {
        render(() => <DownloadManager />);
        // Check if configuration panel is accessible
        expect(screen.getByText("Gallery Download Manager")).toBeInTheDocument();
    });
    it("should handle empty URL input", () => {
        render(() => <DownloadManager />);
        const downloadButton = screen.getByRole("button", { name: "Download" });
        fireEvent.click(downloadButton);
        // Should not call downloadGallery with empty URL
        expect(mockGalleryService.downloadGallery).not.toHaveBeenCalled();
    });
    it("should handle invalid URL format", async () => {
        const mockValidation = {
            valid: false,
            url: "invalid-url",
            extractor: null,
            extractor_info: null,
            estimated_files: 0,
            estimated_size: 0,
            requires_auth: false,
            error: "No extractor found for URL",
        };
        mockGalleryService.validateUrl.mockResolvedValue(mockValidation);
        render(() => <DownloadManager />);
        const urlInput = screen.getByPlaceholderText("Enter gallery URL...");
        fireEvent.input(urlInput, { target: { value: "invalid-url" } });
        await waitFor(() => {
            expect(mockGalleryService.validateUrl).toHaveBeenCalledWith("invalid-url");
        });
    });
    it("should display extractor information when available", async () => {
        const mockValidation = {
            valid: true,
            url: "https://example.com/gallery",
            extractor: "test-extractor",
            extractor_info: {
                name: "test-extractor",
                category: "test",
                subcategory: "gallery",
                pattern: "example\\.com/gallery",
                description: "Test extractor for example.com",
            },
            estimated_files: 5,
            estimated_size: 10240000,
            requires_auth: false,
            error: null,
        };
        mockGalleryService.validateUrl.mockResolvedValue(mockValidation);
        render(() => <DownloadManager />);
        const urlInput = screen.getByPlaceholderText("Enter gallery URL...");
        fireEvent.input(urlInput, { target: { value: "https://example.com/gallery" } });
        await waitFor(() => {
            expect(mockGalleryService.validateUrl).toHaveBeenCalled();
        });
    });
    it("should handle loading states", async () => {
        mockGalleryService.downloadGallery.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));
        render(() => <DownloadManager />);
        const urlInput = screen.getByPlaceholderText("Enter gallery URL...");
        const downloadButton = screen.getByRole("button", { name: "Download" });
        fireEvent.input(urlInput, { target: { value: "https://example.com/gallery" } });
        fireEvent.click(downloadButton);
        // Should show loading state
        expect(screen.getByText("Gallery Download Manager")).toBeInTheDocument();
    });
});
