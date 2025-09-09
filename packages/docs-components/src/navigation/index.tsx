/**
 * @fileoverview Navigation components for documentation sites
 */

import { Component, JSX, createSignal, For, Show } from "solid-js";
// import { Button } from 'reynard-components';

/**
 * Main navigation component
 */
export const DocsNav: Component<{
  items: Array<{
    label: string;
    href?: string;
    icon?: string;
    children?: any[];
    external?: boolean;
    badge?: string;
    color?: string;
  }>;
  orientation?: "horizontal" | "vertical";
  className?: string;
}> = (props) => {
  return (
    <nav
      class={`docs-nav docs-nav--${props.orientation || "horizontal"} ${props.className || ""}`}
    >
      <ul class="docs-nav-list">
        <For each={props.items}>{(item) => <DocsNavItem item={item} />}</For>
      </ul>
    </nav>
  );
};

/**
 * Navigation item component
 */
const DocsNavItem: Component<{
  item: {
    label: string;
    href?: string;
    icon?: string;
    children?: any[];
    external?: boolean;
    badge?: string;
    color?: string;
  };
}> = (props) => {
  const [isExpanded, setIsExpanded] = createSignal(false);
  const hasChildren = () =>
    props.item.children && props.item.children.length > 0;

  return (
    <li class="docs-nav-item">
      <Show when={props.item.href}>
        <a
          href={props.item.href}
          class="docs-nav-link"
          target={props.item.external ? "_blank" : undefined}
          rel={props.item.external ? "noopener noreferrer" : undefined}
        >
          <Show when={props.item.icon}>
            <span class="docs-nav-icon">{props.item.icon}</span>
          </Show>
          <span class="docs-nav-label">{props.item.label}</span>
          <Show when={props.item.badge}>
            <span class="docs-nav-badge">{props.item.badge}</span>
          </Show>
          <Show when={props.item.external}>
            <span class="docs-nav-external">↗</span>
          </Show>
        </a>
      </Show>

      <Show when={!props.item.href}>
        <button
          class="docs-nav-button"
          onClick={() => hasChildren() && setIsExpanded(!isExpanded())}
        >
          <Show when={props.item.icon}>
            <span class="docs-nav-icon">{props.item.icon}</span>
          </Show>
          <span class="docs-nav-label">{props.item.label}</span>
          <Show when={props.item.badge}>
            <span class="docs-nav-badge">{props.item.badge}</span>
          </Show>
          <Show when={hasChildren()}>
            <span class={`docs-nav-arrow ${isExpanded() ? "expanded" : ""}`}>
              ▼
            </span>
          </Show>
        </button>
      </Show>

      <Show when={hasChildren() && isExpanded()}>
        <ul class="docs-nav-sublist">
          <For each={props.item.children}>
            {(child) => <DocsNavItem item={child} />}
          </For>
        </ul>
      </Show>
    </li>
  );
};

/**
 * Breadcrumb navigation component
 */
export const DocsBreadcrumbs: Component<{
  items: Array<{
    label: string;
    href?: string;
  }>;
  separator?: string;
  className?: string;
}> = (props) => {
  const separator = () => props.separator || "/";

  return (
    <nav
      class={`docs-breadcrumbs ${props.className || ""}`}
      aria-label="Breadcrumb"
    >
      <ol class="docs-breadcrumbs-list">
        <For each={props.items}>
          {(item, index) => (
            <li class="docs-breadcrumbs-item">
              <Show when={item.href && index() < props.items.length - 1}>
                <a href={item.href} class="docs-breadcrumbs-link">
                  {item.label}
                </a>
              </Show>
              <Show when={!item.href || index() === props.items.length - 1}>
                <span class="docs-breadcrumbs-current" aria-current="page">
                  {item.label}
                </span>
              </Show>
              <Show when={index() < props.items.length - 1}>
                <span class="docs-breadcrumbs-separator" aria-hidden="true">
                  {separator()}
                </span>
              </Show>
            </li>
          )}
        </For>
      </ol>
    </nav>
  );
};

/**
 * Table of contents component
 */
export const DocsTOC: Component<{
  headings: Array<{
    id: string;
    text: string;
    level: number;
  }>;
  activeId?: string;
  onNavigate?: (id: string) => void;
  className?: string;
}> = (props) => {
  return (
    <nav
      class={`docs-toc ${props.className || ""}`}
      aria-label="Table of contents"
    >
      <h3 class="docs-toc-title">On this page</h3>
      <ul class="docs-toc-list">
        <For each={props.headings}>
          {(heading) => (
            <li class={`docs-toc-item docs-toc-item--${heading.level}`}>
              <a
                href={`#${heading.id}`}
                class={`docs-toc-link ${props.activeId === heading.id ? "active" : ""}`}
                onClick={(e) => {
                  e.preventDefault();
                  props.onNavigate?.(heading.id);
                }}
              >
                {heading.text}
              </a>
            </li>
          )}
        </For>
      </ul>
    </nav>
  );
};

/**
 * Pagination component
 */
export const DocsPagination: Component<{
  current: number;
  total: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  maxVisible?: number;
  className?: string;
}> = (props) => {
  const maxVisible = () => props.maxVisible || 5;
  const showFirstLast = () => props.showFirstLast !== false;
  const showPrevNext = () => props.showPrevNext !== false;

  const getVisiblePages = () => {
    const pages: number[] = [];
    const total = props.total;
    const current = props.current;
    const max = maxVisible();

    if (total <= max) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      const half = Math.floor(max / 2);
      let start = Math.max(1, current - half);
      let end = Math.min(total, start + max - 1);

      if (end - start + 1 < max) {
        start = Math.max(1, end - max + 1);
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }

    return pages;
  };

  return (
    <nav
      class={`docs-pagination ${props.className || ""}`}
      aria-label="Pagination"
    >
      <ul class="docs-pagination-list">
        <Show when={showFirstLast() && getVisiblePages()[0] > 1}>
          <li class="docs-pagination-item">
            <button
              class="docs-pagination-button"
              onClick={() => props.onPageChange(1)}
              aria-label="Go to first page"
            >
              ««
            </button>
          </li>
        </Show>

        <Show when={showPrevNext() && props.current > 1}>
          <li class="docs-pagination-item">
            <button
              class="docs-pagination-button"
              onClick={() => props.onPageChange(props.current - 1)}
              aria-label="Go to previous page"
            >
              ‹
            </button>
          </li>
        </Show>

        <For each={getVisiblePages()}>
          {(page) => (
            <li class="docs-pagination-item">
              <button
                class={`docs-pagination-button ${page === props.current ? "active" : ""}`}
                onClick={() => props.onPageChange(page)}
                aria-label={`Go to page ${page}`}
                aria-current={page === props.current ? "page" : undefined}
              >
                {page}
              </button>
            </li>
          )}
        </For>

        <Show when={showPrevNext() && props.current < props.total}>
          <li class="docs-pagination-item">
            <button
              class="docs-pagination-button"
              onClick={() => props.onPageChange(props.current + 1)}
              aria-label="Go to next page"
            >
              ›
            </button>
          </li>
        </Show>

        <Show
          when={
            showFirstLast() &&
            getVisiblePages()[getVisiblePages().length - 1] < props.total
          }
        >
          <li class="docs-pagination-item">
            <button
              class="docs-pagination-button"
              onClick={() => props.onPageChange(props.total)}
              aria-label="Go to last page"
            >
              »»
            </button>
          </li>
        </Show>
      </ul>
    </nav>
  );
};

/**
 * Tab navigation component
 */
export const DocsTabs: Component<{
  tabs: Array<{
    id: string;
    label: string;
    icon?: string;
    badge?: string;
    disabled?: boolean;
  }>;
  activeTab: string;
  onTabChange: (tabId: string) => void;
  orientation?: "horizontal" | "vertical";
  className?: string;
}> = (props) => {
  return (
    <div
      class={`docs-tabs docs-tabs--${props.orientation || "horizontal"} ${props.className || ""}`}
    >
      <div class="docs-tabs-list" role="tablist">
        <For each={props.tabs}>
          {(tab) => (
            <button
              class={`docs-tab ${props.activeTab === tab.id ? "active" : ""} ${tab.disabled ? "disabled" : ""}`}
              role="tab"
              aria-selected={props.activeTab === tab.id}
              aria-controls={`panel-${tab.id}`}
              id={`tab-${tab.id}`}
              onClick={() => !tab.disabled && props.onTabChange(tab.id)}
              disabled={tab.disabled}
            >
              <Show when={tab.icon}>
                <span class="docs-tab-icon">{tab.icon}</span>
              </Show>
              <span class="docs-tab-label">{tab.label}</span>
              <Show when={tab.badge}>
                <span class="docs-tab-badge">{tab.badge}</span>
              </Show>
            </button>
          )}
        </For>
      </div>
    </div>
  );
};

/**
 * Tab panel component
 */
export const DocsTabPanel: Component<{
  tabId: string;
  activeTab: string;
  children: JSX.Element;
  className?: string;
}> = (props) => {
  const isActive = () => props.activeTab === props.tabId;

  return (
    <div
      class={`docs-tab-panel ${props.className || ""} ${isActive() ? "active" : ""}`}
      role="tabpanel"
      id={`panel-${props.tabId}`}
      aria-labelledby={`tab-${props.tabId}`}
      hidden={!isActive()}
    >
      {props.children}
    </div>
  );
};
