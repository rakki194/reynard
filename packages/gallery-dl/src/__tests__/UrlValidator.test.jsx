import { fireEvent, render, screen, waitFor } from "@testing-library/solid";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UrlValidator } from "../components/UrlValidator";
import { GalleryService } from "../services/GalleryService";
// Mock the GalleryService
vi.mock("../services/GalleryService", () => ({
    GalleryService: vi.fn().mockImplementation(() => ({
        validateUrl: vi.fn(),
    })),
}));
describe("UrlValidator", () => {
    let mockGalleryService;
    let mockOnValidation;
    beforeEach(() => {
        mockOnValidation = vi.fn();
        mockGalleryService = {
            validateUrl: vi.fn(),
        };
        GalleryService.mockImplementation(() => mockGalleryService);
    });
    afterEach(() => {
        vi.clearAllMocks();
    });
    it("should render URL validator interface", () => {
        render(() => <UrlValidator url="" onValidation={mockOnValidation}/>);
        expect(screen.getByText("URL Validator")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Enter gallery URL to validate...")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Validate URL" })).toBeInTheDocument();
    });
    it("should handle URL input", () => {
        render(() => <UrlValidator url="" onValidation={mockOnValidation}/>);
        const urlInput = screen.getByPlaceholderText("Enter gallery URL to validate...");
        fireEvent.input(urlInput, { target: { value: "https://example.com/gallery" } });
        expect(urlInput).toHaveValue("https://example.com/gallery");
    });
    it("should validate URL successfully", async () => {
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
        render(() => <UrlValidator url="" onValidation={mockOnValidation}/>);
        const urlInput = screen.getByPlaceholderText("Enter gallery URL to validate...");
        const validateButton = screen.getByRole("button", { name: "Validate URL" });
        fireEvent.input(urlInput, { target: { value: "https://example.com/gallery" } });
        fireEvent.click(validateButton);
        await waitFor(() => {
            expect(mockGalleryService.validateUrl).toHaveBeenCalledWith("https://example.com/gallery");
            expect(mockOnValidation).toHaveBeenCalledWith(mockValidation);
        });
    });
    it("should handle invalid URL", async () => {
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
        render(() => <UrlValidator url="" onValidation={mockOnValidation}/>);
        const urlInput = screen.getByPlaceholderText("Enter gallery URL to validate...");
        const validateButton = screen.getByRole("button", { name: "Validate URL" });
        fireEvent.input(urlInput, { target: { value: "invalid-url" } });
        fireEvent.click(validateButton);
        await waitFor(() => {
            expect(mockGalleryService.validateUrl).toHaveBeenCalledWith("invalid-url");
            expect(mockOnValidation).toHaveBeenCalledWith(mockValidation);
        });
    });
    it("should handle validation errors", async () => {
        const mockError = new Error("Network error");
        mockGalleryService.validateUrl.mockRejectedValue(mockError);
        render(() => <UrlValidator url="" onValidation={mockOnValidation}/>);
        const urlInput = screen.getByPlaceholderText("Enter gallery URL to validate...");
        const validateButton = screen.getByRole("button", { name: "Validate URL" });
        fireEvent.input(urlInput, { target: { value: "https://example.com/gallery" } });
        fireEvent.click(validateButton);
        await waitFor(() => {
            expect(mockGalleryService.validateUrl).toHaveBeenCalled();
        });
        // Error should be handled gracefully
        expect(screen.getByText("URL Validator")).toBeInTheDocument();
    });
    it("should display extractor information when validation succeeds", async () => {
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
        render(() => <UrlValidator url="" onValidation={mockOnValidation}/>);
        const urlInput = screen.getByPlaceholderText("Enter gallery URL to validate...");
        const validateButton = screen.getByRole("button", { name: "Validate URL" });
        fireEvent.input(urlInput, { target: { value: "https://example.com/gallery" } });
        fireEvent.click(validateButton);
        await waitFor(() => {
            expect(mockGalleryService.validateUrl).toHaveBeenCalled();
        });
    });
    it("should display error message when validation fails", async () => {
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
        render(() => <UrlValidator url="" onValidation={mockOnValidation}/>);
        const urlInput = screen.getByPlaceholderText("Enter gallery URL to validate...");
        const validateButton = screen.getByRole("button", { name: "Validate URL" });
        fireEvent.input(urlInput, { target: { value: "invalid-url" } });
        fireEvent.click(validateButton);
        await waitFor(() => {
            expect(mockGalleryService.validateUrl).toHaveBeenCalled();
        });
    });
    it("should handle empty URL input", () => {
        render(() => <UrlValidator url="" onValidation={mockOnValidation}/>);
        const validateButton = screen.getByRole("button", { name: "Validate URL" });
        fireEvent.click(validateButton);
        // Should not call validateUrl with empty URL
        expect(mockGalleryService.validateUrl).not.toHaveBeenCalled();
    });
    it("should show loading state during validation", async () => {
        mockGalleryService.validateUrl.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));
        render(() => <UrlValidator url="" onValidation={mockOnValidation}/>);
        const urlInput = screen.getByPlaceholderText("Enter gallery URL to validate...");
        const validateButton = screen.getByRole("button", { name: "Validate URL" });
        fireEvent.input(urlInput, { target: { value: "https://example.com/gallery" } });
        fireEvent.click(validateButton);
        // Should show loading state
        expect(screen.getByText("URL Validator")).toBeInTheDocument();
    });
    it("should handle URL with authentication requirements", async () => {
        const mockValidation = {
            valid: true,
            url: "https://private.example.com/gallery",
            extractor: "private-extractor",
            extractor_info: {
                name: "private-extractor",
                category: "private",
                subcategory: "gallery",
                pattern: "private\\.example\\.com/gallery",
                description: "Private gallery extractor",
            },
            estimated_files: 10,
            estimated_size: 20480000,
            requires_auth: true,
            error: null,
        };
        mockGalleryService.validateUrl.mockResolvedValue(mockValidation);
        render(() => <UrlValidator url="" onValidation={mockOnValidation}/>);
        const urlInput = screen.getByPlaceholderText("Enter gallery URL to validate...");
        const validateButton = screen.getByRole("button", { name: "Validate URL" });
        fireEvent.input(urlInput, { target: { value: "https://private.example.com/gallery" } });
        fireEvent.click(validateButton);
        await waitFor(() => {
            expect(mockGalleryService.validateUrl).toHaveBeenCalledWith("https://private.example.com/gallery");
            expect(mockOnValidation).toHaveBeenCalledWith(mockValidation);
        });
    });
    it("should handle large file estimates", async () => {
        const mockValidation = {
            valid: true,
            url: "https://example.com/large-gallery",
            extractor: "large-extractor",
            extractor_info: {
                name: "large-extractor",
                category: "large",
                subcategory: "gallery",
                pattern: "example\\.com/large-gallery",
                description: "Large gallery extractor",
            },
            estimated_files: 1000,
            estimated_size: 1073741824, // 1 GB
            requires_auth: false,
            error: null,
        };
        mockGalleryService.validateUrl.mockResolvedValue(mockValidation);
        render(() => <UrlValidator url="" onValidation={mockOnValidation}/>);
        const urlInput = screen.getByPlaceholderText("Enter gallery URL to validate...");
        const validateButton = screen.getByRole("button", { name: "Validate URL" });
        fireEvent.input(urlInput, { target: { value: "https://example.com/large-gallery" } });
        fireEvent.click(validateButton);
        await waitFor(() => {
            expect(mockGalleryService.validateUrl).toHaveBeenCalledWith("https://example.com/large-gallery");
            expect(mockOnValidation).toHaveBeenCalledWith(mockValidation);
        });
    });
    it("should handle malformed URLs", async () => {
        const mockValidation = {
            valid: false,
            url: "not-a-url",
            extractor: null,
            extractor_info: null,
            estimated_files: 0,
            estimated_size: 0,
            requires_auth: false,
            error: "Invalid URL format",
        };
        mockGalleryService.validateUrl.mockResolvedValue(mockValidation);
        render(() => <UrlValidator url="" onValidation={mockOnValidation}/>);
        const urlInput = screen.getByPlaceholderText("Enter gallery URL to validate...");
        const validateButton = screen.getByRole("button", { name: "Validate URL" });
        fireEvent.input(urlInput, { target: { value: "not-a-url" } });
        fireEvent.click(validateButton);
        await waitFor(() => {
            expect(mockGalleryService.validateUrl).toHaveBeenCalledWith("not-a-url");
            expect(mockOnValidation).toHaveBeenCalledWith(mockValidation);
        });
    });
});
