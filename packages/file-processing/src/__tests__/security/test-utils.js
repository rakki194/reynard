/**
 * Security Test Utilities
 * Shared utilities for security test modules
 */
import { FileProcessingPipeline } from "../../processing-pipeline";
/**
 * Mock File object for testing
 */
export const createMockFile = (name, size, type) => {
    const file = new File(["test content"], name, { type });
    Object.defineProperty(file, "size", { value: size });
    return file;
};
/**
 * Create a standard FileProcessingPipeline for testing
 */
export const createTestPipeline = (config) => {
    return new FileProcessingPipeline({
        maxFileSize: 10 * 1024 * 1024, // 10MB
        defaultThumbnailSize: [200, 200],
        ...config,
    });
};
/**
 * Common test file configurations
 */
export const TEST_FILES = {
    SAFE: {
        PDF: createMockFile("document.pdf", 1024, "application/pdf"),
        IMAGE_JPG: createMockFile("image.jpg", 1024, "image/jpeg"),
        IMAGE_PNG: createMockFile("image.png", 1024, "image/png"),
        TEXT: createMockFile("text.txt", 1024, "text/plain"),
    },
    DANGEROUS: {
        TRAVERSAL: createMockFile("../../../etc/passwd", 1024, "text/plain"),
        PATH_SEPARATOR: createMockFile("file/name.txt", 1024, "text/plain"),
        HTACCESS: createMockFile(".htaccess", 1024, "text/plain"),
        WEB_CONFIG: createMockFile("web.config", 1024, "text/plain"),
        EMPTY_NAME: createMockFile("", 1024, "text/plain"),
        ZERO_SIZE: createMockFile("test.txt", 0, "text/plain"),
    },
    EXECUTABLE: {
        EXE: createMockFile("malware.exe", 1024, "application/x-msdownload"),
        BAT: createMockFile("script.bat", 1024, "application/x-msdownload"),
        CMD: createMockFile("command.cmd", 1024, "application/x-msdownload"),
        COM: createMockFile("program.com", 1024, "application/x-msdownload"),
        SCR: createMockFile("screensaver.scr", 1024, "application/x-msdownload"),
        MSI: createMockFile("installer.msi", 1024, "application/x-msdownload"),
    },
    COMPRESSED: {
        ZIP: createMockFile("archive.zip", 1024, "application/zip"),
        RAR: createMockFile("archive.rar", 1024, "application/x-rar-compressed"),
        SEVEN_Z: createMockFile("archive.7z", 1024, "application/x-7z-compressed"),
        TAR: createMockFile("archive.tar", 1024, "application/x-tar"),
        GZ: createMockFile("archive.gz", 1024, "application/gzip"),
    },
    UNSUPPORTED: {
        JS: createMockFile("script.js", 1024, "application/javascript"),
        CSS: createMockFile("style.css", 1024, "text/css"),
        HTML: createMockFile("page.html", 1024, "text/html"),
    },
};
