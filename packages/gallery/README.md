# @reynard/gallery

Advanced file and media management system for SolidJS applications with drag-and-drop, responsive grids, and comprehensive file handling.

## 🚀 Features

- **📁 File Management**: Complete file browser with folder navigation
- **🖼️ Media Support**: Images, videos, audio, text, and document preview
- **📱 Responsive Grid**: Adaptive layouts (grid, list, masonry) with virtual scrolling
- **⬆️ File Upload**: Drag-and-drop upload with progress tracking and validation
- **🔍 Search & Filter**: Real-time search with advanced filtering options
- **⭐ Favorites**: Mark files as favorites with persistent storage
- **🎯 Selection**: Multi-select with keyboard shortcuts and context menus
- **🎨 Theming**: Seamless integration with Reynard's theme system
- **♿ Accessibility**: Screen reader friendly with keyboard navigation
- **⚡ Performance**: Optimized for large file collections with lazy loading

## 📦 Installation

```bash
npm install @reynard/gallery @reynard/core @reynard/components solid-js
```

## 🎯 Quick Start

```tsx
import { Gallery } from '@reynard/gallery';
import type { GalleryData } from '@reynard/gallery';

function FileManager() {
  const [galleryData, setGalleryData] = createSignal<GalleryData>({
    path: "/documents",
    items: [
      {
        id: "1",
        name: "presentation.pdf",
        type: "text",
        size: 2048576,
        lastModified: Date.now(),
        path: "/documents/presentation.pdf",
        thumbnailUrl: "/thumbnails/presentation.jpg"
      },
      {
        id: "2", 
        name: "photos",
        type: "folder",
        size: 0,
        lastModified: Date.now(),
        path: "/documents/photos",
        itemCount: 24
      }
    ],
    totalItems: 2
  });

  return (
    <Gallery
      data={galleryData()}
      showUpload={true}
      showBreadcrumbs={true}
      callbacks={{
        onNavigate: (path) => {
          console.log('Navigate to:', path);
          // Fetch new data for path
        },
        onItemOpen: (item) => {
          console.log('Open item:', item.name);
          // Handle file opening
        },
        onUploadComplete: (results) => {
          console.log('Upload complete:', results);
          // Refresh gallery data
        }
      }}
    />
  );
}
```

## 📚 Components

### Gallery

Complete file gallery with all features integrated.

```tsx
<Gallery
  data={galleryData}
  view={{
    layout: "grid",
    itemSize: "medium", 
    showThumbnails: true,
    showFileNames: true
  }}
  sort={{
    field: "name",
    direction: "asc"
  }}
  filter={{
    fileTypes: ["image/*", "video/*"],
    searchQuery: "vacation"
  }}
  upload={{
    maxFileSize: 100 * 1024 * 1024, // 100MB
    allowedTypes: ["image/*", "video/*"],
    multiple: true
  }}
  callbacks={{
    onNavigate: handleNavigation,
    onItemOpen: handleItemOpen,
    onSelectionChange: handleSelection
  }}
/>
```

### GalleryGrid

Responsive grid component for displaying files and folders.

```tsx
<GalleryGrid
  items={items}
  viewConfig={{
    layout: "masonry",
    itemSize: "large",
    showThumbnails: true,
    showMetadata: true
  }}
  selectionState={selectionState}
  onItemClick={handleItemClick}
  onSelectionChange={handleSelectionChange}
/>
```

### FileUploadZone

Drag-and-drop file upload area with progress tracking.

```tsx
<FileUploadZone
  config={{
    maxFileSize: 50 * 1024 * 1024,
    allowedTypes: ["image/*", "application/pdf"],
    multiple: true
  }}
  uploading={isUploading}
  uploads={uploadProgress}
  onUpload={handleFileUpload}
  onCancelUpload={handleCancelUpload}
  enableDragDrop={true}
/>
```

### BreadcrumbNavigation

Hierarchical navigation for folder paths.

```tsx
<BreadcrumbNavigation
  breadcrumbs={[
    { path: "", label: "Home", clickable: true },
    { path: "/documents", label: "Documents", clickable: true },
    { path: "/documents/projects", label: "Projects", clickable: false }
  ]}
  onNavigate={handleNavigate}
  showUpButton={true}
/>
```

## 🎛️ Configuration

### View Configuration

```typescript
const viewConfig: ViewConfiguration = {
  layout: "grid", // "grid" | "list" | "masonry"
  itemsPerRow: 4,
  itemSize: "medium", // "small" | "medium" | "large" | "xl"
  showThumbnails: true,
  showFileNames: true,
  showFileSizes: false,
  showMetadata: true,
  infiniteScroll: true
};
```

### Upload Configuration

```typescript
const uploadConfig: UploadConfiguration = {
  maxFileSize: 100 * 1024 * 1024, // 100MB
  maxTotalSize: 500 * 1024 * 1024, // 500MB total
  allowedTypes: [
    "image/*",
    "video/*", 
    "audio/*",
    "application/pdf",
    "text/*"
  ],
  multiple: true,
  allowFolders: false,
  generateThumbnails: true,
  uploadUrl: "/api/upload",
  headers: {
    "Authorization": "Bearer " + token
  }
};
```

### Filter Configuration

```typescript
const filterConfig: FilterConfiguration = {
  fileTypes: ["image/*", "video/*"],
  dateRange: {
    start: new Date("2024-01-01"),
    end: new Date()
  },
  sizeRange: {
    min: 1024, // 1KB
    max: 10 * 1024 * 1024 // 10MB
  },
  searchQuery: "vacation photos",
  favoritesOnly: false,
  showHidden: false
};
```

## 🎨 Theming

The gallery automatically adapts to your application's theme using CSS custom properties:

```css
:root {
  --background: #ffffff;
  --surface: #f8f9fa;
  --surface-hover: #e9ecef;
  --accent: #007bff;
  --accent-surface: rgba(0, 123, 255, 0.1);
  --border: #dee2e6;
  --text-primary: #212529;
  --text-secondary: #6c757d;
  --error: #dc3545;
  --success: #28a745;
}

[data-theme="dark"] {
  --background: #1a1a1a;
  --surface: #2d2d2d;
  --surface-hover: #404040;
  --accent: #4dabf7;
  --accent-surface: rgba(77, 171, 247, 0.1);
  --border: #404040;
  --text-primary: #ffffff;
  --text-secondary: #adb5bd;
  --error: #ff6b6b;
  --success: #51cf66;
}
```

## 🔧 Composables

### useGalleryState

Manages gallery view state, selection, and configuration.

```tsx
function CustomGallery() {
  const galleryState = useGalleryState({
    initialConfig: {
      view: { layout: "grid", itemSize: "medium" },
      sort: { field: "name", direction: "asc" }
    },
    callbacks: {
      onNavigate: handleNavigate,
      onSelectionChange: handleSelection
    },
    persistState: true
  });

  return (
    <div>
      <div>Selected: {galleryState.selectedItems().length} items</div>
      <GalleryGrid
        items={galleryState.items()}
        viewConfig={galleryState.viewConfig()}
        selectionState={galleryState.selectionState()}
        onSelectionChange={galleryState.selectItem}
      />
    </div>
  );
}
```

### useFileUpload

Handles file uploads with progress tracking and validation.

```tsx
function FileUploadExample() {
  const fileUpload = useFileUpload({
    config: {
      maxFileSize: 50 * 1024 * 1024,
      allowedTypes: ["image/*"],
      uploadUrl: "/api/upload"
    },
    callbacks: {
      onUploadStart: (files) => console.log('Starting upload:', files.length),
      onUploadProgress: (progress) => console.log('Progress:', progress),
      onUploadComplete: (results) => console.log('Complete:', results)
    }
  });

  return (
    <div>
      <input
        type="file"
        multiple
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          fileUpload.uploadFiles(files);
        }}
      />
      
      <div>
        {fileUpload.uploads().map(upload => (
          <div key={upload.id}>
            {upload.file.name}: {upload.progress}%
            {upload.status === "uploading" && (
              <button onClick={() => fileUpload.cancelUpload(upload.id)}>
                Cancel
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

## 📊 Data Types

### FileItem

```typescript
interface FileItem {
  id: string;
  name: string;
  type: "image" | "video" | "audio" | "text" | "unknown";
  size: number;
  mimeType?: string;
  lastModified: number;
  path: string;
  thumbnailUrl?: string;
  previewUrl?: string;
  downloadUrl?: string;
  selected?: boolean;
  favorited?: boolean;
  metadata?: FileMetadata;
}
```

### GalleryData

```typescript
interface GalleryData {
  path: string;
  items: (FileItem | FolderItem)[];
  totalItems: number;
  currentPage?: number;
  itemsPerPage?: number;
  hasMore?: boolean;
  folderMetadata?: {
    name: string;
    size: number;
    lastModified: number;
    permissions: FolderPermissions;
  };
}
```

## ⚡ Performance

### Virtual Scrolling

For large file collections, enable virtual scrolling:

```tsx
<Gallery
  data={largeDataset}
  enableVirtualScrolling={true}
  view={{
    layout: "list", // Works best with list layout
    itemSize: "small"
  }}
/>
```

### Lazy Loading

Images and thumbnails are loaded lazily by default:

```tsx
// Thumbnails load as they come into view
<img
  src={item.thumbnailUrl}
  loading="lazy"
  alt={item.name}
/>
```

### Debounced Search

Search and filtering are automatically debounced:

```tsx
const galleryState = useGalleryState({
  // Search is debounced by 300ms by default
  callbacks: {
    onSearch: debounce(handleSearch, 300)
  }
});
```

## 🛠️ Advanced Usage

### Custom Context Menu

```tsx
<Gallery
  data={data}
  contextMenuActions={[
    {
      id: "download",
      label: "Download",
      icon: "download",
      handler: (items) => downloadFiles(items)
    },
    {
      id: "delete",
      label: "Delete",
      icon: "trash",
      destructive: true,
      handler: (items) => deleteFiles(items)
    }
  ]}
/>
```

### Custom File Icons

```tsx
// Override default file icon logic
const getCustomFileIcon = (item: FileItem) => {
  switch (item.type) {
    case "image": return "📸";
    case "video": return "🎬"; 
    case "audio": return "🎵";
    case "text": return "📄";
    default: return "📎";
  }
};
```

### Integration with Backend

```tsx
function BackendIntegratedGallery() {
  const [data, { mutate, refetch }] = createResource(
    () => currentPath(),
    async (path) => {
      const response = await fetch(`/api/files?path=${encodeURIComponent(path)}`);
      return response.json();
    }
  );

  return (
    <Gallery
      data={data()}
      loading={data.loading}
      callbacks={{
        onNavigate: setCurrentPath,
        onUploadComplete: () => refetch(),
        onDelete: async (items) => {
          await deleteFiles(items);
          refetch();
        }
      }}
    />
  );
}
```

## 📱 Mobile Support

The gallery is fully responsive and touch-friendly:

- **Touch Gestures**: Swipe to navigate, pinch to zoom
- **Mobile Upload**: Supports camera capture and file selection
- **Responsive Grid**: Automatically adjusts column count
- **Touch Selection**: Long press to start multi-select mode

```tsx
<Gallery
  data={data}
  view={{
    layout: "grid",
    itemsPerRow: undefined, // Auto-calculate for screen size
    itemSize: "medium"
  }}
  // Mobile-optimized upload
  upload={{
    allowedTypes: ["image/*", "video/*"],
    multiple: true
  }}
/>
```

## 🤝 Integration Examples

### With File System API

```tsx
async function openDirectoryPicker() {
  if ('showDirectoryPicker' in window) {
    const dirHandle = await window.showDirectoryPicker();
    const files = await processDirectoryHandle(dirHandle);
    setGalleryData({ path: dirHandle.name, items: files });
  }
}
```

### With Cloud Storage

```tsx
// Integrate with cloud storage providers
const cloudGallery = useGalleryState({
  callbacks: {
    onNavigate: async (path) => {
      const data = await cloudStorage.listFiles(path);
      galleryState.updateData(data);
    },
    onUpload: async (files) => {
      return await cloudStorage.uploadFiles(files, currentPath());
    }
  }
});
```

## 🧪 Testing

The gallery includes comprehensive test utilities:

```tsx
import { render, screen } from '@solidjs/testing-library';
import { Gallery } from '@reynard/gallery';

test('displays files in grid layout', () => {
  const mockData = {
    path: "/test",
    items: [
      { id: "1", name: "test.jpg", type: "image", size: 1024, lastModified: Date.now(), path: "/test.jpg" }
    ],
    totalItems: 1
  };

  render(() => <Gallery data={mockData} />);
  
  expect(screen.getByText("test.jpg")).toBeInTheDocument();
});
```

## 🤝 Contributing

See the main [Reynard repository](../../README.md) for contribution guidelines.

---

**Built with ❤️ for modern file management in SolidJS applications** 📁🦊
