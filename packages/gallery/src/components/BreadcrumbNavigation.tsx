/**
 * Breadcrumb Navigation Component
 * Shows the current path and allows navigation to parent folders
 */

import { Component, For, Show, createMemo } from "solid-js";
import { Button } from "reynard-components";
import type { BreadcrumbItem } from "../types";

export interface BreadcrumbNavigationProps {
  /** Breadcrumb items */
  breadcrumbs: BreadcrumbItem[];
  /** Navigation handler */
  onNavigate?: (path: string) => void;
  /** Whether to show up button */
  showUpButton?: boolean;
  /** Custom class name */
  class?: string;
}

export const BreadcrumbNavigation: Component<BreadcrumbNavigationProps> = props => {
  const handleNavigate = (path: string): void => {
    props.onNavigate?.(path);
  };

  const handleUpClick = (): void => {
    const currentBreadcrumb = props.breadcrumbs[props.breadcrumbs.length - 1];
    if (currentBreadcrumb && props.breadcrumbs.length > 1) {
      const parentBreadcrumb = props.breadcrumbs[props.breadcrumbs.length - 2];
      handleNavigate(parentBreadcrumb.path);
    }
  };

  const canNavigateUp = (): boolean => {
    return props.breadcrumbs.length > 1;
  };

  return (
    <nav class={`breadcrumb-navigation ${props.class || ""}`} aria-label="Folder navigation">
      <div class="breadcrumb-navigation__container">
        <Show when={props.showUpButton}>
          <Button
            variant="ghost"
            size="sm"
            disabled={!canNavigateUp()}
            onClick={handleUpClick}
            aria-label="Go up one level"
            title="Go up one level"
          >
            <span class="icon">arrow-up</span>
            Up
          </Button>
        </Show>

        <ol class="breadcrumb-navigation__list" role="list">
          <For each={props.breadcrumbs}>
            {(breadcrumb, index) => {
              const isLast = createMemo(() => index() === props.breadcrumbs.length - 1);

              return (
                <li class="breadcrumb-navigation__item" role="listitem">
                  <Show when={index() > 0}>
                    <span class="breadcrumb-navigation__separator" aria-hidden="true">
                      /
                    </span>
                  </Show>

                  <Show when={breadcrumb.clickable && !isLast}>
                    <button
                      type="button"
                      class="breadcrumb-navigation__link"
                      onClick={() => handleNavigate(breadcrumb.path)}
                      title={`Navigate to ${breadcrumb.label}`}
                    >
                      {breadcrumb.label}
                    </button>
                  </Show>

                  <Show when={!breadcrumb.clickable || isLast()}>
                    <span class="breadcrumb-navigation__current" aria-current={isLast() ? "page" : undefined}>
                      {breadcrumb.label}
                    </span>
                  </Show>
                </li>
              );
            }}
          </For>
        </ol>
      </div>
    </nav>
  );
};
