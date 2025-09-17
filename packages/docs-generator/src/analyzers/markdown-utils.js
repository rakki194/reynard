/**
 * @fileoverview Utility helpers for markdown analysis
 */
import path from "path";
export const isMarkdownFile = (fileName) => {
    return fileName.endsWith(".md") || fileName.endsWith(".mdx");
};
export const generateSlugFromPath = (rootPath, filePath) => {
    const relativePath = path.relative(rootPath, filePath);
    const pathWithoutExt = relativePath.replace(/\.(md|mdx)$/, "");
    return pathWithoutExt
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
};
export const extractTitleFromContent = (content) => {
    const lines = content.split("\n");
    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith("# ")) {
            return trimmed.substring(2).trim();
        }
        if (trimmed === "" || trimmed.startsWith("---")) {
            continue;
        }
        return trimmed;
    }
    return null;
};
export const shouldExcludeDirectory = (dirName, excludePatterns) => {
    return excludePatterns.some((pattern) => {
        if (pattern.includes("**")) {
            return dirName.includes(pattern.replace("**/", "").replace("/**", ""));
        }
        return dirName === pattern;
    });
};
