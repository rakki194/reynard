/**
 * @fileoverview Utility functions for documentation generator
 */
import { promises as fs } from "fs";
import path from "path";
/**
 * Generate a URL-friendly slug from a string
 */
export function generateSlug(text) {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
}
/**
 * Format package name for display
 */
export function formatPackageName(name) {
    // Remove scope if present
    const nameWithoutScope = name.replace(/^@[^/]+\//, "");
    // Convert kebab-case to Title Case
    return nameWithoutScope
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}
/**
 * Check if a file exists
 */
export async function fileExists(filePath) {
    try {
        await fs.access(filePath);
        return true;
    }
    catch {
        return false;
    }
}
/**
 * Read file if it exists
 */
export async function readFileIfExists(filePath) {
    try {
        return await fs.readFile(filePath, "utf-8");
    }
    catch {
        return null;
    }
}
/**
 * Write file with directory creation
 */
export async function writeFileWithDirs(filePath, content) {
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(filePath, content, "utf-8");
}
/**
 * Copy file with directory creation
 */
export async function copyFileWithDirs(src, dest) {
    const dir = path.dirname(dest);
    await fs.mkdir(dir, { recursive: true });
    await fs.copyFile(src, dest);
}
/**
 * Find files matching a pattern
 */
export async function findFiles(dir, pattern, excludePatterns = []) {
    const files = [];
    try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory() &&
                !excludePatterns.some((pattern) => pattern.test(entry.name))) {
                const subFiles = await findFiles(fullPath, pattern, excludePatterns);
                files.push(...subFiles);
            }
            else if (entry.isFile() && pattern.test(entry.name)) {
                files.push(fullPath);
            }
        }
    }
    catch (error) {
        // Ignore errors
    }
    return files;
}
/**
 * Extract title from markdown content
 */
export function extractTitleFromMarkdown(content) {
    const lines = content.split("\n");
    for (const line of lines) {
        const trimmed = line.trim();
        // Look for first heading
        if (trimmed.startsWith("# ")) {
            return trimmed.substring(2).trim();
        }
        // Skip empty lines and frontmatter
        if (trimmed === "" || trimmed.startsWith("---")) {
            continue;
        }
        // Return first non-empty line as title
        return trimmed;
    }
    return null;
}
/**
 * Extract description from markdown content
 */
export function extractDescriptionFromMarkdown(content) {
    const lines = content.split("\n");
    let inFrontmatter = false;
    let description = null;
    for (const line of lines) {
        const trimmed = line.trim();
        // Handle frontmatter
        if (trimmed === "---") {
            inFrontmatter = !inFrontmatter;
            continue;
        }
        if (inFrontmatter && trimmed.startsWith("description:")) {
            description = trimmed
                .substring("description:".length)
                .trim()
                .replace(/^["']|["']$/g, "");
            continue;
        }
        // Look for first paragraph after frontmatter
        if (!inFrontmatter && trimmed && !trimmed.startsWith("#")) {
            return trimmed;
        }
    }
    return description;
}
/**
 * Sanitize filename for filesystem
 */
export function sanitizeFilename(filename) {
    return filename
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
}
/**
 * Get relative path between two files
 */
export function getRelativePath(from, to) {
    return path.relative(path.dirname(from), to);
}
/**
 * Check if a path is within a directory
 */
export function isWithinDirectory(filePath, dirPath) {
    const relative = path.relative(dirPath, filePath);
    return !relative.startsWith("..") && !path.isAbsolute(relative);
}
/**
 * Format file size in human readable format
 */
export function formatFileSize(bytes) {
    const sizes = ["Bytes", "KB", "MB", "GB"];
    if (bytes === 0)
        return "0 Bytes";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
}
/**
 * Format date for display
 */
export function formatDate(date) {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}
/**
 * Format relative time
 */
export function formatRelativeTime(date) {
    const d = typeof date === "string" ? new Date(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diffInSeconds < 60) {
        return "just now";
    }
    else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    }
    else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    }
    else if (diffInSeconds < 2592000) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} day${days > 1 ? "s" : ""} ago`;
    }
    else {
        return formatDate(d);
    }
}
/**
 * Deep merge objects
 */
export function deepMerge(target, source) {
    const result = { ...target };
    for (const key in source) {
        if (source.hasOwnProperty(key)) {
            const sourceValue = source[key];
            const targetValue = result[key];
            if (sourceValue &&
                typeof sourceValue === "object" &&
                !Array.isArray(sourceValue) &&
                targetValue &&
                typeof targetValue === "object" &&
                !Array.isArray(targetValue)) {
                result[key] = deepMerge(targetValue, sourceValue);
            }
            else {
                result[key] = sourceValue;
            }
        }
    }
    return result;
}
/**
 * Debounce function
 */
export function debounce(func, wait) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}
/**
 * Throttle function
 */
export function throttle(func, limit) {
    let inThrottle;
    return (...args) => {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}
/**
 * Retry function with exponential backoff
 */
export async function retry(fn, maxAttempts = 3, baseDelay = 1000) {
    let lastError;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        }
        catch (error) {
            lastError = error;
            if (attempt === maxAttempts) {
                throw lastError;
            }
            const delay = baseDelay * Math.pow(2, attempt - 1);
            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    }
    throw lastError;
}
/**
 * Progress tracker for long-running operations
 */
export class ProgressTracker {
    constructor(total, onProgress) {
        Object.defineProperty(this, "total", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "current", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "onProgress", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.total = total;
        this.current = 0;
        this.onProgress = onProgress;
    }
    increment() {
        this.current++;
        this.onProgress(this.current / this.total);
    }
    setProgress(current) {
        this.current = current;
        this.onProgress(this.current / this.total);
    }
    getProgress() {
        return this.current / this.total;
    }
}
