# 📖 Reynard API Reference

Complete API documentation for all Reynard packages with detailed examples and usage patterns.

## Core API

### Theme Management

```tsx
// Theme management
const { theme, setTheme, nextTheme } = useTheme();

// Available themes
const themes = [
  "light",
  "dark",
  "gray",
  "banana",
  "strawberry",
  "peanut",
  "high-contrast-black",
  "high-contrast-inverse",
];

// Theme switching
setTheme("dark");
nextTheme(); // Cycles through available themes
```

### Notifications

```tsx
// Notifications
const { notify, dismiss, clear } = useNotifications();

// Notification types
notify("Success message", "success");
notify("Error message", "error");
notify("Warning message", "warning");
notify("Info message", "info");

// Notification options
notify("Custom notification", "success", {
  duration: 5000,
  position: "top-right",
  dismissible: true,
});

// Manual control
const notificationId = notify("Persistent message", "info", { duration: 0 });
dismiss(notificationId);
clear(); // Clear all notifications
```

### Local Storage

```tsx
// Local storage with type safety
const [value, setValue] = useLocalStorage("key", defaultValue);

// With custom serializer
const [complexData, setComplexData] = useLocalStorage(
  "complex-data",
  { items: [] },
  {
    serializer: {
      read: (value) => JSON.parse(value),
      write: (value) => JSON.stringify(value),
    },
  },
);

// Remove from storage
setValue(undefined); // Removes the key
```

### Debounced Values

```tsx
// Debounced values for performance
const [searchTerm, setSearchTerm] = useDebounce("", 300);

// Usage in search
<input
  value={searchTerm()}
  onInput={(e) => setSearchTerm(e.target.value)}
  placeholder="Search..."
/>;

// The debounced value updates 300ms after user stops typing
createEffect(() => {
  if (searchTerm()) {
    performSearch(searchTerm());
  }
});
```

### Media Queries

```tsx
// Responsive breakpoint detection
const isMobile = useMediaQuery("(max-width: 768px)");
const isTablet = useMediaQuery("(min-width: 769px) and (max-width: 1024px)");
const isDesktop = useMediaQuery("(min-width: 1025px)");

// Usage in components
return (
  <div>
    {isMobile() && <MobileLayout />}
    {isTablet() && <TabletLayout />}
    {isDesktop() && <DesktopLayout />}
  </div>
);
```

### Internationalization

```tsx
// Internationalization
const { t, locale, setLocale, formatNumber, formatDate } = useI18n();

// Basic translation
t("app.title"); // Returns translated text

// With parameters
t("user.welcome", { name: "John" }); // "Welcome, John!"

// Pluralization
t("item.count", { count: 5 }); // "5 items" or "1 item"

// Number formatting
formatNumber(1234.56); // "1,234.56" (locale-aware)

// Date formatting
formatDate(new Date(), "short"); // "12/31/2023" (locale-aware)

// Locale switching
setLocale("es"); // Switch to Spanish
```

## Component API

### Button

```tsx
// Button variants
<Button variant="primary" size="lg" loading>
  Submit
</Button>

// Available variants
const variants = ["primary", "secondary", "outline", "ghost", "danger"];

// Available sizes
const sizes = ["sm", "md", "lg", "xl"];

// Button states
<Button disabled>Disabled</Button>
<Button loading>Loading...</Button>

// Button with icon
<Button icon={<Icon name="plus" />}>
  Add Item
</Button>

// Button events
<Button onClick={handleClick} onMouseEnter={handleHover}>
  Interactive Button
</Button>
```

### Card

```tsx
// Card with header and footer
<Card
  variant="elevated"
  padding="lg"
  header={<h3>Card Title</h3>}
  footer={<Button>Action</Button>}
>
  Card content goes here
</Card>;

// Available variants
const variants = ["default", "elevated", "outlined", "filled"];

// Available padding sizes
const paddingSizes = ["none", "sm", "md", "lg", "xl"];

// Card with custom styling
<Card style="background: var(--accent); color: white;" class="custom-card">
  Custom styled card
</Card>;
```

### TextField

```tsx
// TextField with validation
<TextField
  label="Email"
  type="email"
  placeholder="Enter your email"
  value={email()}
  onInput={setEmail}
  error={hasError}
  errorMessage="Invalid email address"
  required
  disabled={isLoading}
/>

// TextField variants
const variants = ["default", "filled", "outlined"];

// TextField with icon
<TextField
  label="Search"
  icon={<Icon name="search" />}
  placeholder="Search..."
/>

// TextField with validation
<TextField
  label="Password"
  type="password"
  validation={{
    required: "Password is required",
    minLength: { value: 8, message: "Password must be at least 8 characters" }
  }}
/>
```

### Select

```tsx
// Select dropdown
<Select
  label="Choose an option"
  value={selectedValue()}
  onChange={setSelectedValue}
  options={[
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" },
    { value: "option3", label: "Option 3" }
  ]}
  placeholder="Select an option..."
  searchable
  multiple={false}
/>

// Multi-select
<Select
  label="Choose multiple options"
  value={selectedValues()}
  onChange={setSelectedValues}
  options={options}
  multiple
  searchable
  maxSelected={3}
/>

// Select with custom rendering
<Select
  options={options}
  renderOption={(option) => (
    <div>
      <strong>{option.label}</strong>
      <small>{option.description}</small>
    </div>
  )}
/>
```

### Modal

```tsx
// Modal with custom size
<Modal
  open={isOpen()}
  onClose={() => setIsOpen(false)}
  size="lg"
  title="Custom Modal"
  closable
  backdrop
>
  Modal content goes here
</Modal>

// Available sizes
const sizes = ["sm", "md", "lg", "xl", "full"];

// Modal with custom actions
<Modal
  open={isOpen()}
  onClose={() => setIsOpen(false)}
  title="Confirm Action"
  actions={[
    <Button variant="ghost" onClick={() => setIsOpen(false)}>
      Cancel
    </Button>,
    <Button variant="danger" onClick={handleConfirm}>
      Confirm
    </Button>
  ]}
>
  Are you sure you want to proceed?
</Modal>

// Modal without backdrop
<Modal
  open={isOpen()}
  onClose={() => setIsOpen(false)}
  backdrop={false}
>
  Modal without backdrop
</Modal>
```

### Tabs

```tsx
// Tab navigation
<Tabs
  activeTab={activeTab()}
  onTabChange={setActiveTab}
  tabs={[
    { id: "tab1", label: "Overview" },
    { id: "tab2", label: "Details" },
    { id: "tab3", label: "Settings" },
  ]}
  variant="underline"
  size="md"
>
  <div slot="tab1">Overview content</div>
  <div slot="tab2">Details content</div>
  <div slot="tab3">Settings content</div>
</Tabs>;

// Available variants
const variants = ["default", "underline", "pills", "cards"];

// Available sizes
const sizes = ["sm", "md", "lg"];

// Tabs with icons
<Tabs
  tabs={[
    { id: "home", label: "Home", icon: <Icon name="home" /> },
    { id: "profile", label: "Profile", icon: <Icon name="user" /> },
  ]}
>
  {/* Tab content */}
</Tabs>;
```

## Chat API

### ChatContainer

```tsx
// Main chat interface
<ChatContainer
  endpoint="/api/chat"
  height="600px"
  config={{
    enableThinking: true,
    enableTools: true,
    showTimestamps: true,
    maxMessages: 100,
    autoScroll: true,
  }}
  onMessageSent={(message) => console.log("Sent:", message)}
  onMessageReceived={(message) => console.log("Received:", message)}
  onError={(error) => console.error("Chat error:", error)}
/>;

// Chat configuration options
interface ChatConfig {
  enableThinking: boolean;
  enableTools: boolean;
  showTimestamps: boolean;
  maxMessages: number;
  autoScroll: boolean;
  placeholder: string;
  sendOnEnter: boolean;
  showTyping: boolean;
}
```

### P2PChatContainer

```tsx
// Peer-to-peer chat
<P2PChatContainer
  currentUser={{ id: "user1", name: "Alice", status: "online" }}
  realtimeEndpoint="ws://localhost:8080"
  config={{
    enableTyping: true,
    enablePresence: true,
    enableFileSharing: true,
    maxFileSize: 10 * 1024 * 1024, // 10MB
  }}
  onUserJoin={(user) => console.log("User joined:", user)}
  onUserLeave={(user) => console.log("User left:", user)}
  onFileReceived={(file) => console.log("File received:", file)}
/>;

// P2P configuration
interface P2PConfig {
  enableTyping: boolean;
  enablePresence: boolean;
  enableFileSharing: boolean;
  maxFileSize: number;
  iceServers: RTCIceServer[];
}
```

### Chat Composables

```tsx
// Main chat hook
const {
  messages,
  sendMessage,
  isConnected,
  isLoading,
  error,
  clearMessages,
  retryConnection,
} = useChat({
  endpoint: "/api/chat",
  config: chatConfig,
});

// P2P chat hook
const { users, sendMessage, sendFile, isConnected, connectionState } =
  useP2PChat({
    currentUser: user,
    endpoint: "ws://localhost:8080",
  });
```

## RAG API

### RAGSearch

```tsx
// RAG search interface
<RAGSearch
  endpoint="/api/rag/search"
  height="600px"
  config={{
    enableFilters: true,
    showMetadata: true,
    maxResults: 20,
    similarityThreshold: 0.7,
    autoSearch: true,
    debounceMs: 300,
  }}
  onSearch={(query) => console.log("Searching:", query)}
  onResultClick={(result) => console.log("Selected:", result)}
  onFilterChange={(filters) => console.log("Filters:", filters)}
/>;

// RAG configuration
interface RAGConfig {
  enableFilters: boolean;
  showMetadata: boolean;
  maxResults: number;
  similarityThreshold: number;
  autoSearch: boolean;
  debounceMs: number;
  defaultFilters: FilterOptions;
}
```

### Search Filters

```tsx
// Search filters component
<SearchFilters
  filters={filters()}
  onFiltersChange={setFilters}
  availableFilters={[
    {
      key: "type",
      label: "Type",
      type: "select",
      options: ["image", "text", "video"],
    },
    { key: "dateRange", label: "Date Range", type: "daterange" },
    { key: "tags", label: "Tags", type: "multiselect", options: tagOptions },
  ]}
/>;

// Filter types
type FilterType = "select" | "multiselect" | "daterange" | "number" | "text";
```

## Auth API

### AuthProvider

```tsx
// Authentication provider
<AuthProvider
  config={{
    apiUrl: "/api/auth",
    tokenStorageKey: "auth_token",
    refreshTokenStorageKey: "refresh_token",
    autoRefresh: true,
    refreshThreshold: 300000, // 5 minutes
  }}
>
  <App />
</AuthProvider>;

// Auth configuration
interface AuthConfig {
  apiUrl: string;
  tokenStorageKey: string;
  refreshTokenStorageKey: string;
  autoRefresh: boolean;
  refreshThreshold: number;
  onTokenRefresh?: (token: string) => void;
  onAuthError?: (error: AuthError) => void;
}
```

### Auth Components

```tsx
// Login form
<LoginForm
  onSuccess={(user) => console.log("Logged in:", user)}
  onError={(error) => console.error("Login error:", error)}
  config={{
    rememberMe: true,
    showForgotPassword: true,
    socialLogin: ["google", "github"]
  }}
/>

// Registration form
<RegisterForm
  onSuccess={(user) => console.log("Registered:", user)}
  onError={(error) => console.error("Registration error:", error)}
  config={{
    requireEmailVerification: true,
    passwordStrength: true,
    termsAndConditions: true
  }}
/>

// Profile form
<ProfileForm
  user={currentUser()}
  onUpdate={(user) => console.log("Profile updated:", user)}
  fields={["name", "email", "avatar", "preferences"]}
/>
```

### Auth Composables

```tsx
// Main auth hook
const {
  user,
  isAuthenticated,
  isLoading,
  login,
  logout,
  register,
  updateProfile,
  changePassword,
  refreshToken,
} = useAuth();

// Auth context hook
const { user, isAuthenticated, login, logout } = useAuthContext();

// Higher-order component
const ProtectedComponent = withAuth(MyComponent, {
  redirectTo: "/login",
  fallback: <LoadingSpinner />,
});
```

## Charts API

### LineChart

```tsx
// Line chart
<LineChart
  title="Sales Trend"
  labels={["Jan", "Feb", "Mar", "Apr", "May"]}
  datasets={[
    {
      label: "Sales",
      data: [12, 19, 3, 5, 2],
      borderColor: "var(--accent)",
      backgroundColor: "var(--accent)20",
    },
  ]}
  yAxis={{ label: "Sales ($)" }}
  xAxis={{ label: "Month" }}
  responsive
  height={400}
/>;

// Chart configuration
interface ChartConfig {
  responsive: boolean;
  maintainAspectRatio: boolean;
  height: number;
  width: number;
  animation: boolean;
  plugins: ChartPlugin[];
}
```

### TimeSeriesChart

```tsx
// Real-time time series chart
<TimeSeriesChart
  title="Real-time Performance"
  data={performanceData()}
  autoScroll
  maxDataPoints={50}
  valueFormatter={(value) => `${value}%`}
  timeFormatter={(timestamp) => new Date(timestamp).toLocaleTimeString()}
  config={{
    lineColor: "var(--accent)",
    fillColor: "var(--accent)20",
    pointRadius: 3,
    pointHoverRadius: 6,
  }}
/>;

// Time series data format
interface TimeSeriesData {
  timestamp: number;
  value: number;
  label?: string;
  metadata?: Record<string, any>;
}
```

## Gallery API

### Gallery

```tsx
// Main gallery component
<Gallery
  data={galleryData()}
  onFileSelect={(file) => console.log("Selected:", file)}
  onFolderNavigate={(path) => console.log("Navigate to:", path)}
  onFileUpload={(files) => console.log("Upload:", files)}
  onFileDelete={(file) => console.log("Delete:", file)}
  config={{
    layout: "grid", // "grid" | "list" | "masonry"
    showUpload: true,
    showBreadcrumbs: true,
    enableDragAndDrop: true,
    enableMultiSelect: true,
    enableSearch: true,
    enableFilters: true,
  }}
/>;

// Gallery data structure
interface GalleryData {
  files: FileItem[];
  folders: FolderItem[];
  currentPath: string;
  breadcrumbs: BreadcrumbItem[];
  totalItems: number;
  hasMore: boolean;
}
```

### ImageViewer

```tsx
// Image viewer
<ImageViewer
  images={images()}
  currentIndex={currentIndex()}
  onIndexChange={setCurrentIndex}
  onClose={() => setIsViewerOpen(false)}
  config={{
    enableZoom: true,
    enablePan: true,
    enableRotation: true,
    enableFullscreen: true,
    showThumbnails: true,
    showMetadata: true,
  }}
/>;

// Image viewer configuration
interface ImageViewerConfig {
  enableZoom: boolean;
  enablePan: boolean;
  enableRotation: boolean;
  enableFullscreen: boolean;
  showThumbnails: boolean;
  showMetadata: boolean;
  zoomLevels: number[];
  maxZoom: number;
  minZoom: number;
}
```

## Settings API

### SettingsPanel

```tsx
// Settings panel
<SettingsPanel
  title="Application Settings"
  showSearch={true}
  showCategories={true}
  showImportExport={true}
  onSettingsChange={(settings) => console.log("Settings changed:", settings)}
  onExport={() => exportSettings()}
  onImport={(settings) => importSettings(settings)}
/>;

// Settings schema
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
```

### Settings Composables

```tsx
// Main settings hook
const {
  settings,
  updateSetting,
  resetSetting,
  resetAllSettings,
  exportSettings,
  importSettings,
} = useSettings(schema);

// Individual setting hook
const { value, setValue, reset, isValid, error } = useSetting(
  "appearance.theme",
  "light",
);

// Settings validation
const { validateSetting, validateAllSettings, getValidationErrors } =
  useSettingsValidation(schema);
```

## File Processing API

### ThumbnailGenerator

```tsx
// Thumbnail generation
const { generateThumbnail } = useFileProcessing();

const handleFileUpload = async (file: File) => {
  const thumbnail = await generateThumbnail(file, {
    width: 200,
    height: 200,
    quality: 0.8,
    format: "webp",
    fit: "cover", // "cover" | "contain" | "fill"
  });

  console.log("Thumbnail:", thumbnail);
};

// Thumbnail options
interface ThumbnailOptions {
  width: number;
  height: number;
  quality: number;
  format: "webp" | "jpeg" | "png";
  fit: "cover" | "contain" | "fill";
  backgroundColor?: string;
}
```

### MetadataExtractor

```tsx
// Metadata extraction
const { extractMetadata } = useFileProcessing();

const handleFileAnalysis = async (file: File) => {
  const metadata = await extractMetadata(file, {
    includeExif: true,
    includeHash: true,
    includeDimensions: true,
    includeDuration: true,
  });

  console.log("Metadata:", metadata);
};

// Metadata options
interface MetadataOptions {
  includeExif: boolean;
  includeHash: boolean;
  includeDimensions: boolean;
  includeDuration: boolean;
  includeAudioInfo: boolean;
  includeVideoInfo: boolean;
}
```

## Testing API

### Test Utilities

```tsx
// Component rendering
import { render, screen, userEvent } from "reynard-testing";

// Render component with providers
render(() => <MyComponent />, {
  providers: [
    <ThemeProvider value={themeModule} />,
    <NotificationsProvider value={notificationsModule} />,
  ],
});

// Test interactions
await userEvent.click(screen.getByText("Click me"));
await userEvent.type(screen.getByLabelText("Email"), "test@example.com");

// Custom matchers
expect(screen.getByRole("button")).toBeInTheDocument();
expect(screen.getByText("Success")).toHaveClass("success");
```

### Mock Utilities

```tsx
// Browser API mocks
import { mockLocalStorage, mockFetch, mockWebSocket } from "reynard-testing";

// Mock localStorage
mockLocalStorage({
  "user-preferences": '{"theme": "dark"}',
});

// Mock fetch
mockFetch("/api/data", { data: "test" });

// Mock WebSocket
const mockWS = mockWebSocket("ws://localhost:8080");
mockWS.emit("message", { type: "chat", content: "Hello" });
```

## Error Handling

### Error Boundaries

```tsx
// Error boundary component
<ErrorBoundary
  fallback={(error, resetError) => (
    <div>
      <h2>Something went wrong</h2>
      <p>{error.message}</p>
      <button onClick={resetError}>Try again</button>
    </div>
  )}
  onError={(error, errorInfo) => {
    console.error("Error caught:", error);
    console.error("Error info:", errorInfo);
  }}
>
  <MyComponent />
</ErrorBoundary>

// Error boundary with retry
<ErrorBoundary
  fallback={ErrorFallback}
  retryCount={3}
  retryDelay={1000}
  onRetry={(attempt) => console.log(`Retry attempt ${attempt}`)}
>
  <UnstableComponent />
</ErrorBoundary>
```

## Performance API

### Performance Monitoring

```tsx
// Performance timer
import { PerformanceTimer } from "reynard-algorithms";

const timer = new PerformanceTimer();
timer.start();

// Perform operation
await performOperation();

const duration = timer.stop();
console.log(`Operation took ${duration}ms`);

// Performance monitoring hook
const { measure, getMetrics } = usePerformanceMonitoring();

const handleOperation = async () => {
  const result = await measure("operation", async () => {
    return await performOperation();
  });

  console.log("Metrics:", getMetrics());
};
```

## Next Steps

- **[Package Documentation](./PACKAGES.md)** - Detailed package documentation
- **[Examples and Templates](./EXAMPLES.md)** - Real-world applications
- **[Performance Guide](./PERFORMANCE.md)** - Optimization tips

---

_Complete API reference for all Reynard packages!_ 🦊
