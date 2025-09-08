# 🦊 Reynard

> _From dataset editor to multi-modal CMS: The evolution of a cunning framework_

Reynard is a SolidJS framework derived from **YipYap**, a multi-modal content management system. The framework extracts and modularizes YipYap's proven architectural patterns into reusable packages for modern web development.

## 🚀 Quick Start

```bash
# Install core package
npm install reynard-core solid-js

# Install additional packages as needed
npm install reynard-components reynard-chat reynard-rag reynard-auth

# Start building
npm create reynard-app my-app
```

```tsx
import { createSignal } from "solid-js";
import { useNotifications } from "reynard-core";
import { Button, Card } from "reynard-components";

function App() {
  const { notify } = useNotifications();

  return (
    <Card padding="lg">
      <h1>Welcome to Reynard!</h1>
      <Button onClick={() => notify("Hello from Reynard!", "success")}>
        Get Started
      </Button>
    </Card>
  );
}
```

## 📚 Documentation

- **[📖 Overview](./docs/OVERVIEW.md)** - Framework introduction and philosophy
- **[🚀 Quick Start](./docs/QUICKSTART.md)** - Get up and running in minutes
- **[📚 Complete Tutorial](./docs/TUTORIAL.md)** - Build your first Reynard app
- **[📦 Package Documentation](./docs/PACKAGES.md)** - Detailed package documentation
- **[📱 Examples & Templates](./docs/EXAMPLES.md)** - Real-world applications
- **[📖 API Reference](./docs/API.md)** - Complete API documentation
- **[🚀 Performance Guide](./docs/PERFORMANCE.md)** - Optimization and performance tips
- **[🏗️ Architecture Patterns](./docs/architecture/modularity-patterns.md)** - Modularity patterns and refactoring strategies
- **[🤝 Contributing](./docs/CONTRIBUTING.md)** - How to contribute to Reynard

## ✨ Key Features

- **🎯 Multi-Modal Content Management** - Images, videos, audio, documents, and specialized formats
- **🤖 AI/ML Integration** - Caption generation, RAG system, object detection, and TTS
- **🎨 8 Built-in Themes** - Light, dark, and custom themes with CSS custom properties
- **🌍 37 Languages** - Internationalization with RTL support and locale-aware formatting
- **♿ WCAG 2.1 Compliance** - Full accessibility with ARIA labels and keyboard navigation
- **⚡ Performance Optimized** - Bundle splitting, lazy loading, and intelligent caching
- **🔧 TypeScript First** - Full type safety with comprehensive type definitions

## 📦 Package Ecosystem

Reynard's package ecosystem is built on the foundation of YipYap's proven architecture, with each package designed to be independently useful while working seamlessly together. All packages are published to npm and ready for production use!

### Core Packages

- **`reynard-core`** - Foundation utilities, notifications, localStorage, validation
- **`reynard-components`** - UI components, modals, tooltips, forms
- **`reynard-themes`** - Theming system with 8 built-in themes and i18n support
- **`reynard-i18n`** - Internationalization with 37 language support

### Specialized Packages

- **`reynard-chat`** - Real-time chat system with streaming and tool integration
- **`reynard-rag`** - RAG system with EmbeddingGemma integration
- **`reynard-auth`** - Complete authentication system with JWT and security features
- **`reynard-charts`** - Data visualization components built on Chart.js
- **`reynard-gallery`** - Advanced file management with drag-and-drop
- **`reynard-annotating`** - AI-powered caption generation with multiple models
- **`reynard-caption`** - Caption editing UI with tag management
- **`reynard-3d`** - Three.js integration for 3D graphics
- **`reynard-monaco`** - Code editor integration
- **`reynard-games`** - Game development utilities

_[View complete package list and documentation →](./docs/PACKAGES.md)_

## 🎯 Philosophy

Reynard is guided by the "cunning fox" philosophy. The framework values smart, elegant solutions over unnecessary complexity, aiming to be adaptable so it can integrate seamlessly with your existing patterns. It is resourceful, minimizing dependencies while maximizing functionality, and maintains a professional standard with high expectations for code quality and naming conventions.

## 🧪 Testing

Reynard includes comprehensive testing with Vitest and Playwright:

```bash
# Run all tests
npm test

# Run tests with coverage
npm test:coverage

# Run tests in UI mode
npm test:ui

# Run Playwright tests
npm run test:e2e
```

_[View complete testing guide →](./docs/CONTRIBUTING.md#testing)_

## 🚀 Performance

Reynard is optimized for performance with bundle splitting, lazy loading, and intelligent caching. All packages are designed with minimal dependencies and maximum functionality.

### Bundle Sizes

| Package | Size | Gzipped | Description |
|---------|------|---------|-------------|
| `reynard-core` | ~16 kB | 3.7 kB | Core utilities and modules |
| `reynard-components` | ~46 kB | 11.8 kB | UI component library |
| `reynard-chat` | ~110 kB | 25.1 kB | Chat messaging system |
| `reynard-rag` | ~21 kB | 6.7 kB | RAG system components |
| `reynard-auth` | ~46 kB | 11.8 kB | Authentication system |
| `reynard-charts` | ~28 kB | 8.4 kB | Data visualization |
| `reynard-gallery` | ~87 kB | 21.3 kB | File management |
| `reynard-monaco` | ~232 kB | 62.0 kB | Code editor |

_[View complete performance guide →](./docs/PERFORMANCE.md)_

## 📚 Package Documentation

### Core Packages

- **`reynard-core`** - Foundation utilities, notifications, localStorage, validation
- **`reynard-components`** - UI components, modals, tooltips, forms
- **`reynard-themes`** - Theming system with 8 built-in themes and i18n support
- **`reynard-i18n`** - Internationalization with 37 language support

### Specialized Packages

- **`reynard-chat`** - Real-time chat system with streaming and tool integration
- **`reynard-rag`** - RAG system with EmbeddingGemma integration
- **`reynard-auth`** - Complete authentication system with JWT and security features
- **`reynard-charts`** - Data visualization components built on Chart.js
- **`reynard-gallery`** - Advanced file management with drag-and-drop
- **`reynard-annotating`** - AI-powered caption generation with multiple models
- **`reynard-caption`** - Caption editing UI with tag management
- **`reynard-3d`** - Three.js integration for 3D graphics
- **`reynard-monaco`** - Code editor integration
- **`reynard-games`** - Game development utilities

_[View complete package documentation →](./docs/PACKAGES.md)_

## 🎨 Theming System

Reynard includes a comprehensive theming system with 8 built-in themes:

- **Light** - Clean and bright
- **Dark** - Easy on the eyes
- **Gray** - Professional neutral
- **Banana** - Warm and cheerful
- **Strawberry** - Vibrant and energetic
- **Peanut** - Earthy and cozy
- **High Contrast Black** - Maximum accessibility
- **High Contrast Inverse** - Alternative high contrast

_[View complete theming guide →](./docs/PACKAGES.md#reynard-themes)_

## 📱 Examples and Templates

### Real-World Applications

- **🖼️ Image Caption App** - Complete AI-powered image caption generation
- **🔍 RAG Demo** - Retrieval-Augmented Generation system with semantic search
- **💬 Chat Demo** - Real-time chat with streaming, P2P, and tool integration
- **📊 Comprehensive Dashboard** - Full-featured dashboard with charts and analytics
- **🎨 Multi-Theme Gallery** - Advanced theming showcase with component library
- **⏰ Clock App** - Clock, timer, and alarm application with advanced features
- **🌍 i18n Demo** - Internationalization showcase with 37 languages and RTL support
- **🎮 3D Demo** - Three.js integration for 3D graphics and visualizations

### Templates

- **Starter Template** - Basic application template with essential features
- **Dashboard Template** - Dashboard-focused template with charts and analytics
- **Portfolio Template** - Portfolio website template with gallery and contact forms

_[View complete examples and templates →](./docs/EXAMPLES.md)_

### reynard-chat

Production-ready chat messaging system for SolidJS applications with advanced streaming capabilities, markdown parsing, thinking sections, and tool integration.

#### Chat Features

- **Real-time Streaming** - Advanced streaming text processing with real-time markdown rendering
- **Thinking Sections** - Support for AI assistant thinking process visualization
- **Tool Integration** - Complete tool calling system with progress tracking
- **Markdown Parsing** - Full markdown support including tables, code blocks, and math
- **P2P Support** - Peer-to-peer chat capabilities with WebRTC
- **TypeScript First** - Complete type safety with excellent IntelliSense

#### Chat Components

- **ChatContainer** - Main chat interface with message display and input handling
- **ChatMessage** - Individual message component with markdown rendering
- **MessageInput** - Text input with send functionality and keyboard shortcuts
- **P2PChatContainer** - Peer-to-peer chat interface with user management
- **ThinkingIndicator** - Visual indicator for AI thinking processes
- **ToolCallDisplay** - Display component for tool call results and progress

#### Chat Composables

- **`useChat()`** - Main chat state management with streaming support
- **`useP2PChat()`** - Peer-to-peer chat functionality with WebRTC

#### Chat Example Usage

```tsx
import { ChatContainer, P2PChatContainer } from "reynard-chat";

function ChatApp() {
  return (
    <div>
      <ChatContainer
        endpoint="/api/chat"
        height="600px"
        config={{
          enableThinking: true,
          enableTools: true,
          showTimestamps: true,
        }}
        onMessageSent={(message) => console.log("Sent:", message)}
        onMessageReceived={(message) => console.log("Received:", message)}
      />
      
      <P2PChatContainer
        currentUser={{ id: "user1", name: "Alice", status: "online" }}
        realtimeEndpoint="ws://localhost:8080"
        config={{
          enableTyping: true,
          enablePresence: true,
        }}
      />
    </div>
  );
}
```

### reynard-rag

RAG (Retrieval-Augmented Generation) system for SolidJS applications with EmbeddingGemma integration and comprehensive search capabilities.

#### RAG Features

- **Advanced Search Interface** - Comprehensive search UI with filtering and sorting
- **EmbeddingGemma Integration** - Built-in support for EmbeddingGemma models
- **Real-time Results** - Live search results with similarity scoring
- **Metadata Support** - Rich metadata display and filtering
- **TypeScript First** - Complete type safety with excellent IntelliSense

#### RAG Components

- **RAGSearch** - Main search interface with query input and result display
- **SearchFilters** - Advanced filtering options for search results
- **ResultCard** - Individual search result display with metadata
- **SimilarityIndicator** - Visual similarity score display

#### RAG Example Usage

```tsx
import { RAGSearch } from "reynard-rag";

function RAGApp() {
  return (
    <RAGSearch
      endpoint="/api/rag/search"
      height="600px"
      config={{
        enableFilters: true,
        showMetadata: true,
        maxResults: 20,
        similarityThreshold: 0.7,
      }}
      onSearch={(query) => console.log("Searching:", query)}
      onResultClick={(result) => console.log("Selected:", result)}
    />
  );
}
```

### reynard-auth

Complete authentication and user management system with JWT tokens, password strength analysis, and comprehensive security features.

#### Auth Features

- **JWT Authentication** - Complete token-based authentication with refresh tokens
- **Login & Registration** - Ready-to-use forms with validation and error handling
- **Password Security** - Advanced password strength analysis using zxcvbn
- **User Management** - Profile management, password changes, and user preferences
- **Security** - Automatic token refresh, secure storage, and CSRF protection

#### Auth Components

- **AuthProvider** - Context provider for authentication state and methods
- **LoginForm** - Complete login form with validation
- **RegisterForm** - Registration form with password strength analysis
- **ProfileForm** - User profile management form
- **PasswordChangeForm** - Secure password change form

#### Auth Composables

- **`useAuth()`** - Main authentication hook with state management and API integration
- **`useAuthContext()`** - Access authentication context
- **`withAuth()`** - Higher-order component for authentication requirements

#### Auth Example Usage

```tsx
import {
  AuthProvider,
  LoginForm,
  RegisterForm,
  useAuthContext,
} from "reynard-auth";

function App() {
  return (
    <AuthProvider
      config={{
        apiUrl: "/api/auth",
        tokenStorageKey: "auth_token",
        refreshTokenStorageKey: "refresh_token",
      }}
    >
      <AuthApp />
    </AuthProvider>
  );
}

function AuthApp() {
  const { isAuthenticated, user, login, logout } = useAuthContext();

  return (
    <div>
      {isAuthenticated() ? (
        <div>
          <p>Welcome, {user()?.name}!</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <div>
          <LoginForm onSuccess={() => console.log("Logged in!")} />
          <RegisterForm onSuccess={() => console.log("Registered!")} />
        </div>
      )}
    </div>
  );
}
```

### reynard-charts

Advanced data visualization components built on Chart.js with real-time updates and comprehensive theming.

#### Chart Types

- **LineChart** - Perfect for showing trends over time or continuous data
- **BarChart** - Ideal for comparing categories or showing discrete data
- **PieChart** - Great for showing proportions and percentages
- **TimeSeriesChart** - Advanced real-time chart with automatic data management

#### Charts Features

- **Real-time Updates** - Live data streaming with automatic management
- **Theme Integration** - Seamlessly works with Reynard's theming system
- **Responsive Design** - Charts adapt to container size and mobile devices
- **Performance** - Optimized rendering with data aggregation and limits
- **Accessibility** - Screen reader friendly with proper ARIA labels

#### Charts Example Usage

```tsx
import {
  LineChart,
  BarChart,
  PieChart,
  TimeSeriesChart,
} from "reynard-charts";

function Dashboard() {
  const salesData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    datasets: [
      {
        label: "Sales",
        data: [12, 19, 3, 5, 2],
      },
    ],
  };

  const performanceData = [
    { timestamp: Date.now() - 300000, value: 45, label: "5 min ago" },
    { timestamp: Date.now() - 240000, value: 52, label: "4 min ago" },
    { timestamp: Date.now() - 180000, value: 38, label: "3 min ago" },
    { timestamp: Date.now() - 120000, value: 67, label: "2 min ago" },
    { timestamp: Date.now() - 60000, value: 74, label: "1 min ago" },
    { timestamp: Date.now(), value: 82, label: "Now" },
  ];

  return (
    <div
      style={{
        display: "grid",
        "grid-template-columns": "1fr 1fr",
        gap: "2rem",
      }}
    >
      <LineChart
        title="Sales Trend"
        labels={salesData.labels}
        datasets={salesData.datasets}
        yAxis={{ label: "Sales ($)" }}
        responsive
      />

      <TimeSeriesChart
        title="Real-time Performance"
        data={performanceData}
        autoScroll
        maxDataPoints={50}
        valueFormatter={(value) => `${value}%`}
      />
    </div>
  );
}
```

### reynard-gallery

Advanced file and media management system with drag-and-drop, responsive grids, and comprehensive file handling.

#### Gallery Features

- **File Management** - Complete file browser with folder navigation
- **Media Support** - Images, videos, audio, text, and document preview
- **Responsive Grid** - Adaptive layouts (grid, list, masonry) with virtual scrolling
- **File Upload** - Drag-and-drop upload with progress tracking and validation
- **Search & Filter** - Real-time search with advanced filtering options
- **Favorites** - Mark files as favorites with persistent storage
- **Selection** - Multi-select with keyboard shortcuts and context menus

#### Gallery Components

- **Gallery** - Main gallery component with navigation and management
- **GalleryGrid** - Responsive grid layout with virtual scrolling
- **ImageViewer** - Sophisticated image viewer with zoom, pan, and navigation
- **FileUploadZone** - Drag-and-drop file upload with progress tracking
- **BreadcrumbNavigation** - Folder navigation breadcrumbs

#### Gallery Composables

- **`useGalleryState()`** - Gallery state management with persistence
- **`useFileUpload()`** - File upload handling with progress tracking
- **`useMultiSelect()`** - Multi-selection system with keyboard shortcuts

#### Gallery Example Usage

```tsx
import { Gallery } from "reynard-gallery";
import type { GalleryData } from "reynard-gallery";

function FileManager() {
  const [galleryData, setGalleryData] = createSignal<GalleryData>({
    files: [
      { id: "1", name: "document.pdf", type: "file", size: 1024 },
      { id: "2", name: "image.jpg", type: "file", size: 2048 },
    ],
    folders: [{ id: "3", name: "Documents", type: "folder" }],
    currentPath: "/",
    breadcrumbs: [{ name: "Home", path: "/" }],
  });

  return (
    <Gallery
      data={galleryData()}
      onFileSelect={(file) => console.log("Selected:", file)}
      onFolderNavigate={(path) => console.log("Navigate to:", path)}
      onFileUpload={(files) => console.log("Upload:", files)}
      showUpload={true}
      showBreadcrumbs={true}
      enableDragAndDrop={true}
    />
  );
}
```

### reynard-settings

Comprehensive configuration management system with validation, persistence, and UI components.

#### Settings Features

- **Settings Schema** - Type-safe settings definitions with validation
- **Multiple Storage** - localStorage, sessionStorage, IndexedDB, and remote storage
- **Validation** - Comprehensive validation with custom rules
- **Migration** - Automatic settings migration between versions
- **Backup** - Automatic backup and restore functionality
- **Categories** - Organized settings with categories and search

#### Setting Types

- **Boolean** - Toggle switches and checkboxes
- **String** - Text inputs with validation
- **Number** - Numeric inputs with min/max constraints
- **Select** - Dropdown selections with options
- **MultiSelect** - Multiple selection with tags
- **Range** - Slider inputs with min/max values
- **Color** - Color picker inputs
- **File** - File upload inputs
- **JSON** - JSON object inputs with validation

#### Settings Components

- **SettingsPanel** - Complete settings interface with categories and search
- **SettingControl** - Individual setting control components
- **SettingsProvider** - Context provider for settings management

#### Settings Composables

- **`useSettings()`** - Main settings management hook
- **`useSetting()`** - Individual setting management
- **`useSettingsValidation()`** - Settings validation utilities

#### Settings Example Usage

```tsx
import {
  SettingsPanel,
  SettingsProvider,
  useSettings,
} from "reynard-settings";

const settingsSchema = {
  appearance: {
    theme: {
      key: "appearance.theme",
      label: "Theme",
      type: "select",
      defaultValue: "light",
      options: [
        { value: "light", label: "Light" },
        { value: "dark", label: "Dark" },
      ],
    },
  },
  behavior: {
    autoSave: {
      key: "behavior.autoSave",
      label: "Auto Save",
      type: "boolean",
      defaultValue: true,
    },
  },
};

function App() {
  return (
    <SettingsProvider config={{ schema: settingsSchema }}>
      <SettingsPanel
        title="Application Settings"
        showSearch={true}
        showCategories={true}
        showImportExport={true}
      />
    </SettingsProvider>
  );
}
```

### reynard-algorithms

Algorithm primitives and data structures for efficient spatial operations, performance monitoring, and geometric calculations.

#### Algorithm Types

- **Union-Find Algorithm** - Efficient set operations and cycle detection with path compression
- **AABB Collision Detection** - Spatial queries and overlap detection with spatial hashing support
- **Spatial Hashing** - Efficient spatial partitioning and nearest neighbor searches
- **Performance Utilities** - Benchmarking, profiling, and monitoring tools
- **Geometry Operations** - 2D geometric calculations and transformations

#### Core Features

- **High Performance** - Optimized algorithms with O(α(n)) Union-Find and O(1) collision detection
- **Memory Efficient** - Minimal memory overhead with automatic cleanup and optimization
- **Type Safe** - Full TypeScript support with comprehensive type definitions
- **Framework Agnostic** - Pure algorithms that work with any JavaScript framework

#### Algorithms Example Usage

```tsx
import {
  UnionFind,
  detectCycle,
  checkCollision,
  SpatialHash,
  PerformanceTimer,
  PointOps,
  VectorOps,
} from "reynard-algorithms";

function AlgorithmDemo() {
  // Union-Find for connected components
  const uf = new UnionFind(10);
  uf.union(0, 1);
  uf.union(1, 2);
  console.log(uf.connected(0, 2)); // true

  // Collision detection
  const aabb1 = { x: 0, y: 0, width: 100, height: 100 };
  const aabb2 = { x: 50, y: 50, width: 100, height: 100 };
  const collision = checkCollision(aabb1, aabb2);
  console.log(collision.colliding); // true

  // Spatial hashing
  const spatialHash = new SpatialHash({ cellSize: 100 });
  spatialHash.insert({ id: '1', x: 50, y: 50, data: { name: 'object1' } });
  const nearby = spatialHash.queryRadius(0, 0, 100);

  // Performance monitoring
  const timer = new PerformanceTimer();
  timer.start();
  // ... perform operation
  const duration = timer.stop();

  // Geometry operations
  const point1 = PointOps.create(0, 0);
  const point2 = PointOps.create(3, 4);
  const distance = PointOps.distance(point1, point2); // 5

  return <div>Algorithm demo running...</div>;
}
```

### reynard-file-processing

Advanced file processing pipeline with thumbnail generation, metadata extraction, and comprehensive file type support.

#### Supported File Types

- **Images** - JPG, PNG, GIF, WebP, BMP, TIFF, JXL, AVIF, HEIC, HEIF, JP2, SVG, EPS, AI, CDR, RAW formats
- **Videos** - MP4, AVI, MOV, MKV, WebM, FLV, WMV, MPG, MPEG, TS, MTS, M2TS, ProRes, DNxHD, Cine, R3D, BRAW
- **Audio** - MP3, AAC, OGG, WMA, Opus, WAV, FLAC, ALAC, APE, WV, DSD, DFF, DSF
- **Text & Code** - TXT, MD, RST, TEX, LOG, JSON, XML, YAML, TOML, CSV, TSV, Parquet, Arrow, Feather, HDF5, NumPy, and programming languages
- **Documents** - PDF, DOCX, PPTX, XLSX, ODT, ODP, ODS, EPUB, MOBI, AZW3, KFX, RTF, Pages, Key, Numbers
- **LoRA Models** - SafeTensors, Checkpoint, PyTorch, ONNX, Bin

#### Core Components

- **ThumbnailGenerator** - Multi-format thumbnail generation with smart rendering
- **MetadataExtractor** - Comprehensive metadata extraction and analysis
- **ContentAnalyzer** - Content analysis and processing utilities
- **ProgressTracker** - Progress tracking and callback system

#### File Processing Example Usage

```tsx
import {
  ThumbnailGenerator,
  MetadataExtractor,
  useFileProcessing,
} from "reynard-file-processing";

function FileProcessor() {
  const { generateThumbnail, extractMetadata } = useFileProcessing();

  const handleFileUpload = async (file: File) => {
    // Generate thumbnail
    const thumbnail = await generateThumbnail(file, {
      width: 200,
      height: 200,
      quality: 0.8,
    });

    // Extract metadata
    const metadata = await extractMetadata(file);

    console.log("Thumbnail:", thumbnail);
    console.log("Metadata:", metadata);
  };

  return (
    <input type="file" onChange={(e) => handleFileUpload(e.target.files[0])} />
  );
}
```

### reynard-annotating

AI/ML-powered caption generation engine with multiple model support, batch processing, and comprehensive lifecycle management.

#### Annotating Features

- **Multiple AI Models** - Support for JTP2, JoyCaption, WDv3, Florence2, and other caption generation models
- **Batch Processing** - Efficient batch caption generation with progress tracking
- **Model Management** - Dynamic model loading, switching, and lifecycle management
- **Confidence Scoring** - Confidence threshold management and quality assessment
- **Event System** - Comprehensive event system for annotation lifecycle tracking
- **TypeScript First** - Complete type safety with excellent IntelliSense

#### Annotating Components

- **AnnotationManager** - Main orchestrator for caption generation workflows
- **AnnotationService** - Core caption generation service with model integration
- **BaseCaptionGenerator** - Abstract base class for implementing custom generators
- **ModelRegistry** - Dynamic model registration and management system

#### Annotating Example Usage

```tsx
import { AnnotationManager, AnnotationService } from "reynard-annotating";

function CaptionGenerator() {
  const annotationManager = new AnnotationManager();
  const annotationService = new AnnotationService();

  const generateCaptions = async (images: File[]) => {
    // Configure annotation service
    await annotationService.configure({
      model: "florence2",
      confidenceThreshold: 0.8,
      batchSize: 5,
    });

    // Generate captions with progress tracking
    const results = await annotationService.generateCaptions(images, {
      onProgress: (progress) => console.log(`Progress: ${progress}%`),
      onComplete: (result) => console.log("Generation complete:", result),
    });

    return results;
  };

  return (
    <div>
      <input 
        type="file" 
        multiple 
        accept="image/*"
        onChange={(e) => generateCaptions(Array.from(e.target.files))}
      />
    </div>
  );
}
```

### reynard-caption

Caption editing UI components with tag management, validation, and comprehensive user interface for caption workflows.

> **💡 Architecture Note**: `reynard-caption` provides the UI components for caption editing, while `reynard-annotating` handles the AI/ML caption generation. Use them together for complete caption workflows!

#### Caption Features

- **Tag Management** - Interactive tag editing with autocomplete and validation
- **Multiple Caption Types** - Support for CAPTION, TAGS, E621, TOML, and custom formats
- **Real-time Validation** - Live validation with error highlighting and suggestions
- **Accessibility** - Full keyboard navigation and screen reader support
- **Theming Integration** - Seamless integration with Reynard's theming system

#### Caption Components

- **TagBubble** - Interactive tag editing component with drag-and-drop
- **CaptionInput** - Comprehensive caption input with multiple caption types
- **TagAutocomplete** - Smart autocomplete for tag suggestions
- **CaptionValidator** - Real-time validation and error display

#### Caption Example Usage

```tsx
import { TagBubble, CaptionInput, CaptionValidator } from "reynard-caption";

function CaptionEditor() {
  const [caption, setCaption] = createSignal("");
  const [tags, setTags] = createSignal<string[]>([]);

  return (
    <div>
      <CaptionInput
        value={caption()}
        onInput={setCaption}
        captionType="CAPTION"
        placeholder="Enter your caption..."
      />
      
      <TagBubble
        tags={tags()}
        onTagsChange={setTags}
        suggestions={["portrait", "landscape", "abstract", "nature"]}
        maxTags={10}
      />
      
      <CaptionValidator
        caption={caption()}
        tags={tags()}
        onValidationChange={(isValid, errors) => {
          console.log("Validation:", isValid, errors);
        }}
      />
    </div>
  );
}
```

#### Complete Caption Workflow Example

Here's how to combine both packages for a complete caption generation and editing workflow:

```tsx
import { AnnotationManager, AnnotationService } from "reynard-annotating";
import { TagBubble, CaptionInput, CaptionValidator } from "reynard-caption";
import { Button, Card } from "reynard-components";
import { useNotifications } from "reynard-core";

function CompleteCaptionWorkflow() {
  const [image, setImage] = createSignal<File | null>(null);
  const [generatedCaption, setGeneratedCaption] = createSignal("");
  const [editedCaption, setEditedCaption] = createSignal("");
  const [tags, setTags] = createSignal<string[]>([]);
  const [isGenerating, setIsGenerating] = createSignal(false);
  
  const { notify } = useNotifications();
  const annotationService = new AnnotationService();

  const generateCaption = async () => {
    if (!image()) return;
    
    setIsGenerating(true);
    try {
      // Use reynard-annotating for AI caption generation
      const result = await annotationService.generateCaptions([image()!], {
        model: "florence2",
        confidenceThreshold: 0.8,
      });
      
      const caption = result[0]?.caption || "";
      setGeneratedCaption(caption);
      setEditedCaption(caption);
      
      // Extract tags from generated caption
      const extractedTags = caption.split(/[,\s]+/).filter(tag => tag.length > 2);
      setTags(extractedTags);
      
      notify("Caption generated successfully!", "success");
    } catch (error) {
      notify("Failed to generate caption", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const saveCaption = () => {
    // Save the final caption and tags
    const finalData = {
      caption: editedCaption(),
      tags: tags(),
      image: image()?.name,
    };
    
    console.log("Saving caption data:", finalData);
    notify("Caption saved!", "success");
  };

  return (
    <Card padding="lg">
      <h3>Complete Caption Workflow</h3>
      
      {/* Image Upload */}
      <div style="margin-bottom: 1rem;">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files?.[0] || null)}
        />
        {image() && (
          <p>Selected: {image()!.name}</p>
        )}
      </div>

      {/* AI Generation */}
      <div style="margin-bottom: 1rem;">
        <Button 
          onClick={generateCaption}
          disabled={!image() || isGenerating()}
          loading={isGenerating()}
        >
          {isGenerating() ? "Generating..." : "Generate Caption with AI"}
        </Button>
      </div>

      {/* Generated Caption Display */}
      {generatedCaption() && (
        <div style="margin-bottom: 1rem; padding: 1rem; background: var(--secondary-bg); border-radius: 6px;">
          <h4>AI Generated Caption:</h4>
          <p style="font-style: italic; color: var(--text-secondary);">
            {generatedCaption()}
          </p>
        </div>
      )}

      {/* Caption Editing with reynard-caption */}
      <div style="margin-bottom: 1rem;">
        <CaptionInput
          value={editedCaption()}
          onInput={setEditedCaption}
          captionType="CAPTION"
          placeholder="Edit your caption..."
          label="Edit Caption"
        />
      </div>

      {/* Tag Management with reynard-caption */}
      <div style="margin-bottom: 1rem;">
        <TagBubble
          tags={tags()}
          onTagsChange={setTags}
          suggestions={["portrait", "landscape", "abstract", "nature", "art", "photography"]}
          maxTags={15}
          label="Tags"
        />
      </div>

      {/* Validation */}
      <CaptionValidator
        caption={editedCaption()}
        tags={tags()}
        onValidationChange={(isValid, errors) => {
          if (!isValid && errors.length > 0) {
            console.log("Validation errors:", errors);
          }
        }}
      />

      {/* Save Button */}
      <Button 
        onClick={saveCaption}
        disabled={!editedCaption().trim()}
        variant="primary"
      >
        Save Caption
      </Button>
    </Card>
  );
}
```

### reynard-testing

Comprehensive testing utilities and helpers for SolidJS applications with Vitest integration, mocking capabilities, and assertion utilities.

#### Testing Features

- **Vitest Integration** - Pre-configured Vitest configurations for different testing scenarios
- **Component Testing** - Utilities for testing SolidJS components with proper rendering
- **Mock Utilities** - Comprehensive mocking for browser APIs, external libraries, and SolidJS
- **Assertion Utilities** - Enhanced assertion helpers for common testing patterns
- **Test Fixtures** - Reusable test fixtures and setup utilities

#### Testing Utilities

- **Test Configurations** - Base, component, integration, and E2E test configurations
- **Render Utilities** - Component rendering with proper context and providers
- **Mock Utilities** - Browser mocks, external library mocks, and SolidJS mocks
- **Assertion Helpers** - Custom matchers and assertion utilities
- **Test Setup** - Automated test setup and teardown utilities

#### Testing Example Usage

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "reynard-testing";
import { Button } from "reynard-components";

describe("Button Component", () => {
  it("renders with correct text", () => {
    render(() => <Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("handles click events", async () => {
    const handleClick = vi.fn();
    render(() => <Button onClick={handleClick}>Click me</Button>);
    
    await userEvent.click(screen.getByText("Click me"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## 🎨 Theming System

Reynard includes a comprehensive theming system with 8 built-in themes:

- **Light** - Clean and bright
- **Dark** - Easy on the eyes
- **Gray** - Professional neutral
- **Banana** - Warm and cheerful
- **Strawberry** - Vibrant and energetic
- **Peanut** - Earthy and cozy
- **High Contrast Black** - Maximum accessibility
- **High Contrast Inverse** - Alternative high contrast

### Custom Themes

Create custom themes by extending the base theme configuration:

```tsx
import { createTheme } from "reynard-themes";

const customTheme = createTheme({
  name: "ocean",
  colors: {
    primary: "#0066cc",
    secondary: "#00aaff",
    background: "#f0f8ff",
    surface: "#ffffff",
    text: "#001122",
  },
});
```

## 📱 Examples and Templates

### **🎯 Real-World Applications**

Reynard examples showcase the full spectrum of capabilities, from simple demos to complex multi-modal applications:

- **🖼️ Image Caption App** - Complete AI-powered image caption generation with multiple models
- **🔍 RAG Demo** - Retrieval-Augmented Generation system with semantic search
- **💬 Chat Demo** - Real-time chat with streaming, P2P, and tool integration
- **📊 Comprehensive Dashboard** - Full-featured dashboard with charts, settings, and analytics
- **🎨 Multi-Theme Gallery** - Advanced theming showcase with component library
- **⏰ Clock App** - Clock, timer, and alarm application with advanced features
- **🌍 i18n Demo** - Internationalization showcase with 37 languages and RTL support
- **🎮 3D Demo** - Three.js integration for 3D graphics and visualizations
- **🧪 Algorithm Bench** - Performance testing and algorithm demonstrations
- **🔧 Features App** - Feature management system with service dependencies
- **📁 File Test** - Advanced file processing and management capabilities
- **🎯 Error Demo** - Comprehensive error handling and boundary demonstrations
- **🔐 Auth App** - Complete authentication system with JWT and security features

### Templates

- **Starter Template** - Basic application template with essential features
- **Dashboard Template** - Dashboard-focused template with charts and analytics
- **Portfolio Template** - Portfolio website template with gallery and contact forms

### Running Examples

```bash
# Navigate to any example directory
cd examples/basic-app

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🧪 Testing

Reynard includes comprehensive testing with Vitest and Playwright:

```bash
# Run all tests
npm test

# Run tests with coverage
npm test:coverage

# Run tests in UI mode
npm test:ui

# Run Playwright tests
npm run test:e2e
```

### Test Coverage

- **Core Tests** - All core functionality tests are passing (200+ tests)
- **Component Tests** - Comprehensive component testing with user interactions
- **Integration Tests** - End-to-end testing with Playwright
- **Accessibility Tests** - Automated accessibility testing

## 🚀 Performance

Reynard is optimized for performance:

- **Bundle Splitting** - Automatic code splitting and lazy loading
- **Tree Shaking** - Import only what you need
- **Optimized Builds** - Production builds with minification and compression
- **Virtual Scrolling** - Efficient rendering of large lists
- **Memory Management** - Smart cleanup and garbage collection

### Bundle Sizes

- **reynard-core** - ~16 kB (3.7 kB gzipped)
- **reynard-components** - ~46 kB (11.8 kB gzipped)
- **reynard-chat** - ~110 kB (25.1 kB gzipped)
- **reynard-rag** - ~21 kB (6.7 kB gzipped)
- **reynard-auth** - ~46 kB (11.8 kB gzipped)
- **reynard-charts** - ~28 kB (8.4 kB gzipped)
- **reynard-gallery** - ~87 kB (21.3 kB gzipped)
- **reynard-settings** - ~35 kB (8.8 kB gzipped)
- **reynard-monaco** - ~232 kB (62.0 kB gzipped)
- **reynard-annotating** - ~35 kB (8.8 kB gzipped)
- **reynard-caption** - ~22 kB (7.0 kB gzipped)
- **reynard-algorithms** - ~12 kB (3.6 kB gzipped)
- **reynard-file-processing** - ~28 kB (8.8 kB gzipped)
- **reynard-testing** - ~45 kB (12.1 kB gzipped)
- **reynard-themes** - ~22 kB (6.1 kB gzipped)
- **reynard-fluent-icons** - ~21 kB (4.7 kB gzipped)
- **reynard-error-boundaries** - ~16 kB (3.6 kB gzipped)
- **reynard-3d** - ~60 kB (19.6 kB gzipped)
- **reynard-i18n** - ~22 kB (6.1 kB gzipped)
- **reynard-ui** - ~38 kB (12.2 kB gzipped)
- **reynard-composables** - ~16 kB (3.6 kB gzipped)
- **reynard-connection** - ~27 kB (5.6 kB gzipped)
- **reynard-features** - ~11 kB (3.6 kB gzipped)
- **reynard-model-management** - ~21 kB (4.7 kB gzipped)
- **reynard-service-manager** - ~22 kB (7.1 kB gzipped)
- **reynard-tools** - ~21 kB (5.6 kB gzipped)
- **reynard-boundingbox** - ~28 kB (8.4 kB gzipped)
- **reynard-color-media** - ~26 kB (7.0 kB gzipped)
- **reynard-games** - ~34 kB (12.2 kB gzipped)
- **reynard-docs-core** - ~22 kB (6.1 kB gzipped)
- **reynard-docs-components** - ~38 kB (12.2 kB gzipped)
- **reynard-docs-generator** - ~340 kB (72.6 kB gzipped)
- **reynard-docs-site** - ~192 kB (57.8 kB gzipped)
- **reynard-basic-app** - ~8 kB (2.1 kB gzipped)
- **reynard-clock-app** - ~12 kB (3.2 kB gzipped)

## ♿ Accessibility

Reynard prioritizes accessibility:

- **WCAG 2.1 Compliance** - Meets AA standards
- **Screen Reader Support** - Proper ARIA labels and descriptions
- **Keyboard Navigation** - Full keyboard accessibility
- **High Contrast Support** - Built-in high contrast themes
- **Focus Management** - Proper focus handling and management

## 🌍 Internationalization

Built-in i18n support with:

- **Translation Management** - Easy translation file management
- **Reactive Translations** - Automatic re-rendering on language changes
- **Pluralization** - Proper plural form handling
- **Date/Number Formatting** - Locale-aware formatting
- **RTL Support** - Right-to-left language support

## 🛠️ Development Tools

### CLI Tools

```bash
# Create new Reynard project
npx reynard-tools create my-app

# Generate component
npx reynard-tools generate component MyComponent

# Build and analyze bundle
npx reynard-tools build --analyze
```

### VS Code Extension

The Reynard VS Code extension provides:

- **IntelliSense** - Enhanced autocomplete and type checking
- **Snippets** - Code snippets for common patterns
- **Debugging** - Integrated debugging support
- **Theming** - Syntax highlighting for Reynard components

## 📖 API Reference

### Core API

```tsx
// Theme management
const { theme, setTheme, nextTheme } = useTheme();

// Notifications
const { notify, dismiss, clear } = useNotifications();

// Local storage
const [value, setValue] = useLocalStorage("key", defaultValue);

// Debounced values
const [debouncedValue] = useDebounce(value, delay);

// Media queries
const isMobile = useMediaQuery("(max-width: 768px)");

// Internationalization
const { t, locale, setLocale } = useI18n();
```

### Component API

```tsx
// Button variants
<Button variant="primary" size="lg" loading>
  Submit
</Button>

// Card with header and footer
<Card
  variant="elevated"
  padding="lg"
  header={<h3>Title</h3>}
  footer={<Button>Action</Button>}
>
  Content
</Card>

// TextField with validation
<TextField
  label="Email"
  type="email"
  error={hasError}
  errorMessage="Invalid email"
  required
/>

// Modal with custom size
<Modal
  open={isOpen()}
  onClose={() => setIsOpen(false)}
  size="lg"
  title="Custom Modal"
>
  Modal content
</Modal>
```

## 🧪 Development

### **🦊 Getting Started with Reynard**

```bash
# Install dependencies
npm install

# Start development
npm run dev

# Run tests
npm test

# Build all packages
npm run build

# Type check
npm run typecheck
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/rakki194/reynard.git
cd reynard

# Install dependencies
npm install

# Start development
npm run dev

# Run tests
npm test
```

### Code Style

- **TypeScript** - Full TypeScript support with strict mode
- **ESLint** - Code linting with SolidJS-specific rules
- **Prettier** - Code formatting
- **Husky** - Git hooks for quality assurance

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

### **🦊 Core Framework**

- **SolidJS** - The reactive framework that powers Reynard
- **Chart.js** - Data visualization library for charts
- **zxcvbn** - Password strength analysis
- **Vitest** - Testing framework
- **Playwright** - End-to-end testing

### **🦦 YipYap Foundation**

Reynard builds upon the sophisticated architecture and AI/ML capabilities of YipYap:

- **AI/ML Models**: JTP2, WDv3, Florence-2, JoyCaption, YOLO, OWLv2, and custom model implementations
- **Multi-Modal Processing**: Advanced image, video, audio, and document processing capabilities
- **Enterprise Architecture**: Production-ready service architecture with comprehensive error handling
- **RAG System**: Retrieval-Augmented Generation with vector databases and semantic search
- **Integration Services**: NLWeb, TTS, Diffusion LLM, and web crawling capabilities

### **🎯 Research and Development**

- **Academic Papers**: Comprehensive research documentation in `docs/research/academic-papers/`
- **Architecture Decisions**: Detailed architectural patterns and design decisions
- **Implementation Studies**: Performance analysis and optimization strategies

## 📞 Support

- **Documentation** - [docs.reynard.dev](https://docs.reynard.dev)
- **Issues** - [GitHub Issues](https://github.com/rakki194/reynard/issues)
- **Discussions** - [GitHub Discussions](https://github.com/rakki194/reynard/discussions)
- **Discord** - [Join our Discord](https://discord.gg/reynard)

---

## 🚀 The Future of Reynard

Reynard represents the next phase in the evolution of multi-modal content management. As we continue to develop and refine the framework, we're building toward a future where:

- **🤖 AI-First Development**: Every component is designed with AI integration in mind
- **🌐 Universal Content**: Seamless handling of any content type, from images to 3D models
- **⚡ Real-Time Collaboration**: Live editing and collaboration across all content types
- **🔮 Predictive Interfaces**: AI-powered UI that adapts to user behavior and content
- **🌍 Global Scale**: Built for worldwide deployment with edge computing support

### **🦊 Join the Evolution**

Reynard is more than a framework - it's a movement toward smarter, more intuitive web development. Whether you're building the next generation of content management systems, AI-powered applications, or simply want to leverage the power of multi-modal AI in your projects, Reynard provides the foundation you need.

**From dataset editor to multi-modal CMS to universal framework - the journey continues!**

---

_Built with ❤️, 🐺 and 🤖!_
