# Solid Router Guide

_Comprehensive routing solution for SolidJS applications with universal rendering support._

## Overview

Solid Router is the universal router for SolidJS that provides seamless client and
server-side rendering capabilities. Built with performance and
developer experience in mind, it offers flexible routing patterns that
scale from simple single-page applications to complex enterprise solutions. The router integrates deeply with
SolidJS's reactive system, providing efficient navigation management while
maintaining the feel of traditional multipage applications.

## Installation

Install Solid Router using your preferred package manager:

```bash
npm i @solidjs/router
```

### Package Configuration

In the Reynard ecosystem, Solid Router is typically configured in Vite builds with manual chunk splitting for
optimal performance:

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "solid-router": ["@solidjs/router"],
          "reynard-core": ["reynard-core"],
          "reynard-components": ["reynard-components"],
        },
      },
    },
  },
});
```

## Basic Setup

### Router Configuration

The `Router` component serves as the root of your routing system, managing URL state and
rendering appropriate routes. In production applications,
the router is typically wrapped with application providers and context.

**Basic Router Setup:**

```tsx
import { render } from "solid-js/web";
import { Router } from "@solidjs/router";

const wrapper = document.getElementById("app");

if (!wrapper) {
  throw new Error("Wrapper div not found");
}

render(() => <Router />, wrapper);
```

**Production Router Setup (Reynard Pattern):**

```tsx
// examples/comprehensive-dashboard/src/index.tsx
import { render } from "solid-js/web";
import { Router } from "@solidjs/router";
import App from "./App";

render(
  () => (
    <Router>
      <App />
    </Router>
  ),
  document.getElementById("root")!
);
```

**Advanced Router Setup with Layout (Reynard Pattern):**

```tsx
// third_party/reynard/src/main.tsx
import { Router } from "@solidjs/router";
import { routes } from "./router";

const Layout: ParentComponent = props => {
  return (
    <AppProvider>
      <CaptionerProvider>
        <AuthGuardWrapper>
          <GalleryProvider>
            <SidebarProvider>{props.children}</SidebarProvider>
          </GalleryProvider>
        </AuthGuardWrapper>
      </CaptionerProvider>
    </AppProvider>
  );
};

render(() => <Router root={Layout}>{routes}</Router>, document.body);
```

## Component-Based Routing

Define routes using JSX components for intuitive route management. This approach is ideal for smaller applications or
when you prefer declarative route definitions.

### Single Route

```tsx
import { render } from "solid-js/web";
import { Router, Route } from "@solidjs/router";
import Home from "./routes/Home";

render(
  () => (
    <Router>
      <Route path="/" component={Home} />
    </Router>
  ),
  document.getElementById("app")
);
```

### Multiple Routes with Layout

**Reynard Documentation Site Pattern:**

```tsx
// packages/docs-site/src/App.tsx
import { Router, Route, Routes } from "solid-router";

const App: Component = () => {
  return (
    <Router>
      <DocsLayout
        header={<DocsHeader title="Reynard Documentation" />}
        sidebar={<DocsSidebar title="Documentation" />}
        footer={<DocsFooter />}
      >
        <Routes>
          <Route path="/" component={HomePage} />
          <Route path="/packages/:package" component={PackagePage} />
          <Route path="/packages/:package/api" component={ApiPage} />
          <Route path="/packages/:package/examples" component={ExamplePage} />
          <Route path="/search" component={SearchPage} />
          <Route path="*" component={NotFoundPage} />
        </Routes>
      </DocsLayout>
    </Router>
  );
};
```

**Reynard Dashboard Pattern:**

```tsx
// examples/comprehensive-dashboard/src/App.tsx
import { Route } from "@solidjs/router";

const App: Component = () => {
  return (
    <ReynardProvider>
      <NotificationsProvider value={notifications}>
        <AuthProvider config={authConfig}>
          <AppLayout sidebar={<Sidebar />} header={<Header />}>
            <Route path="/" component={Dashboard} />
            <Route path="/charts" component={Charts} />
            <Route path="/components" component={Components} />
            <Route path="/gallery" component={Gallery} />
            <Route path="/auth" component={Auth} />
            <Route path="/settings" component={Settings} />
          </AppLayout>
        </AuthProvider>
      </NotificationsProvider>
    </ReynardProvider>
  );
};
```

## Configuration-Based Routing

Configure routes programmatically for better organization and
performance optimization. This approach is preferred for larger applications with complex routing requirements.

### Reynard CMS Route Configuration

**Real-world example from Reynard CMS:**

```tsx
// third_party/reynard/src/router.ts
import { lazy } from "solid-js";
import { RouteDefinition } from "@solidjs/router";
import { NotFound } from "./pages/not_found";

// Lazy load components for code splitting
const GalleryPage = lazy(() => import("./pages/Gallery"));
const LoginPage = lazy(() => import("./components/Auth/Login"));
const RegisterPage = lazy(() => import("./components/Auth/Register"));
const UserEngagementPage = lazy(() => import("./components/Auth/UserEngagement"));
const TextViewerPage = lazy(() => import("./pages/TextViewer"));
const RAGPage = lazy(() => import("./pages/RAG"));

export const routes: RouteDefinition[] = [
  {
    path: "/",
    component: GalleryPage,
  },
  {
    path: "/login",
    component: LoginPage,
  },
  {
    path: "/register",
    component: RegisterPage,
  },
  {
    path: "/settings/engagement",
    component: UserEngagementPage,
  },
  {
    path: "/rag",
    component: RAGPage,
  },
  {
    path: "/text/*path",
    component: TextViewerPage,
  },
  {
    path: "/*path",
    component: GalleryPage,
  },
  {
    path: "*404",
    component: NotFound,
  },
];
```

### Route Configuration Best Practices

**Organized Route Structure:**

```tsx
// Route configuration with proper organization
const routes: RouteDefinition[] = [
  // Public routes
  {
    path: "/",
    component: lazy(() => import("./pages/Home")),
  },
  {
    path: "/login",
    component: lazy(() => import("./pages/Login")),
  },

  // Protected routes
  {
    path: "/dashboard",
    component: lazy(() => import("./pages/Dashboard")),
  },
  {
    path: "/settings",
    component: lazy(() => import("./pages/Settings")),
  },

  // API routes
  {
    path: "/api/*path",
    component: lazy(() => import("./pages/ApiProxy")),
  },

  // Catch-all routes
  {
    path: "*404",
    component: lazy(() => import("./pages/NotFound")),
  },
];
```

## Lazy Loading

Optimize application performance through strategic component loading. Lazy loading is essential for
large applications to reduce initial bundle size and improve loading times.

### Production Lazy Loading Patterns

**Reynard CMS Implementation:**

```tsx
// third_party/reynard/src/router.ts
import { lazy } from "solid-js";

// Lazy load components for code splitting
const GalleryPage = lazy(() => import("./pages/Gallery"));
const LoginPage = lazy(() => import("./components/Auth/Login"));
const RegisterPage = lazy(() => import("./components/Auth/Register"));
const UserEngagementPage = lazy(() => import("./components/Auth/UserEngagement"));
const TextViewerPage = lazy(() => import("./pages/TextViewer"));
const RAGPage = lazy(() => import("./pages/RAG"));
const EmbeddingParameterControlsDemoPage = lazy(() => import("./components/UI/EmbeddingParameterControlsDemo"));
const EmbeddingVisualizationExportDemoPage = lazy(() => import("./components/UI/EmbeddingVisualizationExportDemo"));
```

### Error Handling for Lazy Components

**Robust Lazy Loading with Error Boundaries:**

```tsx
import { lazy, ErrorBoundary } from "solid-js";

// Lazy load with error handling
const LazyComponent = lazy(() =>
  import("./HeavyComponent").catch(() => ({
    default: () => (
      <div class="error-fallback">
        <h2>Failed to load component</h2>
        <p>Please refresh the page or try again later.</p>
      </div>
    ),
  }))
);

// Usage with error boundary
const App = () => (
  <Router>
    <ErrorBoundary
      fallback={err => (
        <div class="route-error">
          <h2>Route Error</h2>
          <p>{err.message}</p>
        </div>
      )}
    >
      <Route path="/" component={LazyComponent} />
    </ErrorBoundary>
  </Router>
);
```

### Component-Based Lazy Loading

```tsx
import { lazy } from "solid-js";
import { Router, Route } from "@solidjs/router";

const Home = lazy(() => import("./Home"));
const Users = lazy(() => import("./Users"));

const App = () => (
  <Router>
    <Route path="/" component={Home} />
    <Route path="/users" component={Users} />
  </Router>
);
```

## Navigation

Implement navigation using multiple approaches for
different use cases. Solid Router provides flexible navigation options that
integrate seamlessly with SolidJS's reactive system.

### Standard HTML Links

Solid Router supports standard HTML `<a>` elements for soft navigation:

```tsx
<a href="/dashboard">Go to Dashboard</a>
```

### The `<A>` Component

The `<A>` component extends native `<a>` elements with automatic base URL path handling and relative path support:

```tsx
import { A } from "@solidjs/router";

function DashboardPage() {
  return (
    <main>
      <nav>
        <A href="/">Home</A>
      </nav>
      {/* Relative path: from /dashboard links to /dashboard/users */}
      <A href="users">Users</A>
    </main>
  );
}
```

### Active State Styling

Style navigation elements based on their active state for better user experience:

```tsx
import { A } from "@solidjs/router";

function Navbar() {
  return (
    <nav>
      <A href="/" end={true}>
        Home
      </A>
      <A href="/login" activeClass="text-blue-900" inactiveClass="text-blue-500">
        Login
      </A>
    </nav>
  );
}
```

**Key Properties:**

- `activeClass`: CSS class applied when link is active
- `inactiveClass`: CSS class applied when link is inactive
- `end`: When `true`, matches exact route only (useful for root routes)

### Programmatic Navigation

Control navigation programmatically for dynamic user interactions. This is essential for authentication flows,
form submissions, and conditional navigation.

#### useNavigate Hook

**Real-world example from Reynard CMS:**

```tsx
import { useNavigate } from "@solidjs/router";

export const VideoGrid: Component<VideoGridProps> = props => {
  const navigate = useNavigate();

  const handleVideoClick = (video: VideoItem) => {
    // Navigate to video detail view
    navigate(`/video/${video.id}`);
  };

  return (
    <div class="video-grid">
      <For each={videos()}>
        {video => (
          <div class="video-item" onClick={() => handleVideoClick(video)}>
            {video.title}
          </div>
        )}
      </For>
    </div>
  );
};
```

**Authentication Flow Example:**

```tsx
import { useNavigate } from "@solidjs/router";

function LoginPage() {
  const navigate = useNavigate();

  const handleLogin = async (credentials: LoginCredentials) => {
    try {
      await authenticate(credentials);
      // Replace current history entry to prevent back navigation to login
      navigate("/dashboard", { replace: true });
    } catch (error) {
      // Handle login error
      console.error("Login failed:", error);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      {/* Login form fields */}
      <button type="submit">Login</button>
    </form>
  );
}
```

**Navigation Options:**

- `replace: true`: Replaces current history entry instead of adding new one
- Prevents back button navigation to previous page
- Useful for authentication redirects and form submissions

#### redirect Function

```tsx
import { action, redirect } from "@solidjs/router";

const logout = action(async () => {
  localStorage.remove("token");
  throw redirect("/");
});
```

## Advanced Patterns

### Route Parameters

Access dynamic route parameters using the `useParams` hook:

**Real-world example from Reynard Documentation:**

```tsx
// packages/docs-site/src/pages/PackagePage.tsx
import { useParams } from "solid-router";

export const PackagePage: Component = () => {
  const params = useParams();
  const [packageData, setPackageData] = createSignal<any>(null);
  const [isLoading, setIsLoading] = createSignal(true);

  onMount(async () => {
    try {
      const data = await fetchPackageData(params.package);
      setPackageData(data);
    } catch (error) {
      console.error("Failed to load package data:", error);
    } finally {
      setIsLoading(false);
    }
  });

  return (
    <DocsPage title={`${params.package} Package`}>
      {isLoading() ? (
        <div>Loading package documentation...</div>
      ) : (
        <DocsSection title="Overview">{packageData()?.description}</DocsSection>
      )}
    </DocsPage>
  );
};
```

**Route Configuration with Parameters:**

```tsx
// Route definitions with parameters
const routes: RouteDefinition[] = [
  {
    path: "/packages/:package",
    component: lazy(() => import("./pages/PackagePage")),
  },
  {
    path: "/packages/:package/api",
    component: lazy(() => import("./pages/ApiPage")),
  },
  {
    path: "/packages/:package/examples",
    component: lazy(() => import("./pages/ExamplePage")),
  },
];
```

### Query Parameters

Handle URL query parameters for search, filtering, and state management:

**Real-world example from Reynard Documentation:**

```tsx
// packages/docs-site/src/pages/SearchPage.tsx
import { useSearchParams } from "solid-router";

export const SearchPage: Component = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = createSignal(searchParams.q || "");
  const [searchResults, setSearchResults] = createSignal<any[]>([]);
  const [isSearching, setIsSearching] = createSignal(false);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setSearchParams({ q: query });

    if (query.trim()) {
      setIsSearching(true);
      try {
        const results = await searchDocumentation(query);
        setSearchResults(results);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsSearching(false);
      }
    }
  };

  return (
    <DocsPage title="Search Documentation">
      <div class="search-container">
        <input
          value={searchQuery()}
          onInput={e => handleSearch(e.target.value)}
          placeholder="Search documentation..."
          class="search-input"
        />

        {isSearching() && <div>Searching...</div>}

        <For each={searchResults()}>
          {result => (
            <div class="search-result">
              <h3>{result.title}</h3>
              <p>{result.excerpt}</p>
            </div>
          )}
        </For>
      </div>
    </DocsPage>
  );
};
```

### Nested Routes

Build hierarchical route structures for complex application layouts:

```tsx
import { Router, Route } from "@solidjs/router";

const App = () => (
  <Router>
    <Route path="/" component={Home} />
    <Route path="/dashboard">
      <Route path="/" component={Dashboard} />
      <Route path="/users" component={Users} />
      <Route path="/settings" component={Settings} />
    </Route>
  </Router>
);
```

## Performance Considerations

Optimize routing performance through strategic code splitting and
memory management. Proper performance optimization is crucial for large-scale applications.

### Code Splitting Strategy

**Vite Configuration for Optimal Chunking:**

```typescript
// vite.config.ts - Reynard pattern
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "solid-js": ["solid-js"],
          "solid-router": ["@solidjs/router"],
          "reynard-core": ["reynard-core"],
          "reynard-components": ["reynard-components"],
          "reynard-themes": ["reynard-themes"],
          "reynard-docs-core": ["reynard-docs-core"],
          "reynard-docs-components": ["reynard-docs-components"],
        },
      },
    },
  },
});
```

**Performance Optimization Strategies:**

1. **Route-Level Splitting**: Split at route boundaries for optimal loading
2. **Component-Level Splitting**: Split large components within routes
3. **Library Splitting**: Separate vendor libraries from application code
4. **Dynamic Imports**: Use dynamic imports for conditional features

### Memory Management

**Robust Lazy Loading with Error Handling:**

```tsx
// Production-ready lazy loading pattern
const LazyComponent = lazy(() =>
  import("./HeavyComponent").catch(() => ({
    default: () => (
      <div class="error-fallback">
        <h2>Failed to load component</h2>
        <p>Please refresh the page or try again later.</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    ),
  }))
);

// Usage with error boundary
const App = () => (
  <Router>
    <ErrorBoundary
      fallback={err => (
        <div class="route-error">
          <h2>Route Error</h2>
          <p>{err.message}</p>
          <button onClick={() => (window.location.href = "/")}>Go Home</button>
        </div>
      )}
    >
      <Route path="/heavy" component={LazyComponent} />
    </ErrorBoundary>
  </Router>
);
```

### Bundle Size Optimization

**Route-Based Code Splitting:**

```tsx
// Optimize bundle size by splitting routes
const routes: RouteDefinition[] = [
  // Core routes (loaded immediately)
  {
    path: "/",
    component: lazy(() => import("./pages/Home")),
  },

  // Feature routes (loaded on demand)
  {
    path: "/admin",
    component: lazy(() => import("./pages/Admin")),
  },
  {
    path: "/analytics",
    component: lazy(() => import("./pages/Analytics")),
  },

  // Heavy routes (loaded only when needed)
  {
    path: "/reports",
    component: lazy(() => import("./pages/Reports")),
  },
];
```

## Error Handling

Implement robust error handling for reliable route management. Proper error handling ensures graceful degradation and
better user experience.

### Route Error Boundaries

**Production Error Boundary Pattern:**

```tsx
import { ErrorBoundary } from "solid-js";

const App = () => (
  <Router>
    <ErrorBoundary
      fallback={err => (
        <div class="route-error-boundary">
          <h2>Something went wrong</h2>
          <p>Error: {err.message}</p>
          <button onClick={() => (window.location.href = "/")}>Return to Home</button>
        </div>
      )}
    >
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
    </ErrorBoundary>
  </Router>
);
```

### 404 Handling

**Comprehensive 404 Handling:**

```tsx
// Reynard CMS 404 pattern
const routes: RouteDefinition[] = [
  {
    path: "/",
    component: GalleryPage,
  },
  {
    path: "/login",
    component: LoginPage,
  },
  // ... other routes
  {
    path: "*404",
    component: NotFound,
  },
];

// Component-based 404 handling
const App = () => (
  <Router>
    <Route path="/" component={Home} />
    <Route path="/dashboard" component={Dashboard} />
    <Route path="/*" component={NotFound} />
  </Router>
);
```

### Error Recovery Strategies

**Graceful Error Recovery:**

```tsx
// Error recovery with retry mechanism
const ErrorRecovery: Component<{ error: Error; onRetry: () => void }> = props => {
  return (
    <div class="error-recovery">
      <h2>An error occurred</h2>
      <p>{props.error.message}</p>
      <div class="error-actions">
        <button onClick={props.onRetry}>Try Again</button>
        <button onClick={() => (window.location.href = "/")}>Go Home</button>
      </div>
    </div>
  );
};

// Usage in error boundary
const App = () => (
  <Router>
    <ErrorBoundary fallback={err => <ErrorRecovery error={err} onRetry={() => window.location.reload()} />}>
      <Route path="/" component={Home} />
    </ErrorBoundary>
  </Router>
);
```

## Testing Routes

Test routing functionality to ensure reliable navigation behavior. Comprehensive testing is essential for
maintaining route reliability in production applications.

### Unit Testing Routes

**Basic Route Testing:**

```tsx
import { render } from "@solidjs/testing-library";
import { Router, Route } from "@solidjs/router";

test("renders home route", () => {
  render(() => (
    <Router>
      <Route path="/" component={() => <div>Home</div>} />
    </Router>
  ));

  expect(screen.getByText("Home")).toBeInTheDocument();
});
```

**Testing with Route Parameters:**

```tsx
import { render } from "@solidjs/testing-library";
import { Router, Route } from "@solidjs/router";

test("renders package page with parameter", () => {
  render(() => (
    <Router>
      <Route path="/packages/:package" component={PackagePage} />
    </Router>
  ));

  // Navigate to a specific package
  window.history.pushState({}, "", "/packages/core");
  expect(screen.getByText("core Package")).toBeInTheDocument();
});
```

### Integration Testing

**Navigation Testing:**

```tsx
import { render, fireEvent } from "@solidjs/testing-library";
import { A } from "@solidjs/router";

test("navigates between routes", () => {
  render(() => (
    <Router>
      <A href="/about">About</A>
      <Route path="/" component={() => <div>Home</div>} />
      <Route path="/about" component={() => <div>About</div>} />
    </Router>
  ));

  fireEvent.click(screen.getByText("About"));
  expect(screen.getByText("About")).toBeInTheDocument();
});
```

### Mocking Router Hooks

**Testing Components with Router Dependencies:**

```tsx
// third_party/reynard/src/composables/useConnectionStatus.test.tsx
import { vi } from "vitest";

// Mock router hooks
vi.mock("@solidjs/router", () => ({
  Router: (props: any) => props.children,
  useLocation: () => ({
    pathname: "/test",
    search: "",
    hash: "",
    query: {},
  }),
  useNavigate: () => vi.fn(),
}));

test("handles connection status", () => {
  // Test component that uses router hooks
  const { result } = renderHook(() => useConnectionStatus());
  expect(result.current.isConnected).toBe(true);
});
```

### End-to-End Testing

**Playwright Route Testing:**

```tsx
// e2e/routing.spec.ts
import { test, expect } from "@playwright/test";

test("navigates through application routes", async ({ page }) => {
  await page.goto("/");

  // Test navigation to different routes
  await page.click('a[href="/dashboard"]');
  await expect(page).toHaveURL("/dashboard");

  await page.click('a[href="/settings"]');
  await expect(page).toHaveURL("/settings");

  // Test back navigation
  await page.goBack();
  await expect(page).toHaveURL("/dashboard");
});
```

## Best Practices

Follow established patterns for maintainable and
performant routing. These practices are derived from real-world implementations in the Reynard ecosystem.

### Route Organization

**Structured Route Configuration:**

```tsx
// Organize routes by feature and access level
const routes: RouteDefinition[] = [
  // Public routes
  {
    path: "/",
    component: lazy(() => import("./pages/Home")),
  },
  {
    path: "/login",
    component: lazy(() => import("./pages/Login")),
  },

  // Protected routes
  {
    path: "/dashboard",
    component: lazy(() => import("./pages/Dashboard")),
  },
  {
    path: "/admin",
    component: lazy(() => import("./pages/Admin")),
  },

  // API and utility routes
  {
    path: "/api/*path",
    component: lazy(() => import("./pages/ApiProxy")),
  },

  // Error handling
  {
    path: "*404",
    component: lazy(() => import("./pages/NotFound")),
  },
];
```

**Route Organization Principles:**

1. **Flat Structure**: Keep routes flat when possible for better performance
2. **Logical Grouping**: Group related routes together by feature
3. **Consistent Naming**: Use consistent naming conventions for routes and components
4. **Access Control**: Organize routes by access level (public, protected, admin)

### Performance Optimization

**Production Performance Patterns:**

1. **Lazy Loading**: Always lazy load route components
2. **Code Splitting**: Split routes at logical boundaries
3. **Bundle Optimization**: Use manual chunk splitting for optimal loading
4. **Preloading**: Preload critical routes during idle time

**Vite Configuration for Performance:**

```typescript
// Optimize bundle splitting for routing
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "solid-router": ["@solidjs/router"],
          "reynard-core": ["reynard-core"],
          "reynard-components": ["reynard-components"],
        },
      },
    },
  },
});
```

### Accessibility

**Accessible Navigation Patterns:**

1. **Semantic Navigation**: Use proper semantic HTML for navigation
2. **Focus Management**: Manage focus when navigating between routes
3. **Screen Reader Support**: Ensure routes are properly announced
4. **Keyboard Navigation**: Support keyboard navigation for all routes

**Accessible Route Implementation:**

```tsx
// Accessible navigation component
const AccessibleNav: Component = () => {
  return (
    <nav role="navigation" aria-label="Main navigation">
      <ul>
        <li>
          <A href="/" activeClass="active" aria-current="page">
            Home
          </A>
        </li>
        <li>
          <A href="/dashboard" activeClass="active">
            Dashboard
          </A>
        </li>
      </ul>
    </nav>
  );
};
```

## Troubleshooting

Resolve common routing issues with systematic debugging approaches. These solutions are based on
real-world problems encountered in production applications.

### Common Issues

**Routes Not Rendering:**

- Check that Router is the root component
- Verify path matching syntax
- Ensure components are properly exported
- Check for TypeScript compilation errors

**Navigation Not Working:**

- Use `<A>` component instead of `<a>` for internal links
- Check for JavaScript errors in console
- Verify route paths match exactly
- Ensure router context is properly provided

**Lazy Loading Failures:**

- Add error boundaries around lazy components
- Check import paths are correct
- Verify components have default exports
- Test import paths in browser console

### Debug Mode

**Development Debugging:**

```tsx
import { Router } from "@solidjs/router";

// Enable debug mode in development
const App = () => <Router debug={process.env.NODE_ENV === "development"}>{/* Your routes */}</Router>;
```

**Advanced Debugging Techniques:**

```tsx
// Debug route matching
const DebugRouter: Component = () => {
  const location = useLocation();

  createEffect(() => {
    console.log("Current route:", location.pathname);
    console.log("Search params:", location.search);
    console.log("Hash:", location.hash);
  });

  return <Router>{/* routes */}</Router>;
};

// Debug navigation
const DebugNavigation: Component = () => {
  const navigate = useNavigate();

  const debugNavigate = (path: string) => {
    console.log("Navigating to:", path);
    navigate(path);
  };

  return <button onClick={() => debugNavigate("/debug")}>Debug Navigation</button>;
};
```

### Performance Issues

**Route Performance Debugging:**

```tsx
// Monitor route loading performance
const PerformanceMonitor: Component = () => {
  const [loadTimes, setLoadTimes] = createSignal<Record<string, number>>({});

  const measureRouteLoad = (routeName: string) => {
    const start = performance.now();

    return () => {
      const end = performance.now();
      setLoadTimes(prev => ({
        ...prev,
        [routeName]: end - start,
      }));
    };
  };

  return (
    <div>
      <h3>Route Load Times:</h3>
      <For each={Object.entries(loadTimes())}>
        {([route, time]) => (
          <div>
            {route}: {time.toFixed(2)}ms
          </div>
        )}
      </For>
    </div>
  );
};
```

## Conclusion

Solid Router provides a comprehensive routing solution for SolidJS applications with excellent performance and
developer experience. Through real-world implementations in the Reynard ecosystem,
we've demonstrated how to build scalable, maintainable routing architectures.

### Key Implementation Patterns

**Production-Ready Routing:**

- Configuration-based routing for large applications
- Lazy loading with error boundaries for optimal performance
- Comprehensive error handling and recovery strategies
- Accessibility-first navigation patterns

**Performance Optimization:**

- Strategic code splitting and bundle optimization
- Route-level performance monitoring
- Memory management for large-scale applications

**Developer Experience:**

- Type-safe route parameters and navigation
- Comprehensive testing strategies
- Debug tools and troubleshooting techniques

### Best Practices Summary

1. **Use lazy loading** for optimal performance and bundle size
2. **Implement error boundaries** for graceful error handling
3. **Test routing logic thoroughly** with unit, integration, and E2E tests
4. **Follow accessibility best practices** for inclusive navigation
5. **Organize routes logically** by feature and access level
6. **Monitor performance** and optimize based on real usage patterns

### Real-World Applications

The patterns demonstrated in this guide are actively used in:

- **Reynard Documentation Site**: Complex documentation routing with search and navigation
- **Reynard CMS**: Media gallery routing with authentication and file handling
- **Reynard Dashboard**: Multi-page application with settings and analytics

These implementations showcase how Solid Router scales from simple single-page applications to
complex enterprise solutions while maintaining excellent performance and developer experience.

_Build robust navigation experiences with Solid Router in the Reynard ecosystem._
