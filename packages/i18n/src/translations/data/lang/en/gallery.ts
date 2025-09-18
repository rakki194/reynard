/**
 * Gallery Package Translations
 * Translations for the Reynard Gallery system
 */

export const galleryTranslations = {
  upload: {
    title: "Upload Files",
    dragDrop: "Drag and drop files here",
    selectFiles: "Select Files",
    progress: "Uploading...",
    complete: "Upload Complete",
    failed: "Upload Failed",
    cancel: "Cancel",
  },
  file: {
    name: "Name",
    size: "Size",
    date: "Date",
    type: "Type",
    actions: "Actions",
    delete: "Delete",
    rename: "Rename",
    move: "Move",
    copy: "Copy",
    download: "Download",
  },
  folder: {
    create: "Create Folder",
    delete: "Delete Folder",
    rename: "Rename Folder",
    move: "Move Folder",
    empty: "Empty Folder",
  },
  view: {
    grid: "Grid View",
    list: "List View",
    thumbnail: "Thumbnail View",
    details: "Details View",
  },
  sort: {
    name: "Name",
    date: "Date",
    size: "Size",
    type: "Type",
    ascending: "Ascending",
    descending: "Descending",
  },
} as const;

export default galleryTranslations;
