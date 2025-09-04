# Advanced Components Migrated from Yipyap

This document describes the advanced components that have been successfully migrated from the yipyap codebase to reynard, providing enhanced functionality for the gallery system.

## 🖼️ ImageViewer Component

A sophisticated image viewer with zoom, pan, and navigation capabilities.

### Features

- **Zoom Controls**: Mouse wheel zoom with configurable min/max limits
- **Pan Support**: Drag to pan around the image
- **Navigation Controls**: Reset, fit-to-view, and manual zoom buttons
- **Responsive Design**: Adapts to different screen sizes
- **Accessibility**: Keyboard navigation and screen reader support
- **Dark Theme**: Automatic dark mode detection and styling

### Usage

```tsx
import { ImageViewer } from "@reynard/gallery";

<ImageViewer
  src="/path/to/image.jpg"
  alt="Image description"
  initialZoom={1.0}
  minZoom={0.1}
  maxZoom={10.0}
  enablePan={true}
  enableZoom={true}
  showZoomControls={true}
  showNavigationControls={true}
  onZoomChange={(zoom) => console.log("Zoom:", zoom)}
  onPanChange={(x, y) => console.log("Pan:", x, y)}
/>;
```

### Props

- `src`: Image source URL
- `alt`: Alt text for accessibility
- `initialZoom`: Starting zoom level (default: 1.0)
- `minZoom`: Minimum zoom level (default: 0.1)
- `maxZoom`: Maximum zoom level (default: 10.0)
- `enablePan`: Enable panning (default: true)
- `enableZoom`: Enable zooming (default: true)
- `showZoomControls`: Show zoom buttons (default: true)
- `showNavigationControls`: Show navigation buttons (default: true)
- `onZoomChange`: Zoom change callback
- `onPanChange`: Pan change callback

## ☑️ MultiSelect Component

Advanced multi-selection system with keyboard shortcuts and visual feedback.

### Features

- **Selection Modes**: Single, multiple, and range selection
- **Keyboard Shortcuts**: Ctrl+A (select all), Escape (clear selection)
- **Visual Feedback**: Checkboxes, selection count, and hover states
- **Mode Switching**: Dynamic selection mode changes
- **Accessibility**: ARIA labels and keyboard navigation
- **Responsive Design**: Mobile-friendly interface

### Usage

```tsx
import { MultiSelect, type SelectableItem } from "@reynard/gallery";

const items: SelectableItem[] = [
  { id: "1", name: "Document.pdf", type: "file", path: "/documents" },
  { id: "2", name: "Images", type: "folder", path: "/images" },
];

<MultiSelect
  items={items}
  mode="multiple"
  showControls={true}
  showCount={true}
  enableKeyboard={true}
  onSelectionChange={(selected) => console.log("Selected:", selected)}
  onModeChange={(mode) => console.log("Mode:", mode)}
/>;
```

### Props

- `items`: Array of selectable items
- `mode`: Selection mode ('single', 'multiple', 'range')
- `showControls`: Show selection controls (default: true)
- `showCount`: Show selection count (default: true)
- `enableKeyboard`: Enable keyboard shortcuts (default: true)
- `onSelectionChange`: Selection change callback
- `onModeChange`: Mode change callback

### Keyboard Shortcuts

- `Ctrl/Cmd + Click`: Toggle item selection
- `Shift + Click`: Range selection
- `Ctrl/Cmd + A`: Select all items
- `Escape`: Clear all selections

## 📋 ContextMenu Component

Dynamic context menu with positioning, submenus, and keyboard navigation.

### Features

- **Dynamic Positioning**: Automatically positions relative to click location
- **Submenu Support**: Nested menu items with hover activation
- **Keyboard Navigation**: Arrow keys, Enter, Escape support
- **Icons & Separators**: Visual enhancements and organization
- **Click Outside**: Automatic closing when clicking elsewhere
- **Accessibility**: ARIA labels and keyboard support

### Usage

```tsx
import { ContextMenu, type ContextMenuItem } from "@reynard/gallery";

const menuItems: ContextMenuItem[] = [
  {
    id: "open",
    label: "Open",
    icon: "📂",
    onClick: () => console.log("Open clicked"),
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
    ],
  },
  { id: "separator", separator: true },
  {
    id: "delete",
    label: "Delete",
    icon: "🗑️",
    onClick: () => console.log("Delete clicked"),
  },
];

<ContextMenu
  visible={showMenu}
  x={menuX}
  y={menuY}
  items={menuItems}
  showIcons={true}
  enableKeyboard={true}
  onClose={() => setShowMenu(false)}
/>;
```

### Props

- `visible`: Whether menu is visible
- `x`: X position for menu
- `y`: Y position for menu
- `items`: Array of menu items
- `showIcons`: Show item icons (default: true)
- `enableKeyboard`: Enable keyboard navigation (default: true)
- `onClose`: Menu close callback

### Keyboard Navigation

- `Arrow Up/Down`: Navigate menu items
- `Arrow Right`: Open submenu
- `Enter/Space`: Activate item
- `Escape`: Close menu

## 📁 FileUpload Component

Advanced file upload with drag & drop, progress tracking, and validation.

### Features

- **Drag & Drop**: Visual feedback and file handling
- **Progress Tracking**: Real-time upload progress with speed and ETA
- **File Validation**: Size limits, type restrictions, and count limits
- **Multiple Files**: Batch upload support
- **Visual Feedback**: Progress bars, status indicators, and error handling
- **Responsive Design**: Mobile-friendly interface

### Usage

```tsx
import { FileUpload, type FileUploadItem } from "@reynard/gallery";

<FileUpload
  enableDragDrop={true}
  multiple={true}
  accept="image/*,.pdf,.doc,.docx"
  maxFileSize={50 * 1024 * 1024} // 50MB
  maxFiles={10}
  showFileList={true}
  showProgress={true}
  autoUpload={false}
  uploadUrl="/api/upload"
  onFilesSelected={(files) => console.log("Files:", files)}
  onUploadProgress={(item) => console.log("Progress:", item)}
  onUploadComplete={(item) => console.log("Complete:", item)}
  onUploadError={(item, error) => console.error("Error:", error)}
/>;
```

### Props

- `enableDragDrop`: Enable drag & drop (default: true)
- `multiple`: Allow multiple files (default: true)
- `accept`: Accepted file types
- `maxFileSize`: Maximum file size in bytes
- `maxFiles`: Maximum number of files
- `showFileList`: Show file list (default: true)
- `showProgress`: Show progress bars (default: true)
- `autoUpload`: Auto-upload files (default: false)
- `uploadUrl`: Upload endpoint URL
- `headers`: Additional upload headers
- `onFilesSelected`: Files selected callback
- `onUploadStart`: Upload start callback
- `onUploadProgress`: Upload progress callback
- `onUploadComplete`: Upload complete callback
- `onUploadError`: Upload error callback
- `onFilesDropped`: Files dropped callback

## 🧭 BreadcrumbNavigation Component

Enhanced breadcrumb navigation with metadata and actions.

### Features

- **Path Navigation**: Clickable breadcrumb items
- **Metadata Display**: File counts, sizes, and modification dates
- **Expandable Information**: Click to expand item details
- **Action Buttons**: Home, refresh, and settings controls
- **Icon Support**: Visual indicators for different item types
- **Responsive Design**: Mobile-friendly layout

### Usage

```tsx
import { BreadcrumbNavigation, type BreadcrumbItem } from "@reynard/gallery";

const breadcrumbs: BreadcrumbItem[] = [
  {
    name: "Home",
    path: "/",
    fullPath: "/",
    clickable: true,
    icon: "🏠",
  },
  {
    name: "Images",
    path: "images",
    fullPath: "/images",
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

<BreadcrumbNavigation
  items={breadcrumbs}
  showMetadata={true}
  showItemCounts={true}
  showFileSizes={true}
  showLastModified={true}
  showActions={true}
  onItemClick={(item) => console.log("Clicked:", item)}
  onHomeClick={() => console.log("Home clicked")}
  onRefreshClick={() => console.log("Refresh clicked")}
  onSettingsClick={() => console.log("Settings clicked")}
/>;
```

### Props

- `items`: Array of breadcrumb items
- `showMetadata`: Show metadata (default: true)
- `showItemCounts`: Show item counts (default: true)
- `showFileSizes`: Show file sizes (default: true)
- `showLastModified`: Show last modified dates (default: true)
- `showActions`: Show action buttons (default: true)
- `onItemClick`: Item click callback
- `onHomeClick`: Home button callback
- `onRefreshClick`: Refresh button callback
- `onSettingsClick`: Settings button callback

## 🎯 Demo Component

A comprehensive demo showcasing all migrated components.

### Usage

```tsx
import { AdvancedComponentsDemo } from "@reynard/gallery";

<AdvancedComponentsDemo />;
```

The demo component provides:

- Interactive examples of all components
- Feature explanations and usage tips
- Responsive design demonstrations
- Dark theme support
- Accessibility features

## 🚀 Getting Started

1. **Install the package**:

   ```bash
   npm install @reynard/gallery
   ```

2. **Import components**:

   ```tsx
   import {
     ImageViewer,
     MultiSelect,
     ContextMenu,
     FileUpload,
     BreadcrumbNavigation,
   } from "@reynard/gallery";
   ```

3. **Use in your components**:

   ```tsx
   function MyGallery() {
     return (
       <div>
         <BreadcrumbNavigation items={breadcrumbs} />
         <MultiSelect items={files} />
         <FileUpload onFilesSelected={handleFiles} />
       </div>
     );
   }
   ```

## 🎨 Styling

All components include:

- **CSS Modules**: Scoped styling with BEM methodology
- **CSS Custom Properties**: Themeable design tokens
- **Responsive Design**: Mobile-first approach
- **Dark Theme**: Automatic dark mode detection
- **High Contrast**: Accessibility support
- **Reduced Motion**: Respects user preferences

## ♿ Accessibility

Components are built with accessibility in mind:

- **ARIA Labels**: Proper screen reader support
- **Keyboard Navigation**: Full keyboard accessibility
- **Focus Management**: Visible focus indicators
- **Semantic HTML**: Proper HTML structure
- **Color Contrast**: WCAG compliant color schemes

## 🔧 Customization

Components are highly customizable through:

- **Props**: Extensive configuration options
- **CSS Classes**: Custom styling support
- **Event Callbacks**: Full event handling
- **Theme Support**: Dark/light mode switching
- **Responsive Breakpoints**: Mobile-first design

## 📱 Browser Support

- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest 2 versions)
- **Mobile**: iOS Safari, Chrome Mobile
- **JavaScript**: ES2020+ features
- **CSS**: Modern CSS with fallbacks

## 🤝 Contributing

These components are part of the reynard gallery package. To contribute:

1. Follow the existing code style
2. Add comprehensive tests
3. Update documentation
4. Ensure accessibility compliance
5. Test across different devices and browsers

## 📄 License

MIT License - see the main package license for details.
