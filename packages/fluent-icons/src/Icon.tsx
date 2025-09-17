/**
 * Reynard Icon System
 *
 * Enhanced icon components and utilities for the Reynard design system.
 * Uses the modular icon registry system with advanced features like progress bars,
 * glow effects, and interactive states.
 */

import {
  Component,
  JSX,
  createMemo,
  createSignal,
  onMount,
  onCleanup,
  splitProps,
} from "solid-js";
import { getIcon, iconRegistry } from "./index";

// Icon component props
export interface IconProps
  extends Omit<
    JSX.ButtonHTMLAttributes<HTMLButtonElement>,
    "children" | "role"
  > {
  name: string;
  packageId?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?:
    | "default"
    | "primary"
    | "secondary"
    | "muted"
    | "error"
    | "warning"
    | "success"
    | "info";
  class?: string;
  style?: JSX.CSSProperties;
  role?: string;
  "aria-label"?: string;
  "aria-hidden"?: boolean;
  title?: string;
  // Advanced features
  active?: boolean;
  loading?: boolean;
  progress?: number; // 0-100 for progress bar
  glow?: boolean;
  glowColor?: string;
  tooltip?: string;
  interactive?: boolean; // Makes icon clickable
}

/**
 * Enhanced Icon component for displaying SVG icons with advanced features
 */
export const Icon: Component<IconProps> = (props) => {
  const [localProps, buttonProps] = splitProps(props, [
    "name",
    "packageId",
    "size",
    "variant",
    "class",
    "style",
    "role",
    "aria-label",
    "aria-hidden",
    "title",
    "active",
    "loading",
    "progress",
    "glow",
    "glowColor",
    "tooltip",
    "interactive",
  ]);

  const [isPressed, setIsPressed] = createSignal(false);
  let buttonRef: HTMLButtonElement | undefined;

  const handleMouseDown = () => setIsPressed(true);
  const handleMouseUp = () => setIsPressed(false);
  const handleMouseLeave = () => setIsPressed(false);

  onMount(() => {
    if (buttonRef && localProps.interactive) {
      buttonRef.addEventListener("mousedown", handleMouseDown);
      buttonRef.addEventListener("mouseup", handleMouseUp);
      buttonRef.addEventListener("mouseleave", handleMouseLeave);
    }
  });

  onCleanup(() => {
    if (buttonRef && localProps.interactive) {
      buttonRef.removeEventListener("mousedown", handleMouseDown);
      buttonRef.removeEventListener("mouseup", handleMouseUp);
      buttonRef.removeEventListener("mouseleave", handleMouseLeave);
    }
  });

  const iconClasses = createMemo(() => {
    const classes = [
      "reynard-icon",
      `reynard-icon--${localProps.size || "md"}`,
      `reynard-icon--${localProps.variant || "default"}`,
    ];

    if (localProps.class) classes.push(localProps.class);
    if (localProps.active) classes.push("reynard-icon--active");
    if (localProps.loading) classes.push("reynard-icon--loading");
    if (localProps.interactive) classes.push("reynard-icon--interactive");
    if (isPressed()) classes.push("reynard-icon--pressed");
    if (localProps.glow) classes.push("reynard-icon--glow");
    if (typeof localProps.progress === "number" && localProps.progress > 0) {
      classes.push("reynard-icon--with-progress");
    }

    return classes.filter(Boolean).join(" ");
  });

  const iconElement = createMemo(() => {
    if (localProps.loading) {
      return getIcon("spinner", localProps.packageId);
    }
    return getIcon(localProps.name, localProps.packageId);
  });

  const getProgressValue = () => {
    if (typeof localProps.progress === "number") {
      return Math.max(0, Math.min(100, localProps.progress));
    }
    return 0;
  };

  const shouldShowProgress = () => {
    return typeof localProps.progress === "number" && localProps.progress > 0;
  };

  const getGlowStyle = () => {
    if (!localProps.glow) return localProps.style || {};

    const color = localProps.glowColor || "var(--accent)";
    return {
      ...localProps.style,
      "--glow-color": color,
      "--glow-intensity": "1",
    } as any;
  };

  const getTooltip = () => {
    return localProps.tooltip || localProps.title;
  };

  const getAriaLabel = () => {
    return localProps["aria-label"] || localProps.tooltip || localProps.title;
  };

  const iconContent = (
    <>
      <div class="reynard-icon__content">{iconElement()}</div>

      {shouldShowProgress() && (
        <div class="reynard-icon__progress">
          <div
            class="reynard-icon__progress-bar"
            style={{ "--progress-width": `${getProgressValue()}%` } as any}
          />
        </div>
      )}
    </>
  );

  if (localProps.interactive) {
    return (
      <button
        ref={buttonRef}
        type="button"
        class={iconClasses()}
        style={getGlowStyle()}
        title={getTooltip()}
        aria-label={getAriaLabel()}
        disabled={localProps.loading}
        data-testid="reynard-icon"
        {...buttonProps}
      >
        {iconContent}
      </button>
    );
  }

  return (
    <span
      class={iconClasses()}
      style={getGlowStyle()}
      {...(localProps.role && { role: localProps.role as any })}
      aria-label={getAriaLabel()}
      {...(localProps["aria-hidden"] !== undefined && {
        "aria-hidden": localProps["aria-hidden"] ? "true" : "false",
      })}
      title={getTooltip()}
      data-testid="reynard-icon"
    >
      {iconContent}
    </span>
  );
};

// Export individual icon components for convenience
export const Search = (props: Omit<IconProps, "name">) => (
  <Icon {...props} name="search" />
);
export const Upload = (props: Omit<IconProps, "name">) => (
  <Icon {...props} name="upload" />
);
export const FileText = (props: Omit<IconProps, "name">) => (
  <Icon {...props} name="file-text" />
);
export const Code = (props: Omit<IconProps, "name">) => (
  <Icon {...props} name="code" />
);
export const Database = (props: Omit<IconProps, "name">) => (
  <Icon {...props} name="database" />
);
export const Settings = (props: Omit<IconProps, "name">) => (
  <Icon {...props} name="settings" />
);
export const Download = (props: Omit<IconProps, "name">) => (
  <Icon {...props} name="download" />
);
export const Trash2 = (props: Omit<IconProps, "name">) => (
  <Icon {...props} name="delete" />
);
export const Eye = (props: Omit<IconProps, "name">) => (
  <Icon {...props} name="eye" />
);
export const Clock = (props: Omit<IconProps, "name">) => (
  <Icon {...props} name="clock" />
);
export const Zap = (props: Omit<IconProps, "name">) => (
  <Icon {...props} name="sparkle" />
); // Using sparkle as alternative
export const Brain = (props: Omit<IconProps, "name">) => (
  <Icon {...props} name="brain" />
);
