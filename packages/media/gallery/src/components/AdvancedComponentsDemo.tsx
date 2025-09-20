/**
 * Advanced Components Demo
 * Showcases all the advanced components migrated from yipyap
 */

import { Component, createSignal, For } from "solid-js";
import {
  ImageViewer,
  MultiSelect,
  ContextMenu,
  FileUpload,
  type SelectableItem,
  type ContextMenuItem,
  type FileUploadItem,
} from "./index";
import "./AdvancedComponentsDemo.css";

export const AdvancedComponentsDemo: Component = () => {
  // State for demo data
  const [selectedItems, setSelectedItems] = createSignal<SelectableItem[]>([]);
  const [contextMenu, setContextMenu] = createSignal<{
    visible: boolean;
    x: number;
    y: number;
    items: ContextMenuItem[];
  }>({
    visible: false,
    x: 0,
    y: 0,
    items: [],
  });

  // Sample data
  const sampleItems: SelectableItem[] = [
    { id: "1", name: "Document.pdf", type: "file", path: "/documents" },
    { id: "2", name: "Image.jpg", type: "file", path: "/images" },
    { id: "3", name: "Video.mp4", type: "file", path: "/videos" },
    { id: "4", name: "Documents", type: "folder", path: "/documents" },
    { id: "5", name: "Images", type: "folder", path: "/images" },
    { id: "6", name: "Videos", type: "folder", path: "/videos" },
  ];

  const sampleBreadcrumbs = [
    { name: "Home", path: "/", fullPath: "/", clickable: true, icon: "🏠" },
    {
      name: "Media",
      path: "media",
      fullPath: "/media",
      clickable: true,
      icon: "📁",
    },
    {
      name: "Images",
      path: "images",
      fullPath: "/media/images",
      clickable: false,
      icon: "🖼️",
      metadata: {
        itemCount: 42,
        size: "156.7 MB",
        lastModified: "2024-01-15T10:30:00Z",
        type: "folder",
      },
    },
  ];

  // Event handlers
  const handleSelectionChange = (items: SelectableItem[]) => {
    setSelectedItems(items);
    console.log("Selection changed:", items);
  };

  const handleContextMenu = (event: MouseEvent, items: ContextMenuItem[]) => {
    event.preventDefault();
    setContextMenu({
      visible: true,
      x: event.clientX,
      y: event.clientY,
      items,
    });
  };

  const handleContextMenuClose = () => {
    setContextMenu(prev => ({ ...prev, visible: false }));
  };

  const handleFileUpload = (files: File[]) => {
    console.log("Files selected for upload:", files);
  };

  const handleUploadProgress = (item: FileUploadItem) => {
    console.log("Upload progress:", item);
  };

  const handleUploadComplete = (item: FileUploadItem) => {
    console.log("Upload completed:", item);
  };

  const handleUploadError = (item: FileUploadItem, error: string) => {
    console.error("Upload error:", error, item);
  };

  // Context menu items
  const getContextMenuItems = (): ContextMenuItem[] => [
    {
      id: "open",
      label: "Open",
      icon: "📂",
      onClick: () => console.log("Open clicked"),
    },
    {
      id: "edit",
      label: "Edit",
      icon: "✏️",
      onClick: () => console.log("Edit clicked"),
    },
    {
      id: "copy",
      label: "Copy",
      icon: "📋",
      onClick: () => console.log("Copy clicked"),
    },
    {
      id: "move",
      label: "Move to...",
      icon: "📁",
      submenu: [
        {
          id: "documents",
          label: "Documents",
          onClick: () => console.log("Move to Documents"),
        },
        {
          id: "images",
          label: "Images",
          onClick: () => console.log("Move to Images"),
        },
        {
          id: "videos",
          label: "Videos",
          onClick: () => console.log("Move to Videos"),
        },
      ],
    },
    { id: "separator1", label: "", separator: true },
    {
      id: "delete",
      label: "Delete",
      icon: "🗑️",
      onClick: () => console.log("Delete clicked"),
    },
  ];

  // Right-click handler for context menu demo
  const handleRightClick = (event: MouseEvent) => {
    handleContextMenu(event, getContextMenuItems());
  };

  return (
    <div class="reynard-advanced-components-demo">
      <header class="reynard-advanced-components-demo__header">
        <h1>Reynard Advanced Components Demo</h1>
        <p>Showcasing components migrated from yipyap</p>
      </header>

      <div class="reynard-advanced-components-demo__content">
        {/* ImageViewer Demo */}
        <section class="reynard-advanced-components-demo__section">
          <h2>Image Viewer with Zoom & Pan</h2>
          <div class="reynard-advanced-components-demo__component-container">
            <ImageViewer
              src="https://picsum.photos/800/600?random=1"
              alt="Sample image for demo"
              enableZoom={true}
              enablePan={true}
              showZoomControls={true}
              showNavigationControls={true}
              onZoomChange={zoom => console.log("Zoom changed:", zoom)}
              onPanChange={(x, y) => console.log("Pan changed:", x, y)}
            />
          </div>
        </section>

        {/* MultiSelect Demo */}
        <section class="reynard-advanced-components-demo__section">
          <h2>Multi-Select with Keyboard Shortcuts</h2>
          <div class="reynard-advanced-components-demo__component-container">
            <MultiSelect
              items={sampleItems}
              mode="multiple"
              showControls={true}
              showCount={true}
              enableKeyboard={true}
              onSelectionChange={handleSelectionChange}
              onModeChange={mode => console.log("Mode changed:", mode)}
            />
            <div class="reynard-advanced-components-demo__selection-info">
              <p>Selected: {selectedItems().length} items</p>
              <p>Use Ctrl/Cmd + Click for multiple selection, Shift + Click for range selection</p>
            </div>
          </div>
        </section>

        {/* Context Menu Demo */}
        <section class="reynard-advanced-components-demo__section">
          <h2>Context Menu with Submenus</h2>
          <div
            class="reynard-advanced-components-demo__component-container reynard-advanced-components-demo__context-menu-demo"
            onContextMenu={handleRightClick}
          >
            <p>Right-click here to see the context menu</p>
            <p>Features: Icons, submenus, separators, keyboard navigation</p>
          </div>

          <ContextMenu
            visible={contextMenu().visible}
            x={contextMenu().x}
            y={contextMenu().y}
            items={contextMenu().items}
            showIcons={true}
            enableKeyboard={true}
            onClose={handleContextMenuClose}
          />
        </section>

        {/* File Upload Demo */}
        <section class="reynard-advanced-components-demo__section">
          <h2>File Upload with Drag & Drop</h2>
          <div class="reynard-advanced-components-demo__component-container">
            <FileUpload
              enableDragDrop={true}
              multiple={true}
              accept="image/*,.pdf,.doc,.docx"
              maxFileSize={50 * 1024 * 1024} // 50MB
              maxFiles={10}
              showFileList={true}
              showProgress={true}
              autoUpload={false}
              onFilesSelected={handleFileUpload}
              onUploadProgress={handleUploadProgress}
              onUploadComplete={handleUploadComplete}
              onUploadError={handleUploadError}
            />
          </div>
        </section>

        {/* Breadcrumb Navigation Demo */}
        <section class="reynard-advanced-components-demo__section">
          <h2>Enhanced Breadcrumb Navigation</h2>
          <div class="reynard-advanced-components-demo__component-container">
            <div class="reynard-advanced-components-demo__breadcrumb-preview">
              <For each={sampleBreadcrumbs}>
                {(item, index) => (
                  <>
                    {index() > 0 && <span> / </span>}
                    <span>{item.name}</span>
                  </>
                )}
              </For>
            </div>
          </div>
        </section>

        {/* Component Information */}
        <section class="reynard-advanced-components-demo__section">
          <h2>Component Features</h2>
          <div class="reynard-advanced-components-demo__features">
            <div class="reynard-advanced-components-demo__feature">
              <h3>🖼️ ImageViewer</h3>
              <ul>
                <li>Zoom in/out with mouse wheel</li>
                <li>Pan by dragging</li>
                <li>Zoom controls and navigation</li>
                <li>Responsive design</li>
                <li>Accessibility support</li>
              </ul>
            </div>

            <div class="reynard-advanced-components-demo__feature">
              <h3>☑️ MultiSelect</h3>
              <ul>
                <li>Single, multiple, and range selection modes</li>
                <li>Keyboard shortcuts (Ctrl+A, Escape)</li>
                <li>Visual feedback and selection count</li>
                <li>Mode switching controls</li>
                <li>Accessibility compliant</li>
              </ul>
            </div>

            <div class="reynard-advanced-components-demo__feature">
              <h3>📋 ContextMenu</h3>
              <ul>
                <li>Dynamic positioning</li>
                <li>Submenu support</li>
                <li>Keyboard navigation</li>
                <li>Icons and separators</li>
                <li>Click outside to close</li>
              </ul>
            </div>

            <div class="reynard-advanced-components-demo__feature">
              <h3>📁 FileUpload</h3>
              <ul>
                <li>Drag & drop support</li>
                <li>Progress tracking</li>
                <li>File validation</li>
                <li>Multiple file support</li>
                <li>Upload speed and ETA</li>
              </ul>
            </div>

            <div class="reynard-advanced-components-demo__feature">
              <h3>🧭 BreadcrumbNavigation</h3>
              <ul>
                <li>Path navigation</li>
                <li>Metadata display</li>
                <li>Expandable information</li>
                <li>Action buttons</li>
                <li>Responsive design</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
