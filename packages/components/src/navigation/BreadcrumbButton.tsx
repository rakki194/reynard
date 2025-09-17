/**
 * BreadcrumbButton Component
 * Specialized button components for breadcrumb navigation with consistent styling
 * and behavior patterns used in breadcrumb interfaces.
 */

import { Component, JSX, splitProps, mergeProps } from "solid-js";
import { Icon } from "../icons/Icon";

export interface BreadcrumbButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Icon name from the icon registry */
  icon: string;
  /** Icon package ID (optional) */
  iconPackageId?: string;
  /** Icon size */
  iconSize?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Icon variant */
  iconVariant?: "default" | "primary" | "secondary" | "muted" | "error" | "warning" | "success" | "info";
  /** Button variant */
  variant?: "default" | "primary" | "secondary" | "ghost" | "icon" | "danger" | "success" | "warning";
  /** Button size */
  size?: "sm" | "md" | "lg";
  /** Icon only button (no text) */
  iconOnly?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Active state */
  active?: boolean;
  /** Progress value (0-100) for progress bar */
  progress?: number;
  /** Glow effect */
  glow?: boolean;
  /** Glow color */
  glowColor?: string;
  /** Tooltip text */
  tooltip?: string;
  /** Whether this is a navigation action */
  isNavigation?: boolean;
  /** Whether this is a destructive action */
  isDestructive?: boolean;
  /** Whether this is a primary action */
  isPrimary?: boolean;
  /** Children content */
  children?: JSX.Element;
}

const defaultProps: Partial<BreadcrumbButtonProps> = {
  iconSize: "md",
  iconVariant: "default",
  variant: "default",
  size: "md",
  iconOnly: true,
  loading: false,
  disabled: false,
  active: false,
  isNavigation: false,
  isDestructive: false,
  isPrimary: false,
};

export const BreadcrumbButton: Component<BreadcrumbButtonProps> = props => {
  const merged = mergeProps(defaultProps, props);
  const [local, others] = splitProps(merged, [
    "icon",
    "iconPackageId",
    "iconSize",
    "iconVariant",
    "variant",
    "size",
    "iconOnly",
    "loading",
    "disabled",
    "active",
    "progress",
    "glow",
    "glowColor",
    "tooltip",
    "isNavigation",
    "isDestructive",
    "isPrimary",
    "children",
    "class",
    "aria-label",
    "title",
  ]);

  const getButtonClasses = () => {
    const classes = ["reynard-breadcrumb-button"];

    // Add variant class
    classes.push(`reynard-breadcrumb-button--${local.variant}`);

    // Add size class
    classes.push(`reynard-breadcrumb-button--${local.size}`);

    // Add state classes
    if (local.disabled || local.loading) {
      classes.push("reynard-breadcrumb-button--disabled");
    }

    if (local.loading) {
      classes.push("reynard-breadcrumb-button--loading");
    }

    if (local.iconOnly) {
      classes.push("reynard-breadcrumb-button--icon-only");
    }

    if (local.active) {
      classes.push("reynard-breadcrumb-button--active");
    }

    if (local.glow) {
      classes.push("reynard-breadcrumb-button--glow");
    }

    if (typeof local.progress === "number" && local.progress > 0) {
      classes.push("reynard-breadcrumb-button--with-progress");
    }

    // Add semantic classes
    if (local.isNavigation) {
      classes.push("reynard-breadcrumb-button--navigation");
    }

    if (local.isDestructive) {
      classes.push("reynard-breadcrumb-button--destructive");
    }

    if (local.isPrimary) {
      classes.push("reynard-breadcrumb-button--primary");
    }

    // Add custom class
    if (local.class) {
      classes.push(local.class);
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

  const getTooltip = () => {
    return local.tooltip || local["aria-label"] || local.title;
  };

  const getAriaLabel = () => {
    return local["aria-label"] || local.tooltip || local.title;
  };

  return (
    <button
      class={getButtonClasses()}
      disabled={local.disabled || local.loading}
      title={getTooltip()}
      aria-label={getAriaLabel()}
      {...others}
    >
      <span class="reynard-breadcrumb-button__icon">
        <Icon {...getIconProps()} />
      </span>

      {!local.iconOnly && local.children && <span class="reynard-breadcrumb-button__content">{local.children}</span>}

      {local.iconOnly && local.children}

      {typeof local.progress === "number" && local.progress > 0 && (
        <div class="reynard-breadcrumb-button__progress">
          <div
            class="reynard-breadcrumb-button__progress-bar"
            style={
              {
                "--progress-width": `${Math.max(0, Math.min(100, local.progress))}%`,
              } as any
            }
          />
        </div>
      )}
    </button>
  );
};

/**
 * BreadcrumbActionButton Component
 * A specialized breadcrumb button for common actions like create, delete, settings, etc.
 */
export interface BreadcrumbActionButtonProps extends Omit<BreadcrumbButtonProps, "icon"> {
  /** Action type for predefined styling and behavior */
  action?: "create" | "delete" | "edit" | "settings" | "refresh" | "upload" | "download" | "search" | "filter" | "sort";
  /** Custom icon name (overrides action icon) */
  icon?: string;
}

const actionIcons = {
  create: "add",
  delete: "delete",
  edit: "edit",
  settings: "settings",
  refresh: "refresh",
  upload: "upload",
  download: "download",
  search: "search",
  filter: "filter",
  sort: "sort",
};

const actionVariants: Record<string, BreadcrumbButtonProps["variant"]> = {
  create: "primary",
  delete: "danger",
  edit: "secondary",
  settings: "default",
  refresh: "default",
  upload: "primary",
  download: "secondary",
  search: "default",
  filter: "default",
  sort: "default",
};

export const BreadcrumbActionButton: Component<BreadcrumbActionButtonProps> = props => {
  const merged = mergeProps(defaultProps, props);
  const [local, others] = splitProps(merged, [
    "action",
    "icon",
    "iconPackageId",
    "iconSize",
    "iconVariant",
    "variant",
    "size",
    "iconOnly",
    "loading",
    "disabled",
    "active",
    "progress",
    "glow",
    "glowColor",
    "tooltip",
    "isNavigation",
    "isDestructive",
    "isPrimary",
    "children",
    "class",
    "aria-label",
    "title",
  ]);

  const getIconName = () => {
    if (local.icon) return local.icon;
    if (local.action && actionIcons[local.action]) return actionIcons[local.action];
    return "settings"; // fallback
  };

  const getVariant = (): BreadcrumbButtonProps["variant"] => {
    if (local.variant && local.variant !== "default") return local.variant;
    if (local.action && actionVariants[local.action]) return actionVariants[local.action];
    return "default";
  };

  const getSemanticProps = () => {
    const props: Partial<BreadcrumbButtonProps> = {};

    if (local.action === "delete") {
      props.isDestructive = true;
    } else if (local.action === "create" || local.action === "upload") {
      props.isPrimary = true;
    } else if (
      local.action === "refresh" ||
      local.action === "search" ||
      local.action === "filter" ||
      local.action === "sort"
    ) {
      props.isNavigation = true;
    }

    return props;
  };

  return (
    <BreadcrumbButton
      {...others}
      icon={getIconName()}
      variant={getVariant()}
      {...getSemanticProps()}
      iconPackageId={local.iconPackageId}
      iconSize={local.iconSize}
      iconVariant={local.iconVariant}
      size={local.size}
      iconOnly={local.iconOnly}
      loading={local.loading}
      disabled={local.disabled}
      active={local.active}
      progress={local.progress}
      glow={local.glow}
      glowColor={local.glowColor}
      tooltip={local.tooltip}
      class={local.class}
    >
      {local.children}
    </BreadcrumbButton>
  );
};
