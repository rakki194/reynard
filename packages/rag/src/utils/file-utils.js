/**
 * File Utility Functions
 *
 * Utility functions for file handling, language detection, and content processing.
 */
export const getLanguageFromExtension = (ext) => {
    const languageMap = {
        js: "javascript",
        ts: "typescript",
        tsx: "typescript",
        jsx: "javascript",
        py: "python",
        java: "java",
        cpp: "cpp",
        c: "c",
        cs: "csharp",
        php: "php",
        rb: "ruby",
        go: "go",
        rs: "rust",
        swift: "swift",
        kt: "kotlin",
        scala: "scala",
        html: "html",
        css: "css",
        scss: "scss",
        sass: "sass",
        less: "less",
        json: "json",
        xml: "xml",
        yaml: "yaml",
        yml: "yaml",
        md: "markdown",
        sql: "sql",
        sh: "bash",
        bash: "bash",
        zsh: "bash",
        fish: "bash",
    };
    return languageMap[ext] || "text";
};
export const getFileExtension = (fileName) => {
    return fileName.split(".").pop()?.toLowerCase() || "txt";
};
export const downloadFile = (content, fileName) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};
export const copyToClipboard = async (content) => {
    try {
        await navigator.clipboard.writeText(content);
    }
    catch (err) {
        console.error("Failed to copy to clipboard:", err);
        throw err;
    }
};
export const chunkContent = (content, chunkSize = 50) => {
    const lines = content.split("\n");
    const chunks = [];
    for (let i = 0; i < lines.length; i += chunkSize) {
        chunks.push(lines.slice(i, i + chunkSize).join("\n"));
    }
    return chunks;
};
