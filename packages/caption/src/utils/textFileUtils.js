/**
 * Text File Utilities for Reynard Caption System
 *
 * Utility functions for processing text files and detecting language types.
 */
/**
 * Extracts file extension from filename
 */
export const getFileExtension = (filename) => {
    const lastDotIndex = filename.lastIndexOf(".");
    return lastDotIndex !== -1
        ? filename.substring(lastDotIndex).toLowerCase()
        : "";
};
/**
 * Detects programming language based on file extension
 */
export const detectLanguage = (filename, content) => {
    const extension = getFileExtension(filename);
    // Language detection based on file extension
    const languageMap = {
        ".js": "javascript",
        ".ts": "typescript",
        ".tsx": "typescript",
        ".jsx": "javascript",
        ".py": "python",
        ".java": "java",
        ".cpp": "cpp",
        ".c": "c",
        ".cs": "csharp",
        ".php": "php",
        ".rb": "ruby",
        ".go": "go",
        ".rs": "rust",
        ".swift": "swift",
        ".kt": "kotlin",
        ".scala": "scala",
        ".html": "html",
        ".css": "css",
        ".scss": "scss",
        ".sass": "sass",
        ".less": "less",
        ".json": "json",
        ".xml": "xml",
        ".yaml": "yaml",
        ".yml": "yaml",
        ".toml": "toml",
        ".md": "markdown",
        ".txt": "plaintext",
        ".log": "plaintext",
        ".sql": "sql",
        ".sh": "shell",
        ".bash": "shell",
        ".zsh": "shell",
        ".fish": "shell",
        ".ps1": "powershell",
        ".bat": "batch",
        ".dockerfile": "dockerfile",
        ".gitignore": "plaintext",
        ".env": "plaintext",
    };
    return languageMap[extension] || "plaintext";
};
/**
 * Gets appropriate file icon based on extension
 */
export const getFileIcon = (extension) => {
    const iconMap = {
        ".js": "📄",
        ".ts": "📘",
        ".tsx": "📘",
        ".jsx": "📄",
        ".py": "🐍",
        ".java": "☕",
        ".cpp": "⚡",
        ".c": "⚡",
        ".cs": "🔷",
        ".php": "🐘",
        ".rb": "💎",
        ".go": "🐹",
        ".rs": "🦀",
        ".swift": "🐦",
        ".kt": "🟣",
        ".scala": "🔴",
        ".html": "🌐",
        ".css": "🎨",
        ".scss": "🎨",
        ".sass": "🎨",
        ".less": "🎨",
        ".json": "📋",
        ".xml": "📄",
        ".yaml": "📄",
        ".yml": "📄",
        ".toml": "📄",
        ".md": "📝",
        ".txt": "📄",
        ".log": "📋",
        ".sql": "🗄️",
        ".sh": "💻",
        ".bash": "💻",
        ".zsh": "💻",
        ".fish": "🐠",
        ".ps1": "💻",
        ".bat": "💻",
        ".dockerfile": "🐳",
        ".gitignore": "📄",
        ".env": "⚙️",
    };
    return iconMap[extension] || "📄";
};
/**
 * Processes uploaded file and creates TextFile object
 */
export const processTextFile = async (file) => {
    // Read file content
    const content = await file.text();
    // Extract basic metadata
    const metadata = {
        name: file.name,
        size: file.size,
        type: file.type,
        extension: getFileExtension(file.name),
        lineCount: content.split("\n").length,
        wordCount: content.split(/\s+/).filter((word) => word.length > 0).length,
        characterCount: content.length,
        encoding: "utf-8", // Default assumption
        language: detectLanguage(file.name, content),
        lastModified: new Date(file.lastModified),
    };
    const textFile = {
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        type: file.type,
        content,
        metadata,
        uploadedAt: new Date(),
        modifiedAt: new Date(),
    };
    return textFile;
};
