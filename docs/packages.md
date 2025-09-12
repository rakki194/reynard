# 📦 Reynard Package Documentation

Comprehensive documentation for all Reynard packages with detailed examples and usage patterns.

## Core Packages

### reynard-core

The foundation of the Reynard framework, providing essential utilities, composables, and modules.

#### Modules

- **Notifications** - Toast notification system with auto-dismiss and multiple types
- **Internationalization** - Built-in i18n support with translation management

#### Core Composables

- **`useNotifications()`** - Toast notification system with queue management
- **`useLocalStorage()`** - Reactive local storage with type safety
- **`useDebounce()`** - Debounced values for performance optimization
- **`useMediaQuery()`** - Responsive breakpoint detection
- **`useI18n()`** - Internationalization with reactive translations

#### Utilities

- **Date Utilities** - Comprehensive date formatting and manipulation
- **Formatters** - Text, number, and currency formatting functions
- **Validation** - Input validation and sanitization utilities

#### Core Example Usage

```tsx
import { useNotifications, useLocalStorage, useDebounce } from "reynard-core";

function MyComponent() {
  const { notify } = useNotifications();
  const [count, setCount] = useLocalStorage("counter", 0);
  const [searchTerm, setSearchTerm] = useDebounce("", 300);

  return (
    <div>
      <button onClick={() => notify("Success!", "success")}>
        Show Notification
      </button>
      <p>Count: {count()}</p>
      <input
        value={searchTerm()}
        onInput={(e) => setSearchTerm(e.target.value)}
        placeholder="Search..."
      />
    </div>
  );
}
```

### reynard-themes

Comprehensive theming and internationalization system with 8 built-in themes, custom theme support, and multi-language capabilities. Uses OKLCH color space for perceptual uniformity and modern color management.

#### Features

- **8 Built-in Themes** - Light, Dark, Gray, Banana, Strawberry, Peanut, High Contrast Black, High Contrast Inverse
- **OKLCH Color Space** - Modern color system with perceptual uniformity and better color consistency
- **Custom Themes** - Create your own theme configurations with OKLCH colors
- **Internationalization** - 30+ languages with RTL support
- **CSS Custom Properties** - Dynamic theme switching with CSS variables
- **System Theme Detection** - Automatic light/dark mode based on user preferences

#### Usage

```tsx
import { ReynardProvider, useTheme } from "reynard-themes";
import "reynard-themes/themes.css";

function App() {
  return (
    <ReynardProvider defaultTheme="light" defaultLocale="en">
      <MyApp />
    </ReynardProvider>
  );
}

function MyComponent() {
  const { theme, setTheme } = useTheme();

  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={() => setTheme("dark")}>Switch to Dark</button>
    </div>
  );
}
```

### reynard-components

Production-ready SolidJS component library with comprehensive theming and accessibility support.

#### Primitives

- **Button** - Versatile button with multiple variants, sizes, and states
- **Card** - Flexible container with consistent styling and variants
- **TextField** - Text input with validation, icons, and error states
- **Select** - Dropdown select with options and search support

#### Composite Components

- **Modal** - Flexible modal dialog with backdrop and animations
- **Tabs** - Tab navigation with keyboard support and accessibility

#### Components Example Usage

```tsx
import { Button, Card, TextField, Modal, Tabs } from "reynard-components";

function MyApp() {
  const [isModalOpen, setIsModalOpen] = createSignal(false);
  const [activeTab, setActiveTab] = createSignal("tab1");

  return (
    <div>
      <Card padding="lg">
        <TextField label="Email" type="email" placeholder="Enter your email" />
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          Open Modal
        </Button>
      </Card>

      <Modal
        open={isModalOpen()}
        onClose={() => setIsModalOpen(false)}
        title="Example Modal"
      >
        <p>Modal content goes here</p>
      </Modal>

      <Tabs
        activeTab={activeTab()}
        onTabChange={setActiveTab}
        tabs={[
          { id: "tab1", label: "Overview" },
          { id: "tab2", label: "Details" },
        ]}
      >
        <div slot="tab1">Overview content</div>
        <div slot="tab2">Details content</div>
      </Tabs>
    </div>
  );
}
```

## Specialized Packages

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
import { LineChart, BarChart, PieChart, TimeSeriesChart } from "reynard-charts";

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
import { SettingsPanel, SettingsProvider, useSettings } from "reynard-settings";

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
  spatialHash.insert({ id: "1", x: 50, y: 50, data: { name: "object1" } });
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

Unified annotation system for Reynard with production features and modular architecture. This package integrates all caption generators into a single, easy-to-use interface.

> **💡 Architecture Note**: The annotating system follows a modular plugin architecture where each generator (JTP2, JoyCaption, WDv3, Florence2) is a separate package that can be used independently or through the unified interface.

#### Annotating Features

- **Unified Interface** - Single manager for all caption generators
- **Production Features** - Usage tracking, health monitoring, circuit breakers
- **Modular Architecture** - Individual packages for each generator
- **Type Safety** - Full TypeScript support
- **Event System** - Comprehensive event handling
- **Smart Model Management** - Automatic loading, unloading, and coordination
- **Multiple AI Models** - Support for JTP2, JoyCaption, WDv3, Florence2, and other caption generation models
- **Batch Processing** - Efficient batch caption generation with progress tracking
- **Model Management** - Dynamic model loading, switching, and lifecycle management
- **Confidence Scoring** - Confidence threshold management and quality assessment
- **Plugin Architecture** - Extensible plugin system for adding new generators
- **Simulation Support** - Development/testing simulation for all generators

#### Annotating Package Structure

The annotating system consists of multiple specialized packages:

- **reynard-annotating-core** - Core functionality, types, and services
- **reynard-annotating-jtp2** - JTP2 generator (furry artwork tagging)
- **reynard-annotating-joy** - JoyCaption generator (multilingual LLM)
- **reynard-annotating-florence2** - Florence2 generator (general purpose)
- **reynard-annotating-wdv3** - WDv3 generator (Danbooru-style tagging)
- **reynard-annotating** - Unified interface (this package)

#### Annotating Components

- **UnifiedAnnotationManager** - Main orchestrator for caption generation workflows
- **AnnotationService** - Core caption generation service with model integration
- **BaseCaptionGenerator** - Abstract base class for implementing custom generators
- **Plugin System** - Dynamic model registration and management system
- **Health Monitoring** - Real-time health checks and performance metrics
- **Circuit Breakers** - Fault tolerance and error handling
- **Usage Tracking** - Model usage statistics and performance monitoring

#### Annotating Example Usage

```tsx
import {
  createUnifiedAnnotationManager,
  PRODUCTION_CONFIG,
  type CaptionTask,
} from "reynard-annotating";

function CaptionGenerator() {
  const [manager, setManager] = createSignal(null);

  onMount(async () => {
    // Create unified manager with production features
    const annotationManager = createUnifiedAnnotationManager(PRODUCTION_CONFIG);
    await annotationManager.initialize();
    setManager(annotationManager);
  });

  const generateCaptions = async (images: File[]) => {
    if (!manager()) return;

    const service = manager().getService();

    // Generate captions using different generators
    const results = await Promise.all(
      images.map(async (image) => {
        const task: CaptionTask = {
          imagePath: image.name,
          generatorName: "jtp2",
          config: { threshold: 0.2 },
        };

        return await service.generateCaption(task);
      }),
    );

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

### reynard-floating-panel

Advanced floating panel system with staggered animations, state management, and sophisticated overlay effects based on Yipyap's BoundingBoxEditor implementation.

#### Floating Panel Features

- **🎭 Staggered Animations** - Sophisticated entrance/exit animations with configurable delays
- **🎯 State Management** - Advanced overlay state coordination with transition phases
- **🖱️ Draggable Panels** - Full drag support with constraints and snap points
- **📏 Resizable Panels** - Resize handles with min/max constraints
- **🎨 Theme Support** - Multiple built-in themes (accent, warning, error, success, info)
- **♿ Accessibility** - WCAG compliant with keyboard navigation and screen reader support
- **📱 Responsive** - Mobile-first design that works across all device sizes
- **🎪 Backdrop Effects** - Blur effects and color-mixed backgrounds
- **⚡ Performance** - Optimized animations with reduced motion support

#### Floating Panel Components

- **FloatingPanelOverlay** - Main overlay container with backdrop and state management
- **FloatingPanel** - Individual draggable/resizable panels with animations
- **FloatingPanelAdvanced** - Advanced panel with sophisticated features
- **FloatingPanelDebug** - Debug panel for development and testing

#### Floating Panel Composables

- **`useOverlayManager()`** - Manages overlay state and panel coordination
- **`useStaggeredAnimation()`** - Handles sophisticated animation timing
- **`useDraggablePanel()`** - Provides drag functionality with constraints

#### Floating Panel Example Usage

```tsx
import {
  FloatingPanelOverlay,
  FloatingPanel,
  useOverlayManager,
} from "reynard-floating-panel";
import type { FloatingPanel as FloatingPanelType } from "reynard-floating-panel";

function MyApp() {
  const overlayManager = useOverlayManager({
    config: {
      backdropBlur: 4,
      backdropColor: "rgb(0 0 0 / 0.2)",
      outlineColor: "#3b82f6",
    },
  });

  const panels: FloatingPanelType[] = [
    {
      id: "panel-1",
      position: { top: 20, left: 20 },
      size: { width: 300, height: 200 },
      content: <div>Panel 1 Content</div>,
      config: {
        draggable: true,
        closable: true,
        theme: "accent",
      },
    },
    {
      id: "panel-2",
      position: { top: 20, right: 20 },
      size: { width: 250, height: 150 },
      content: <div>Panel 2 Content</div>,
      config: {
        draggable: true,
        resizable: true,
        theme: "warning",
      },
    },
  ];

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
      <button onClick={() => overlayManager.toggleOverlay()}>
        Toggle Overlay
      </button>

      <FloatingPanelOverlay
        isActive={overlayManager.isActive()}
        transitionPhase={overlayManager.overlayState().transitionPhase}
      >
        {panels.map((panel) => (
          <FloatingPanel
            key={panel.id}
            id={panel.id}
            position={panel.position}
            size={panel.size}
            config={panel.config}
          >
            {panel.content}
          </FloatingPanel>
        ))}
      </FloatingPanelOverlay>
    </div>
  );
}
```

#### Advanced Animation Configuration

```tsx
const animation = useStaggeredAnimation({
  baseDelay: 0.1,
  staggerStep: 0.1,
  direction: "center-out", // or "forward", "reverse"
  duration: 300,
  easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
});
```

#### Drag & Drop Configuration

```tsx
const draggablePanel = useDraggablePanel(panelRef, {
  constraints: {
    minWidth: 200,
    minHeight: 100,
    maxWidth: 800,
    maxHeight: 600,
  },
  snapPoints: {
    x: [0, 100, 200, 300],
    y: [0, 50, 100, 150],
    tolerance: 10,
  },
});
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
      const extractedTags = caption
        .split(/[,\s]+/)
        .filter((tag) => tag.length > 2);
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
        {image() && <p>Selected: {image()!.name}</p>}
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
          suggestions={[
            "portrait",
            "landscape",
            "abstract",
            "nature",
            "art",
            "photography",
          ]}
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

## Additional Packages

### UI and Layout

- **reynard-ui** - Advanced layout and navigation components
- **reynard-fluent-icons** - Fluent UI icons for Reynard design system
- **reynard-error-boundaries** - Comprehensive error boundary system

### Development and Tools

- **reynard-tools** - Development and runtime tools for Reynard applications
- **reynard-composables** - Reusable reactive logic for Reynard applications
- **reynard-connection** - Enterprise-grade networking for Reynard applications

### Specialized Features

- **reynard-3d** - 3D graphics and visualization components using Three.js
- **reynard-games** - Interactive games and visualizations
- **reynard-monaco** - Monaco code editor and text editing components
- **reynard-boundingbox** - Reusable bounding box and annotation editing components
- **reynard-colors** - Color generation utilities and media handling components

### reynard-colors

Color generation utilities and media handling components with OKLCH color space support for modern web applications.

#### Features

- **OKLCH Color Generation** - Generate colors using the OKLCH color space for perceptual uniformity
- **Color Utilities** - Convert between color spaces and generate color palettes
- **Media Handling** - Components for handling various media types
- **Color Harmony** - Generate harmonious color schemes and gradients

#### Usage

```tsx
import { generateColorPalette, convertToOKLCH } from "reynard-colors";

// Generate a color palette using OKLCH
const palette = generateColorPalette(5, 240); // 5 colors with base hue 240
// Returns: ['oklch(60% 0.2 240)', 'oklch(60% 0.2 300)', ...]

// Convert hex to OKLCH
const oklchColor = convertToOKLCH("#3b82f6");
// Returns: 'oklch(60% 0.25 240)'
```

### Model and Service Management

- **reynard-model-management** - Model management system for ML model loading and lifecycle
- **reynard-service-manager** - Service management system for service lifecycle and health monitoring
- **reynard-features** - Advanced feature system for managing application features and dependencies

### Documentation

- **reynard-docs-core** - Core documentation rendering engine
- **reynard-docs-components** - Beautiful UI components for documentation sites
- **reynard-docs-generator** - Automated documentation generator
- **reynard-docs-site** - Beautiful documentation site application

### Applications

- **reynard-basic-app** - Basic Todo App - Minimal Reynard framework example
- **reynard-clock-app** - Comprehensive clock, timer, alarm, and countdown application
- **reynard-test-app** - Comprehensive test application showcasing Reynard framework features

## Package Installation

Install packages individually based on your needs:

```bash
# Core packages
pnpm install reynard-core reynard-themes reynard-components

# Specialized packages
pnpm install reynard-chat reynard-rag reynard-auth reynard-charts
pnpm install reynard-gallery reynard-settings reynard-algorithms
pnpm install reynard-file-processing reynard-annotating reynard-caption

# Development packages
pnpm install reynard-testing reynard-tools reynard-composables

# UI packages
pnpm install reynard-ui reynard-fluent-icons reynard-error-boundaries

# Specialized features
pnpm install reynard-3d reynard-games reynard-monaco reynard-boundingbox reynard-floating-panel
```

## Next Steps

- **[Examples and Templates](./examples.md)** - See real-world applications using these packages
- **[API Reference](./api.md)** - Detailed API documentation for all packages
- **[Performance Guide](./performance.md)** - Optimization tips and bundle size information

---

_Explore the full power of Reynard's modular architecture!_ 🦊
