import { Component, JSX, createComponent } from "solid-js";
import { render } from "@solidjs/testing-library";
import { vi } from "vitest";

/**
 * Custom render functions for different testing scenarios
 */

/**
 * Render with theme provider
 */
export function renderWithTheme(
  ui: () => JSX.Element,
  theme: any = { name: "light", colors: {} },
  options?: Omit<Parameters<typeof render>[1], "wrapper">,
): ReturnType<typeof render> {
  const ThemeProvider: Component<{ children: JSX.Element }> = (props) => {
    return createComponent(() => props.children, { theme });
  };

  return render(() => <ThemeProvider>{ui()}</ThemeProvider>, options);
}

/**
 * Render with router context
 */
export function renderWithRouter(
  ui: () => JSX.Element,
  initialUrl: string = "/",
  options?: Omit<Parameters<typeof render>[1], "wrapper">,
): ReturnType<typeof render> {
  const RouterProvider: Component<{ children: JSX.Element }> = (props) => {
    // Mock router context
    const routerContext = {
      location: {
        pathname: initialUrl,
        search: "",
        hash: "",
        href: initialUrl,
        origin: "http://localhost",
        protocol: "http:",
        host: "localhost",
        hostname: "localhost",
        port: "",
        state: null,
      },
      navigate: vi.fn(),
      params: {},
      query: {},
    };

    return createComponent(() => props.children, { router: routerContext });
  };

  return render(() => <RouterProvider>{ui()}</RouterProvider>, options);
}

/**
 * Render with notifications provider
 */
export function renderWithNotifications(
  ui: () => JSX.Element,
  options?: Omit<Parameters<typeof render>[1], "wrapper">,
): ReturnType<typeof render> {
  const NotificationsProvider: Component<{ children: JSX.Element }> = (
    props,
  ) => {
    const notificationsContext = {
      notifications: [],
      addNotification: vi.fn(),
      removeNotification: vi.fn(),
      clearNotifications: vi.fn(),
    };

    return createComponent(() => props.children, {
      notifications: notificationsContext,
    });
  };

  return render(
    () => <NotificationsProvider>{ui()}</NotificationsProvider>,
    options,
  );
}

/**
 * Render with all providers (theme, router, notifications)
 */
export function renderWithAllProviders(
  ui: () => JSX.Element,
  options: {
    theme?: any;
    initialUrl?: string;
    notifications?: any;
  } = {},
  renderOptions?: Omit<Parameters<typeof render>[1], "wrapper">,
): ReturnType<typeof render> {
  const {
    theme = { name: "light", colors: {} },
    initialUrl = "/",
    notifications = {},
  } = options;

  const AllProviders: Component<{ children: JSX.Element }> = (props) => {
    const context = {
      theme,
      router: {
        location: {
          pathname: initialUrl,
          search: "",
          hash: "",
          href: initialUrl,
          origin: "http://localhost",
          protocol: "http:",
          host: "localhost",
          hostname: "localhost",
          port: "",
          state: null,
        },
        navigate: vi.fn(),
        params: {},
        query: {},
      },
      notifications: {
        notifications: [],
        addNotification: vi.fn(),
        removeNotification: vi.fn(),
        clearNotifications: vi.fn(),
        ...notifications,
      },
    };

    return createComponent(() => props.children, context);
  };

  return render(() => <AllProviders>{ui()}</AllProviders>, renderOptions);
}

/**
 * Render with custom wrapper component
 */
export function renderWithWrapper<T extends Record<string, any>>(
  ui: () => JSX.Element,
  Wrapper: Component<{ children: JSX.Element } & T>,
  wrapperProps: T = {} as T,
  options?: Omit<Parameters<typeof render>[1], "wrapper">,
): ReturnType<typeof render> {
  return render(() => <Wrapper {...wrapperProps}>{ui()}</Wrapper>, options);
}

/**
 * Render with multiple providers in sequence
 */
export function renderWithProviders(
  ui: () => JSX.Element,
  providers: Component<{ children: JSX.Element }>[],
  options?: Omit<Parameters<typeof render>[1], "wrapper">,
): ReturnType<typeof render> {
  const CombinedProviders: Component<{ children: JSX.Element }> = (props) => {
    let result = props.children;

    // Wrap with each provider in reverse order
    for (let i = providers.length - 1; i >= 0; i--) {
      const Provider = providers[i];
      result = createComponent(Provider, { children: result });
    }

    return result;
  };

  return render(() => <CombinedProviders>{ui()}</CombinedProviders>, options);
}

/**
 * Render with error boundary
 */
export function renderWithErrorBoundary(
  ui: () => JSX.Element,
  onError: (error: Error) => void = vi.fn(),
  options?: Omit<Parameters<typeof render>[1], "wrapper">,
): ReturnType<typeof render> {
  const ErrorBoundary: Component<{ children: JSX.Element }> = (props) => {
    try {
      return props.children;
    } catch (error) {
      onError(error as Error);
      return createComponent(() => null, {});
    }
  };

  return render(() => <ErrorBoundary>{ui()}</ErrorBoundary>, options);
}

/**
 * Render with suspense boundary
 */
export function renderWithSuspense(
  ui: () => JSX.Element,
  fallback: JSX.Element = <div>Loading...</div>,
  options?: Omit<Parameters<typeof render>[1], "wrapper">,
): ReturnType<typeof render> {
  const SuspenseProvider: Component<{ children: JSX.Element }> = (props) => {
    // Mock suspense context
    const suspenseContext = {
      fallback,
      isSuspended: false,
      suspend: vi.fn(),
      resume: vi.fn(),
    };

    return createComponent(() => props.children, { suspense: suspenseContext });
  };

  return render(() => <SuspenseProvider>{ui()}</SuspenseProvider>, options);
}

/**
 * Render with performance monitoring
 */
export function renderWithPerformanceMonitoring(
  ui: () => JSX.Element,
  onRender: (renderTime: number) => void = vi.fn(),
  options?: Omit<Parameters<typeof render>[1], "wrapper">,
): ReturnType<typeof render> {
  const PerformanceProvider: Component<{ children: JSX.Element }> = (props) => {
    const startTime = performance.now();

    // Mock performance context
    const performanceContext = {
      startTime,
      endTime: 0,
      renderTime: 0,
      onRender,
    };

    // Simulate render completion
    setTimeout(() => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      performanceContext.endTime = endTime;
      performanceContext.renderTime = renderTime;
      onRender(renderTime);
    }, 0);

    return createComponent(() => props.children, {
      performance: performanceContext,
    });
  };

  return render(
    () => <PerformanceProvider>{ui()}</PerformanceProvider>,
    options,
  );
}
