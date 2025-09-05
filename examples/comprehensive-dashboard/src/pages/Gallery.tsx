import { createSignal, createMemo, For } from "solid-js";
import { Gallery as GalleryComponent } from "@reynard/gallery";
import { Card, Button } from "@reynard/components";
import { useI18n } from "@reynard/core";
import type {
  GalleryData,
  GalleryCallbacks,
  ContextMenuAction,
} from "@reynard/gallery";
import "./Gallery.css";

export function Gallery() {
  const { t } = useI18n();
  const [currentPath, setCurrentPath] = createSignal<string[]>([]);

  // Sample gallery data with proper structure
  const sampleData = createMemo(
    (): GalleryData => ({
      path: "/",
      items: [
        {
          id: "1",
          name: "landscape.jpg",
          type: "image",
          size: 1024000,
          mimeType: "image/jpeg",
          lastModified: new Date("2023-01-15").getTime(),
          path: "/landscape.jpg",
          thumbnailUrl: "https://picsum.photos/200/150?random=1",
          previewUrl: "https://picsum.photos/400/300?random=1",
          downloadUrl: "https://picsum.photos/400/300?random=1",
          favorited: false,
          metadata: {
            width: 1920,
            height: 1080,
            aspectRatio: 16 / 9,
          },
        },
        {
          id: "2",
          name: "Photos",
          type: "folder",
          itemCount: 1,
          lastModified: new Date("2023-01-10").getTime(),
          path: "/Photos",
          favorited: true,
          permissions: {
            read: true,
            write: true,
            delete: true,
            createFolder: true,
          },
        },
        {
          id: "4",
          name: "document.pdf",
          type: "text",
          size: 512000,
          mimeType: "application/pdf",
          lastModified: new Date("2023-01-08").getTime(),
          path: "/document.pdf",
          downloadUrl: "#",
          favorited: false,
        },
        {
          id: "5",
          name: "nature.jpg",
          type: "image",
          size: 1536000,
          mimeType: "image/jpeg",
          lastModified: new Date("2023-01-05").getTime(),
          path: "/nature.jpg",
          thumbnailUrl: "https://picsum.photos/200/150?random=3",
          previewUrl: "https://picsum.photos/400/300?random=3",
          downloadUrl: "https://picsum.photos/400/300?random=3",
          favorited: true,
          metadata: {
            width: 1920,
            height: 1280,
            aspectRatio: 3 / 2,
          },
        },
        {
          id: "6",
          name: "city.jpg",
          type: "image",
          size: 1792000,
          mimeType: "image/jpeg",
          lastModified: new Date("2023-01-03").getTime(),
          path: "/city.jpg",
          thumbnailUrl: "https://picsum.photos/200/150?random=4",
          previewUrl: "https://picsum.photos/400/300?random=4",
          downloadUrl: "https://picsum.photos/400/300?random=4",
          favorited: false,
          metadata: {
            width: 2048,
            height: 1365,
            aspectRatio: 3 / 2,
          },
        },
        {
          id: "7",
          name: "video.mp4",
          type: "video",
          size: 52428800, // 50MB
          mimeType: "video/mp4",
          lastModified: new Date("2023-01-20").getTime(),
          path: "/video.mp4",
          thumbnailUrl: "https://picsum.photos/200/150?random=5",
          previewUrl: "#",
          downloadUrl: "#",
          favorited: false,
          metadata: {
            width: 1920,
            height: 1080,
            duration: 120,
            frameRate: 30,
            aspectRatio: 16 / 9,
          },
        },
        {
          id: "8",
          name: "audio.mp3",
          type: "audio",
          size: 8192000, // 8MB
          mimeType: "audio/mpeg",
          lastModified: new Date("2023-01-18").getTime(),
          path: "/audio.mp3",
          downloadUrl: "#",
          favorited: false,
          metadata: {
            duration: 240,
          },
        },
      ],
      totalItems: 8,
      currentPage: 1,
      itemsPerPage: 20,
      hasMore: false,
      folderMetadata: {
        name: "Root",
        size: 60000000,
        lastModified: new Date("2023-01-20").getTime(),
        permissions: {
          read: true,
          write: true,
          delete: true,
          createFolder: true,
        },
      },
    }),
  );

  // Gallery configuration (commented out for now, can be used later)
  // const galleryConfig: GalleryConfiguration = {
  //   view: {
  //     layout: 'grid',
  //     itemsPerRow: 4,
  //     itemSize: 'medium',
  //     showThumbnails: true,
  //     showFileNames: true,
  //     showFileSizes: true,
  //     showMetadata: true,
  //     infiniteScroll: false
  //   },
  //   sort: {
  //     field: 'name',
  //     direction: 'asc'
  //   },
  //   filter: {
  //     fileTypes: [],
  //     favoritesOnly: false,
  //     showHidden: false
  //   },
  //   upload: {
  //     maxFileSize: 100 * 1024 * 1024, // 100MB
  //     allowedTypes: ['image/*', 'video/*', 'audio/*', 'text/*', 'application/*'],
  //     multiple: true,
  //     allowFolders: true,
  //     generateThumbnails: true,
  //     uploadUrl: '/api/upload'
  //   },
  //   enableKeyboardShortcuts: true,
  //   enableDragAndDrop: true,
  //   enableVirtualScrolling: false
  // };

  // Custom context menu actions
  const contextMenuActions: ContextMenuAction[] = [
    {
      id: "download",
      label: "Download",
      icon: "download",
      handler: (items) => {
        console.log("Downloading items:", items);
        // Implement download logic
      },
    },
    {
      id: "share",
      label: "Share",
      icon: "share",
      handler: (items) => {
        console.log("Sharing items:", items);
        // Implement share logic
      },
    },
    {
      id: "delete",
      label: "Delete",
      icon: "trash",
      destructive: true,
      handler: (items) => {
        console.log("Deleting items:", items);
        // Implement delete logic
      },
    },
  ];

  // Gallery callbacks
  const galleryCallbacks: GalleryCallbacks = {
    onSelectionChange: (items) => {
      console.log("Selection changed:", items.length, "items selected");
    },
    onItemOpen: (item) => {
      console.log("Opening item:", item.name);
      if (item.type === "folder") {
        // Navigate to folder
        const newPath = currentPath().concat(item.name);
        setCurrentPath(newPath);
      } else {
        // Open file in appropriate viewer
        console.log("Opening file:", item.name, "of type:", item.type);
      }
    },
    onItemDoubleClick: (item) => {
      console.log("Double-clicked item:", item.name);
      // Handle double-click (same as single click for now)
      if (item.type === "folder") {
        const newPath = currentPath().concat(item.name);
        setCurrentPath(newPath);
      }
    },
    onNavigate: (path) => {
      console.log("Navigating to path:", path);
      const pathParts = path.split("/").filter(Boolean);
      setCurrentPath(pathParts);
    },
    onUploadStart: (files) => {
      console.log("Upload started:", files.length, "files");
    },
    onUploadProgress: (progress) => {
      console.log("Upload progress:", progress);
    },
    onUploadComplete: (results) => {
      console.log("Upload completed:", results);
    },
    onDelete: (items) => {
      console.log("Deleting items:", items);
    },
    onMove: (_items, destination) => {
      console.log("Moving items to:", destination);
    },
    onCreateFolder: (name, path) => {
      console.log("Creating folder:", name, "at", path);
    },
    onFavorite: (item, favorited) => {
      console.log("Toggling favorite for:", item.name, "to:", favorited);
    },
    onError: (error, details) => {
      console.error("Gallery error:", error, details);
    },
  };

  // Stats computation
  const stats = createMemo(() => {
    const data = sampleData();
    const items = data.items;

    return {
      totalItems: items.length,
      images: items.filter((item) => item.type === "image").length,
      videos: items.filter((item) => item.type === "video").length,
      audio: items.filter((item) => item.type === "audio").length,
      documents: items.filter((item) => item.type === "text").length,
      folders: items.filter((item) => item.type === "folder").length,
      totalSize: items.reduce(
        (sum, item) => sum + (item.type === "folder" ? 0 : item.size),
        0,
      ),
      favorites: items.filter((item) => item.favorited).length,
    };
  });

  // Handle breadcrumb navigation (commented out for now)
  // const handleBreadcrumbClick = (path: string) => {
  //   const pathParts = path.split('/').filter(Boolean);
  //   setCurrentPath(pathParts);
  // };

  // Handle file upload
  const handleFileUpload = (files: File[]) => {
    console.log("Handling file upload:", files);
    // Implement file upload logic
  };

  // Handle view mode change
  const handleViewModeChange = (mode: "grid" | "list" | "masonry") => {
    console.log("Changing view mode to:", mode);
    // Update gallery configuration
  };

  return (
    <div class="gallery-page">
      <div class="gallery-header">
        <h1 class="gallery-title">{t("gallery.title") || "Gallery"}</h1>
        <div class="gallery-actions">
          <Button
            variant="secondary"
            onClick={() => handleViewModeChange("grid")}
          >
            Grid View
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleViewModeChange("list")}
          >
            List View
          </Button>
          <Button
            variant="primary"
            onClick={() => document.getElementById("file-input")?.click()}
          >
            Upload Files
          </Button>
          <input
            id="file-input"
            class="file-input-hidden"
            type="file"
            multiple
            accept="image/*,video/*,audio/*,text/*,application/*"
            aria-label="Select files to upload"
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              if (files.length > 0) {
                handleFileUpload(files);
              }
            }}
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div class="gallery-stats">
        <Card>
          <div class="stat-card">
            <div class="stat-icon stat-icon--images">🖼️</div>
            <div class="stat-content">
              <div class="stat-value">{stats().images}</div>
              <div class="stat-label">Images</div>
            </div>
          </div>
        </Card>

        <Card>
          <div class="stat-card">
            <div class="stat-icon stat-icon--videos">🎥</div>
            <div class="stat-content">
              <div class="stat-value">{stats().videos}</div>
              <div class="stat-label">Videos</div>
            </div>
          </div>
        </Card>

        <Card>
          <div class="stat-card">
            <div class="stat-icon stat-icon--audio">🎵</div>
            <div class="stat-content">
              <div class="stat-value">{stats().audio}</div>
              <div class="stat-label">Audio</div>
            </div>
          </div>
        </Card>

        <Card>
          <div class="stat-card">
            <div class="stat-icon stat-icon--documents">📄</div>
            <div class="stat-content">
              <div class="stat-value">{stats().documents}</div>
              <div class="stat-label">Documents</div>
            </div>
          </div>
        </Card>

        <Card>
          <div class="stat-card">
            <div class="stat-icon stat-icon--folders">📁</div>
            <div class="stat-content">
              <div class="stat-value">{stats().folders}</div>
              <div class="stat-label">Folders</div>
            </div>
          </div>
        </Card>

        <Card>
          <div class="stat-card">
            <div class="stat-icon stat-icon--favorites">⭐</div>
            <div class="stat-content">
              <div class="stat-value">{stats().favorites}</div>
              <div class="stat-label">Favorites</div>
            </div>
          </div>
        </Card>

        <Card>
          <div class="stat-card">
            <div class="stat-icon stat-icon--size">💾</div>
            <div class="stat-content">
              <div class="stat-value">
                {Math.round((stats().totalSize / 1024 / 1024) * 100) / 100}MB
              </div>
              <div class="stat-label">Total Size</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Breadcrumb Navigation */}
      <div class="gallery-breadcrumb">
        <Card>
          <div class="breadcrumb-container">
            <span class="breadcrumb-item breadcrumb-home">🏠 Home</span>
            <For each={currentPath()}>
              {(part, index) => (
                <>
                  <span class="breadcrumb-separator">/</span>
                  <button
                    class="breadcrumb-item breadcrumb-folder"
                    onClick={() => {
                      const newPath = currentPath().slice(0, index() + 1);
                      setCurrentPath(newPath);
                    }}
                  >
                    📁 {part}
                  </button>
                </>
              )}
            </For>
          </div>
        </Card>
      </div>

      {/* Main Gallery */}
      <div class="gallery-main">
        <Card>
          <div class="gallery-container">
            <GalleryComponent
              data={sampleData()}
              callbacks={galleryCallbacks}
              showUpload={true}
              showBreadcrumbs={false}
              showToolbar={true}
              enableKeyboardShortcuts={true}
              enableDragAndDrop={true}
              contextMenuActions={contextMenuActions}
              class="comprehensive-gallery"
            />
          </div>
        </Card>
      </div>

      {/* Current Path Info */}
      <div class="gallery-info">
        <Card>
          <div class="info-content">
            <h3>Current Location</h3>
            <p>Path: /{currentPath().join("/") || "Root"}</p>
            <p>Total Items: {stats().totalItems}</p>
            <p>Current View: Grid Layout</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
