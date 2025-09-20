/**
 * Gallery package translations
 * File and media gallery interface translations
 */

export interface GalleryTranslations {
  upload: {
    title: string;
    dragDrop: string;
    selectFiles: string;
    progress: string;
    complete: string;
    failed: string;
    cancel: string;
  };
  file: {
    name: string;
    size: string;
    date: string;
    type: string;
    actions: string;
    delete: string;
    rename: string;
    move: string;
    copy: string;
    download: string;
  };
  folder: {
    create: string;
    delete: string;
    rename: string;
    move: string;
    empty: string;
  };
  view: {
    grid: string;
    list: string;
    thumbnail: string;
    details: string;
  };
  sort: {
    name: string;
    date: string;
    size: string;
    type: string;
    ascending: string;
    descending: string;
  };
}
