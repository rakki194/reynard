/**
 * MIME type validation utilities for file security.
 *
 * Handles MIME type validation and file extension checking.
 */

export class MimeTypeValidator {
  private static readonly VALID_MIME_TYPES: Record<string, string[]> = {
    ".jpg": ["image/jpeg"],
    ".jpeg": ["image/jpeg"],
    ".png": ["image/png"],
    ".gif": ["image/gif"],
    ".webp": ["image/webp"],
    ".svg": ["image/svg+xml"],
    ".pdf": ["application/pdf"],
    ".txt": ["text/plain"],
    ".json": ["application/json"],
    ".xml": ["application/xml", "text/xml"],
  };

  private static readonly EXECUTABLE_EXTENSIONS = [
    ".exe",
    ".bat",
    ".cmd",
    ".com",
    ".scr",
    ".pif",
    ".msi",
    ".app",
    ".deb",
    ".rpm",
    ".dmg",
  ];

  private static readonly COMPRESSED_EXTENSIONS = [
    ".zip",
    ".rar",
    ".7z",
    ".tar",
    ".gz",
    ".bz2",
    ".xz",
  ];

  /**
   * Check if MIME type matches extension
   */
  static isValidMimeType(extension: string, mimeType: string): boolean {
    const expectedTypes = this.VALID_MIME_TYPES[extension.toLowerCase()];
    return !expectedTypes || expectedTypes.includes(mimeType);
  }

  /**
   * Check if file is executable
   */
  static isExecutableFile(extension: string): boolean {
    return this.EXECUTABLE_EXTENSIONS.includes(extension.toLowerCase());
  }

  /**
   * Check if file is compressed
   */
  static isCompressedFile(extension: string): boolean {
    return this.COMPRESSED_EXTENSIONS.includes(extension.toLowerCase());
  }
}
