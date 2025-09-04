/**
 * Tabs Component
 * A flexible tab navigation component with keyboard support
 */

import {
  Component,
  JSX,
  splitProps,
  mergeProps,
  createSignal,
  For,
  createEffect,
  children,
} from "solid-js";

export interface TabItem {
  id: string;
  label: string;
  disabled?: boolean;
  icon?: JSX.Element;
  badge?: string | number;
}

export interface TabsProps {
  /** Array of tab items */
  items: TabItem[];
  /** Currently active tab ID */
  activeTab: string;
  /** Function called when tab changes */
  onTabChange: (tabId: string) => void;
  /** Tab variant */
  variant?: "default" | "pills" | "underline";
  /** Tab size */
  size?: "sm" | "md" | "lg";
  /** Whether tabs should fill available width */
  fullWidth?: boolean;
  /** Tab content */
  children?: JSX.Element;
  /** Custom class name */
  class?: string;
}

const defaultProps: Partial<TabsProps> = {
  variant: "default",
  size: "md",
  fullWidth: false,
};

export const Tabs: Component<TabsProps> = (props) => {
  const merged = mergeProps(defaultProps, props);
  const [local] = splitProps(merged, [
    "items",
    "activeTab",
    "onTabChange",
    "variant",
    "size",
    "fullWidth",
    "children",
    "class",
  ]);

  let tabsRef: HTMLDivElement | undefined;
  const [focusedTab, setFocusedTab] = createSignal<string | null>(null);

  // Handle keyboard navigation
  const handleKeyDown = (e: KeyboardEvent, tabId: string) => {
    const currentIndex = local.items.findIndex((item) => item.id === tabId);
    let nextIndex = currentIndex;

    switch (e.key) {
      case "ArrowLeft":
        e.preventDefault();
        nextIndex =
          currentIndex > 0 ? currentIndex - 1 : local.items.length - 1;
        break;
      case "ArrowRight":
        e.preventDefault();
        nextIndex =
          currentIndex < local.items.length - 1 ? currentIndex + 1 : 0;
        break;
      case "Home":
        e.preventDefault();
        nextIndex = 0;
        break;
      case "End":
        e.preventDefault();
        nextIndex = local.items.length - 1;
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        local.onTabChange(tabId);
        return;
      default:
        return;
    }

    // Find next non-disabled tab
    while (local.items[nextIndex]?.disabled && nextIndex !== currentIndex) {
      if (e.key === "ArrowLeft" || e.key === "End") {
        nextIndex = nextIndex > 0 ? nextIndex - 1 : local.items.length - 1;
      } else {
        nextIndex = nextIndex < local.items.length - 1 ? nextIndex + 1 : 0;
      }
    }

    if (!local.items[nextIndex]?.disabled) {
      setFocusedTab(local.items[nextIndex].id);
      // Focus the tab button
      const tabButton = tabsRef?.querySelector(
        `[data-tab-id="${local.items[nextIndex].id}"]`,
      ) as HTMLButtonElement;
      tabButton?.focus();
    }
  };

  const getTabsClasses = () => {
    const classes = [
      "reynard-tabs",
      `reynard-tabs--${local.variant}`,
      `reynard-tabs--${local.size}`,
    ];

    if (local.fullWidth) classes.push("reynard-tabs--full-width");
    if (local.class) classes.push(local.class);

    return classes.join(" ");
  };

  const getTabClasses = (item: TabItem) => {
    const classes = ["reynard-tabs__tab"];

    if (item.id === local.activeTab) classes.push("reynard-tabs__tab--active");
    if (item.disabled) classes.push("reynard-tabs__tab--disabled");

    return classes.join(" ");
  };

  return (
    <div class={getTabsClasses()}>
      <div class="reynard-tabs__list" role="tablist" ref={tabsRef}>
        <For each={local.items}>
          {(item) => (
            <button
              type="button"
              role="tab"
              data-tab-id={item.id}
              class={getTabClasses(item)}
              aria-selected={item.id === local.activeTab ? "true" : "false"}
              aria-disabled={item.disabled ? "true" : "false"}
              disabled={item.disabled}
              tabindex={item.id === local.activeTab ? 0 : -1}
              onClick={() => !item.disabled && local.onTabChange(item.id)}
              onKeyDown={(e) => handleKeyDown(e, item.id)}
              onFocus={() => setFocusedTab(item.id)}
              onBlur={() => setFocusedTab(null)}
            >
              {item.icon && (
                <span class="reynard-tabs__tab-icon">{item.icon}</span>
              )}

              <span class="reynard-tabs__tab-label">{item.label}</span>

              {item.badge && (
                <span class="reynard-tabs__tab-badge">{item.badge}</span>
              )}
            </button>
          )}
        </For>
      </div>

      {local.children && (
        <div class="reynard-tabs__content">{local.children}</div>
      )}
    </div>
  );
};

// Tab Panel component for content
export interface TabPanelProps {
  /** Tab ID this panel belongs to */
  tabId: string;
  /** Currently active tab ID */
  activeTab: string;
  /** Panel content */
  children: JSX.Element;
  /** Custom class name */
  class?: string;
}

export const TabPanel: Component<TabPanelProps> = (props) => {
  const [local] = splitProps(props, [
    "tabId",
    "activeTab",
    "children",
    "class",
  ]);

  const isActive = () => local.tabId === local.activeTab;

  const getClasses = () => {
    const classes = ["reynard-tab-panel"];
    if (!isActive()) classes.push("reynard-tab-panel--hidden");
    if (local.class) classes.push(local.class);
    return classes.join(" ");
  };

  return (
    <div
      role="tabpanel"
      class={getClasses()}
      aria-hidden={!isActive() ? "true" : "false"}
      tabindex={isActive() ? 0 : -1}
    >
      {isActive() && local.children}
    </div>
  );
};
