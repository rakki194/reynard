/**
 * Code file type definitions for the Reynard File Processing system.
 *
 * This module defines supported code file extensions, MIME types, and
 * processing capabilities for code files.
 */
/**
 * Supported code file extensions
 */
export const CODE_EXTENSIONS = new Set([
    // Web technologies
    ".html",
    ".htm",
    ".css",
    ".scss",
    ".sass",
    ".less",
    ".js",
    ".ts",
    ".jsx",
    ".tsx",
    // Programming languages
    ".py",
    ".java",
    ".cpp",
    ".c",
    ".h",
    ".hpp",
    ".cs",
    ".php",
    ".rb",
    ".go",
    ".rs",
    ".swift",
    ".kt",
    ".scala",
    ".clj",
    ".hs",
    ".ml",
    ".fs",
    ".v",
    ".zig",
    ".nim",
    // Scripts and configs
    ".sh",
    ".bash",
    ".zsh",
    ".fish",
    ".ps1",
    ".bat",
    ".cmd",
    ".vbs",
    // Build and package files
    ".dockerfile",
    ".dockerignore",
    ".gitignore",
    ".gitattributes",
    ".editorconfig",
    ".eslintrc",
    ".prettierrc",
    ".babelrc",
    ".webpack.config.js",
    ".rollup.config.js",
    ".vite.config.js",
    ".package.json",
    ".requirements.txt",
    ".setup.py",
    ".pyproject.toml",
    ".cargo.toml",
    ".go.mod",
    ".composer.json",
    ".gemfile",
    ".rakefile",
    ".makefile",
    ".cmake",
    ".scons",
    ".bazel",
    ".buck",
    ".gradle",
    ".maven",
    ".pom.xml",
    ".build.xml",
    ".ant",
    ".ivy",
    ".sbt",
    ".build.sbt",
    ".project",
    ".classpath",
    ".settings",
]);
/**
 * Code MIME types mapping
 */
export const CODE_MIME_TYPES = {
    ".html": "text/html",
    ".htm": "text/html",
    ".css": "text/css",
    ".js": "application/javascript",
    ".ts": "application/typescript",
    ".jsx": "text/jsx",
    ".tsx": "text/tsx",
    ".py": "text/x-python",
    ".java": "text/x-java-source",
    ".cpp": "text/x-c++src",
    ".c": "text/x-csrc",
    ".php": "application/x-httpd-php",
    ".rb": "text/x-ruby",
    ".go": "text/x-go",
    ".rs": "text/x-rust",
    ".json": "application/json",
    ".yaml": "text/yaml",
    ".yml": "text/yaml",
    ".toml": "application/toml",
};
/**
 * Get MIME type for a code extension
 */
export function getCodeMimeType(extension) {
    const ext = extension.toLowerCase();
    return CODE_MIME_TYPES[ext] || "text/plain";
}
/**
 * Check if extension is a code file
 */
export function isCodeExtension(extension) {
    return CODE_EXTENSIONS.has(extension.toLowerCase());
}
