/**
 * File Utilities
 *
 * Helper functions for file operations and management.
 */

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || '';
};

export const getFileType = (filename: string): 'image' | 'video' | 'audio' | 'document' | 'other' => {
  const ext = getFileExtension(filename);
  
  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'ico'];
  const videoExts = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', 'm4v'];
  const audioExts = ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a'];
  const docExts = ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'];
  
  if (imageExts.includes(ext)) return 'image';
  if (videoExts.includes(ext)) return 'video';
  if (audioExts.includes(ext)) return 'audio';
  if (docExts.includes(ext)) return 'document';
  
  return 'other';
};

export const sanitizeFilename = (filename: string): string => {
  return filename
    .replace(/[<>:"/\\|?*]/g, '_')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
};

export const generateUniqueFilename = (filename: string, existingFiles: string[]): string => {
  const ext = getFileExtension(filename);
  const baseName = filename.replace(`.${ext}`, '');
  const sanitized = sanitizeFilename(baseName);
  
  let counter = 1;
  let newFilename = `${sanitized}.${ext}`;
  
  while (existingFiles.includes(newFilename)) {
    newFilename = `${sanitized}_${counter}.${ext}`;
    counter++;
  }
  
  return newFilename;
};
