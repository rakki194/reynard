/**
 * SidebarButton Component
 * A specialized button component for sidebar navigation with support for secondary actions,
 * content areas, and various layout styles.
 */

import { Component, JSX, splitProps, mergeProps, For, Show } from "solid-js";
import { Icon } from "../icons/Icon";

export interface SidebarButtonProps
  extends Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  /** Icon name from the icon registry */
  icon: string;
  /** Icon package ID (optional) */
  iconPackageId?: string;
  /** Icon size */
  iconSize?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Icon variant */
  iconVariant?:
    | "default"
    | "primary"
    | "secondary"
    | "muted"
    | "error"
    | "warning"
    | "success"
    | "info";
  /** Whether the button is active/selected */
  active?: boolean;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Whether to show the button */
  show?: boolean;
  /** Custom CSS class for styling */
  class?: string;
  /** Button text/label */
  label?: string;
  /** Whether to show the label */
  showLabel?: boolean;
  /** Secondary icon (e.g., status indicator) */
  secondaryIcon?: string;
  /** Secondary icon variant */
  secondaryIconVariant?:
    | "default"
    | "primary"
    | "secondary"
    | "muted"
    | "error"
    | "warning"
    | "success"
    | "info";
  /** Whether to show secondary actions */
  showSecondaryActions?: boolean;
  /** Secondary action buttons */
  secondaryActions?: Array<{
    icon: string;
    variant?:
      | "default"
      | "primary"
      | "secondary"
      | "muted"
      | "error"
      | "warning"
      | "success"
      | "info";
    size?: "xs" | "sm" | "md" | "lg" | "xl";
    ariaLabel: string;
    tooltip: string;
    onClick: (e: MouseEvent) => void;
    disabled?: boolean;
  }>;
  /** Whether to show content area */
  showContent?: boolean;
  /** Content to display when active */
  content?: JSX.Element;
  /** Button layout style */
  layout?: "default" | "toggle" | "action" | "header";
  /** Loading state */
  loading?: boolean;
  /** Progress value (0-100) for progress bar */
  progress?: number;
  /** Glow effect */
  glow?: boolean;
  /** Glow color */
  glowColor?: string;
  /** Tooltip text */
  tooltip?: string;
}

const defaultProps: Partial<SidebarButtonProps> = {
  iconSize: "md",
  iconVariant: "default",
  active: false,
  disabled: false,
  show: true,
  showLabel: true,
  showSecondaryActions: false,
  showContent: false,
  layout: "default",
  loading: false,
};

export const SidebarButton: Component<SidebarButtonProps> = (props) => {
  const merged = mergeProps(defaultProps, props);
  const [local, others] = splitProps(merged, [
    "icon",
    "iconPackageId",
    "iconSize",
    "iconVariant",
    "active",
    "disabled",
    "show",
    "class",
    "label",
    "showLabel",
    "secondaryIcon",
    "secondaryIconVariant",
    "showSecondaryActions",
    "secondaryActions",
    "showContent",
    "content",
    "layout",
    "loading",
    "progress",
    "glow",
    "glowColor",
    "tooltip",
  ]);

  const getButtonClasses = () => {
    const classes = ["reynard-sidebar-button"];

    // Add layout class
    classes.push(`reynard-sidebar-button--${local.layout}`);

    // Add state classes
    if (local.active) {
      classes.push("reynard-sidebar-button--active");
    }

    if (local.disabled || local.loading) {
      classes.push("reynard-sidebar-button--disabled");
    }

    if (local.loading) {
      classes.push("reynard-sidebar-button--loading");
    }

    if (local.glow) {
      classes.push("reynard-sidebar-button--glow");
    }

    if (typeof local.progress === "number" && local.progress > 0) {
      classes.push("reynard-sidebar-button--with-progress");
    }

    // Add custom class
    if (local.class) {
      classes.push(local.class);
    }

    return classes.join(" ");
  };

  const getMainButtonClasses = () => {
    const classes = ["reynard-sidebar-button__main"];

    if (local.active) {
      classes.push("reynard-sidebar-button__main--active");
    }

    if (local.disabled || local.loading) {
      classes.push("reynard-sidebar-button__main--disabled");
    }

    return classes.join(" ");
  };

  const getIconProps = () => ({
    name: local.icon,
    packageId: local.iconPackageId,
    size: local.iconSize,
    variant: local.iconVariant,
    loading: local.loading,
    progress: local.progress,
    glow: local.glow,
    glowColor: local.glowColor,
    active: local.active,
  });

  const getSecondaryIconProps = () => ({
    name: local.secondaryIcon!,
    packageId: local.iconPackageId,
    size: local.iconSize,
    variant: local.secondaryIconVariant || local.iconVariant,
    active: local.active,
  });

  const getTooltip = () => {
    return local.tooltip || local["aria-label"] || local.title;
  };

  const getAriaLabel = () => {
    return local["aria-label"] || local.tooltip || local.title || local.label;
  };

  const displayIconSize = () => {
    const size = local.iconSize || "md";
    return size === "xs" ? "sm" : size;
  };

  return (
    <Show when={local.show !== false}>
      <div class={getButtonClasses()}>
        {/* Main button */}
        <button
          class={getMainButtonClasses()}
          disabled={local.disabled || local.loading}
          title={getTooltip()}
          aria-label={getAriaLabel()}
          {...others}
        >
          <Icon {...getIconProps()} />

          <Show when={local.showLabel && local.label}>
            <span class="reynard-sidebar-button__label">{local.label}</span>
          </Show>

          <Show when={local.secondaryIcon}>
            <Icon {...getSecondaryIconProps()} />
          </Show>
        </button>

        {/* Secondary actions */}
        <Show when={local.showSecondaryActions && local.secondaryActions}>
          <div class="reynard-sidebar-button__secondary-actions">
            <For each={local.secondaryActions}>
              {(action) => (
                <button
                  class="reynard-sidebar-button__secondary-action"
                  aria-label={action.ariaLabel}
                  title={action.tooltip}
                  onClick={action.onClick}
                  disabled={action.disabled}
                >
                  <Icon
                    name={action.icon}
                    size={action.size === "xs" ? "sm" : action.size || "sm"}
                    variant={action.variant || "default"}
                  />
                </button>
              )}
            </For>
          </div>
        </Show>

        {/* Content area */}
        <Show when={local.showContent && local.active && local.content}>
          <div class="reynard-sidebar-button__content">{local.content}</div>
        </Show>

        {/* Progress bar */}
        <Show when={typeof local.progress === "number" && local.progress > 0}>
          <div class="reynard-sidebar-button__progress">
            <div
              class="reynard-sidebar-button__progress-bar"
              style={
                {
                  "--progress-width": `${Math.max(0, Math.min(100, local.progress))}%`,
                } as any
              }
            />
          </div>
        </Show>
      </div>
    </Show>
  );
};
