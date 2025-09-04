/**
 * Breadcrumb Component
 * Hierarchical navigation component with customizable separators
 */

import {
  Component,
  JSX,
  splitProps,
  For,
  Show,
  createMemo,
} from "solid-js";

export interface BreadcrumbItem {
  /** Unique identifier */
  id: string;
  /** Display label */
  label: string;
  /** Link href (optional for current page) */
  href?: string;
  /** Whether this is the current page */
  current?: boolean;
  /** Icon element */
  icon?: JSX.Element;
  /** Whether item is disabled */
  disabled?: boolean;
}

export interface BreadcrumbProps {
  /** Breadcrumb items */
  items: BreadcrumbItem[];
  /** Custom separator */
  separator?: JSX.Element | string;
  /** Maximum number of items to show before collapsing */
  maxItems?: number;
  /** Show home icon for first item */
  showHomeIcon?: boolean;
  /** Custom class name */
  class?: string;
  /** Click handler for items */
  onItemClick?: (item: BreadcrumbItem, event: MouseEvent) => void;
}

const defaultProps = {
  separator: "/",
  maxItems: 5,
  showHomeIcon: false,
};

export const Breadcrumb: Component<BreadcrumbProps> = (props) => {
  const merged = { ...defaultProps, ...props };
  const [local, others] = splitProps(merged, [
    "items",
    "separator",
    "maxItems",
    "showHomeIcon",
    "class",
    "onItemClick",
  ]);

  const processedItems = createMemo(() => {
    const items = local.items;
    
    if (items.length <= local.maxItems) {
      return items;
    }

    // Show first item, ellipsis, and last few items
    const firstItem = items[0];
    const lastItems = items.slice(-(local.maxItems - 2));
    
    return [
      firstItem,
      {
        id: "ellipsis",
        label: "...",
        disabled: true,
      } as BreadcrumbItem,
      ...lastItems,
    ];
  });

  const handleItemClick = (item: BreadcrumbItem, event: MouseEvent) => {
    if (item.disabled || item.current) {
      event.preventDefault();
      return;
    }
    
    local.onItemClick?.(item, event);
  };

  const getClasses = () => {
    const classes = ["reynard-breadcrumb"];
    if (local.class) classes.push(local.class);
    return classes.join(" ");
  };

  const getItemClasses = (item: BreadcrumbItem) => {
    const classes = ["reynard-breadcrumb__item"];
    if (item.current) classes.push("reynard-breadcrumb__item--current");
    if (item.disabled) classes.push("reynard-breadcrumb__item--disabled");
    return classes.join(" ");
  };

  const getLinkClasses = (item: BreadcrumbItem) => {
    const classes = ["reynard-breadcrumb__link"];
    if (item.current) classes.push("reynard-breadcrumb__link--current");
    if (item.disabled) classes.push("reynard-breadcrumb__link--disabled");
    return classes.join(" ");
  };

  const renderSeparator = () => {
    if (typeof local.separator === "string") {
      return (
        <span class="reynard-breadcrumb__separator" aria-hidden="true">
          {local.separator}
        </span>
      );
    }
    return (
      <span class="reynard-breadcrumb__separator" aria-hidden="true">
        {local.separator}
      </span>
    );
  };

  const renderHomeIcon = () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M8.354 1.146a.5.5 0 0 0-.708 0l-6 6A.5.5 0 0 0 1.5 7.5v7a.5.5 0 0 0 .5.5h4.5a.5.5 0 0 0 .5-.5v-4h2v4a.5.5 0 0 0 .5.5H14a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.146-.354L8.354 1.146zM2.5 14V7.707l5.5-5.5 5.5 5.5V14H10v-4a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5v4H2.5z" />
    </svg>
  );

  const renderEllipsis = () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
    </svg>
  );

  return (
    <nav
      class={getClasses()}
      aria-label="Breadcrumb navigation"
      {...others}
    >
      <ol class="reynard-breadcrumb__list">
        <For each={processedItems()}>
          {(item, index) => (
            <li class={getItemClasses(item)}>
              <Show
                when={item.href && !item.disabled && !item.current}
                fallback={
                  <span
                    class={getLinkClasses(item)}
                    aria-current={item.current ? "page" : undefined}
                  >
                    <Show when={item.id === "ellipsis"}>
                      {renderEllipsis()}
                    </Show>
                    <Show when={item.id !== "ellipsis"}>
                      <Show when={item.icon || (local.showHomeIcon && index() === 0)}>
                        <span class="reynard-breadcrumb__icon">
                          {item.icon || (local.showHomeIcon && index() === 0 ? renderHomeIcon() : null)}
                        </span>
                      </Show>
                      <span class="reynard-breadcrumb__text">{item.label}</span>
                    </Show>
                  </span>
                }
              >
                <a
                  href={item.href}
                  class={getLinkClasses(item)}
                  onClick={(e) => handleItemClick(item, e)}
                  aria-current={item.current ? "page" : undefined}
                >
                  <Show when={item.icon || (local.showHomeIcon && index() === 0)}>
                    <span class="reynard-breadcrumb__icon">
                      {item.icon || (local.showHomeIcon && index() === 0 ? renderHomeIcon() : null)}
                    </span>
                  </Show>
                  <span class="reynard-breadcrumb__text">{item.label}</span>
                </a>
              </Show>

              {/* Separator */}
              <Show when={index() < processedItems().length - 1}>
                {renderSeparator()}
              </Show>
            </li>
          )}
        </For>
      </ol>
    </nav>
  );
};
