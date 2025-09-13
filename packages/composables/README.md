# reynard-composables

Reusable SolidJS composables extracted and
refined from the yipyap codebase. This package provides a collection of high-quality,
modular composables for common application patterns.

## Features

- **State Management**: Authentication, service management, and reactive state
- **UI Interactions**: Drag and drop, file uploads, and user interactions
- **Performance Monitoring**: Comprehensive performance tracking and debugging
- **AI/RAG Integration**: Retrieval-Augmented Generation client and utilities
- **File Handling**: Upload management with progress tracking
- **Storage**: Local and session storage with cross-tab synchronization

## Installation

```bash
npm install reynard-composables
```

## Usage

### Authentication

```typescript
import { useAuthFetch, createAuthFetch } from "reynard-composables";

// With SolidJS context
const authFetch = useAuthFetch({
  logout: () => console.log("Logged out"),
  notify: (message, type) => console.log(message, type),
  navigate: (path) => (window.location.href = path),
});

// Standalone usage
const { authFetch } = createAuthFetch({
  logout: () => console.log("Logged out"),
  notify: (message, type) => console.log(message, type),
});

// Use authenticated fetch
const response = await authFetch("/api/protected-endpoint");
```

### Service Management

```typescript
import { useServiceManager } from "reynard-composables";

const serviceManager = useServiceManager({
  authFetch: myAuthFetch,
  notify: (message, type) => console.log(message, type),
  websocketUrl: "ws://localhost:8080/services",
  refreshInterval: 30000,
});

// Access service state
const services = serviceManager.services();
const summary = serviceManager.summary();

// Manage services
await serviceManager.restartService("my-service");
await serviceManager.refreshStatus();
```

### Drag and Drop

```typescript
import { useDragAndDrop } from "reynard-composables";

const { isMoving } = useDragAndDrop({
  onDragStateChange: (isDragging) => {
    setShowDropOverlay(isDragging);
  },
  onFilesDropped: async (files) => {
    console.log("Files dropped:", files);
  },
  onItemsDropped: async (items, targetPath) => {
    console.log("Items moved to:", targetPath);
  },
  maxFileSize: 50 * 1024 * 1024, // 50MB
  allowedFileTypes: ["jpg", "png", "pdf"],
  uploadFiles: async (files) => {
    // Handle file upload
  },
  moveItems: async (items, sourcePath, targetPath) => {
    // Handle item movement
  },
});
```

### Performance Monitoring

```typescript
import { usePerformanceMonitor } from "reynard-composables";

const monitor = usePerformanceMonitor({
  thresholds: {
    criticalOperationTime: 2000,
    highOperationTime: 1000,
    criticalMemoryUsage: 100 * 1024 * 1024,
  },
});

// Start profiling
monitor.startProfiling("data-processing", 10000);

// Record operations
monitor.recordDOMUpdate("list-render", 45);
monitor.recordStyleApplication(100, 12);

// End profiling and get results
const metrics = monitor.endProfiling();
monitor.logPerformanceReport();
```

### RAG (Retrieval-Augmented Generation)

```typescript
import { useRAG, createRAGClient } from "reynard-composables";

// With SolidJS reactivity
const rag = useRAG({
  authFetch: myAuthFetch,
  configUrl: "/api/config",
  queryUrl: "/api/rag/query",
});

// Create search resource
const [searchParams, setSearchParams] = createSignal(null);
const searchResults = rag.createRAGSearchResource(searchParams);

// Query RAG
setSearchParams({ q: "search query", modality: "docs", topK: 10 });

// Ingest documents
await rag.ingestDocuments(
  [{ source: "document.pdf", content: "Document content..." }],
  "text-model",
  (event) => {
    console.log("Ingest progress:", event);
  },
);
```

### File Upload

```typescript
import { useFileUpload } from "reynard-composables";

const { uploadFiles, uploadProgress, isUploading, validateFile } =
  useFileUpload({
    maxFileSize: 100 * 1024 * 1024, // 100MB
    allowedFileTypes: ["jpg", "png", "pdf", "docx"],
    maxFiles: 5,
    uploadUrl: "/api/upload",
    authFetch: myAuthFetch,
    onProgress: (progress) => console.log("Upload progress:", progress),
    onSuccess: (response) => console.log("Upload successful:", response),
    onError: (error) => console.error("Upload failed:", error),
  });

// Upload files
const files = document.querySelector('input[type="file"]').files;
await uploadFiles(files);

// Check upload progress
const progress = uploadProgress();
```

### Storage

```typescript
import { useLocalStorage, useSessionStorage } from "reynard-composables";

// Local storage with cross-tab sync
const [user, setUser, removeUser] = useLocalStorage("user", {
  defaultValue: null,
  syncAcrossTabs: true,
});

// Session storage
const [tempData, setTempData, removeTempData] = useSessionStorage("temp", {
  defaultValue: {},
});

// Use the storage
setUser({ id: 1, name: "John" });
setTempData({ formData: "draft content" });
```

## API Reference

### State Management

- `useAuthFetch(options, isLoggedIn?)` - Authenticated fetch with token refresh
- `createAuthFetch(options)` - Standalone auth fetch factory
- `useServiceManager(options)` - Service monitoring and management

### UI

- `useDragAndDrop(options)` - Drag and drop file upload and item movement

### Performance

- `usePerformanceMonitor(options?)` - Performance monitoring and debugging

### AI/RAG

- `useRAG(options)` - RAG client with reactive resources
- `createRAGClient(options)` - Standalone RAG client factory

### File Handling

- `useFileUpload(options?)` - File upload with progress tracking

### Storage

- `useLocalStorage(key, options?)` - Reactive local storage
- `useSessionStorage(key, options?)` - Reactive session storage

## TypeScript Support

This package is written in TypeScript and provides full type definitions for all composables and their options.

## Contributing

This package is part of the Reynard framework. When contributing:

1. Ensure composables are truly reusable and not tied to specific applications
2. Provide comprehensive TypeScript types
3. Include proper error handling and validation
4. Add JSDoc comments for better developer experience
5. Test composables in isolation

## License

MIT
