/**
 * App Layout Component
 * Main application layout with sidebar, header, and content areas
 */

import { Component, JSX, createSignal, splitProps, Show, onMount, onCleanup } from "solid-js";

export interface AppLayoutProps {
  /** Header content */
  header?: JSX.Element;
  /** Sidebar content */
  sidebar?: JSX.Element;
  /** Main content */
  children: JSX.Element;
  /** Footer content */
  footer?: JSX.Element;
  /** Whether sidebar is collapsible */
  collapsible?: boolean;
  /** Default sidebar state */
  defaultSidebarOpen?: boolean;
  /** Sidebar width when open */
  sidebarWidth?: number;
  /** Collapsed sidebar width */
  collapsedWidth?: number;
  /** Whether to persist sidebar state */
  persistSidebarState?: boolean;
  /** Breakpoint for mobile behavior */
  mobileBreakpoint?: number;
  /** Custom class name */
  class?: string;
  /** Overlay mode on mobile */
  overlayOnMobile?: boolean;
}

const defaultProps = {
  collapsible: true,
  defaultSidebarOpen: true,
  sidebarWidth: 280,
  collapsedWidth: 60,
  persistSidebarState: true,
  mobileBreakpoint: 768,
  overlayOnMobile: true,
};

export const AppLayout: Component<AppLayoutProps> = props => {
  const merged = { ...defaultProps, ...props };
  const [local, others] = splitProps(merged, [
    "header",
    "sidebar",
    "children",
    "footer",
    "collapsible",
    "defaultSidebarOpen",
    "sidebarWidth",
    "collapsedWidth",
    "persistSidebarState",
    "mobileBreakpoint",
    "class",
    "overlayOnMobile",
  ]);

  // Responsive state
  const [isMobile, setIsMobile] = createSignal(false);

  // Sidebar state - simplified for now, we can add persistence later
  const [sidebarOpen, setSidebarOpen] = createSignal(local.defaultSidebarOpen);
  const [sidebarCollapsed, setSidebarCollapsed] = createSignal(false);

  // Check if we're on mobile
  const checkMobile = () => {
    setIsMobile(window.innerWidth < local.mobileBreakpoint);
  };

  onMount(() => {
    checkMobile();
    window.addEventListener("resize", checkMobile);
  });

  onCleanup(() => {
    window.removeEventListener("resize", checkMobile);
  });

  // Close sidebar on mobile when clicking outside
  const handleOverlayClick = () => {
    if (isMobile() && local.overlayOnMobile) {
      setSidebarOpen(false);
    }
  };

  // Keyboard shortcuts
  onMount(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + B to toggle sidebar
      if ((e.ctrlKey || e.metaKey) && e.key === "b") {
        e.preventDefault();
        toggleSidebar();
      }
      // Escape to close sidebar on mobile
      if (e.key === "Escape" && isMobile() && sidebarOpen()) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    onCleanup(() => {
      document.removeEventListener("keydown", handleKeyDown);
    });
  });

  const toggleSidebar = () => {
    if (isMobile()) {
      setSidebarOpen(!sidebarOpen());
    } else {
      setSidebarCollapsed(!sidebarCollapsed());
    }
  };

  const getLayoutClasses = () => {
    const classes = ["reynard-app-layout"];
    if (sidebarOpen()) classes.push("reynard-app-layout--sidebar-open");
    if (sidebarCollapsed()) classes.push("reynard-app-layout--sidebar-collapsed");
    if (isMobile()) classes.push("reynard-app-layout--mobile");

    // Add width classes
    if (sidebarOpen()) {
      if (isMobile()) {
        classes.push("reynard-app-layout--sidebar-width-280");
      } else if (sidebarCollapsed()) {
        classes.push("reynard-app-layout--sidebar-width-60");
      } else {
        classes.push("reynard-app-layout--sidebar-width-280");
      }
    } else {
      classes.push("reynard-app-layout--sidebar-width-0");
    }

    if (local.class) classes.push(local.class);
    return classes.join(" ");
  };

  const getSidebarClasses = () => {
    const classes = ["reynard-app-layout__sidebar"];
    if (!sidebarOpen()) classes.push("reynard-app-layout__sidebar--closed");
    if (sidebarOpen()) classes.push("reynard-app-layout__sidebar--open");
    if (isMobile() && local.overlayOnMobile) classes.push("reynard-app-layout__sidebar--fixed");
    if (!isMobile() || !local.overlayOnMobile) classes.push("reynard-app-layout__sidebar--relative");
    return classes.join(" ");
  };

  const getMainClasses = () => {
    const classes = ["reynard-app-layout__main"];
    if (sidebarOpen() && !isMobile()) classes.push("reynard-app-layout__main--with-sidebar");
    if (!sidebarOpen() || isMobile()) classes.push("reynard-app-layout__main--without-sidebar");
    return classes.join(" ");
  };

  return (
    <div class={getLayoutClasses()} {...others}>
      {/* Mobile overlay */}
      <Show when={isMobile() && sidebarOpen() && local.overlayOnMobile}>
        <div class="reynard-app-layout__overlay" onClick={handleOverlayClick} />
      </Show>

      {/* Sidebar */}
      <Show when={local.sidebar}>
        <aside class={getSidebarClasses()} data-collapsed={sidebarCollapsed()} data-mobile={isMobile()}>
          <div class="reynard-app-layout__sidebar-content">{local.sidebar}</div>

          {/* Sidebar toggle button */}
          <Show when={local.collapsible}>
            <button
              type="button"
              class="reynard-app-layout__sidebar-toggle"
              onClick={toggleSidebar}
              aria-label={sidebarOpen() ? "Close sidebar" : "Open sidebar"}
              title={`${sidebarOpen() ? "Close" : "Open"} sidebar (Ctrl+B)`}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="currentColor"
                class={
                  sidebarOpen()
                    ? "reynard-app-layout__sidebar-toggle-icon--rotated"
                    : "reynard-app-layout__sidebar-toggle-icon--normal"
                }
              >
                <path d="M6.22 3.22a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06L7.28 12.78a.75.75 0 01-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 010-1.06z" />
              </svg>
            </button>
          </Show>
        </aside>
      </Show>

      {/* Main content area */}
      <div class={getMainClasses()}>
        {/* Header */}
        <Show when={local.header}>
          <header class="reynard-app-layout__header">{local.header}</header>
        </Show>

        {/* Content */}
        <main class="reynard-app-layout__content">{local.children}</main>

        {/* Footer */}
        <Show when={local.footer}>
          <footer class="reynard-app-layout__footer">{local.footer}</footer>
        </Show>
      </div>
    </div>
  );
};
