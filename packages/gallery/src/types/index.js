/**
 * Gallery Types and Interfaces
 */
// Default configurations
export const DEFAULT_VIEW_CONFIG = {
  layout: "grid",
  itemsPerRow: 4,
  itemSize: "medium",
  showThumbnails: true,
  showFileNames: true,
  showFileSizes: false,
  showMetadata: false,
  infiniteScroll: true,
};
export const DEFAULT_SORT_CONFIG = {
  field: "name",
  direction: "asc",
};
export const DEFAULT_FILTER_CONFIG = {
  fileTypes: [],
  favoritesOnly: false,
  showHidden: false,
};
export const DEFAULT_UPLOAD_CONFIG = {
  maxFileSize: 100 * 1024 * 1024, // 100MB
  allowedTypes: ["image/*", "video/*", "audio/*", "text/*"],
  multiple: true,
  allowFolders: false,
  generateThumbnails: true,
  uploadUrl: "/api/upload",
};
export const DEFAULT_SELECTION_STATE = {
  selectedIds: new Set(),
  mode: "multiple",
  active: false,
};
export const DEFAULT_GALLERY_THEME = {
  gridBackground: "var(--background)",
  itemBackground: "var(--surface)",
  itemHoverBackground: "var(--surface-hover)",
  selectedBackground: "var(--accent-surface)",
  borderColor: "var(--border)",
  textColor: "var(--text-primary)",
  secondaryTextColor: "var(--text-secondary)",
  accentColor: "var(--accent)",
  errorColor: "var(--error)",
  successColor: "var(--success)",
};
