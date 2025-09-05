/**
 * Reynard Icon System
 *
 * Icon components and utilities for the Reynard design system.
 * Uses the modular icon registry system.
 */

import { Component, JSX, createMemo } from "solid-js";
import { getIcon, iconRegistry } from "@reynard/fluent-icons";

// Icon component props
export interface IconProps {
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
}

/**
 * Icon component for displaying SVG icons
 */
export const Icon: Component<IconProps> = (props) => {
  const {
    name,
    packageId,
    size = "md",
    variant = "default",
    class: className,
    style,
    role,
    "aria-label": ariaLabel,
    "aria-hidden": ariaHidden,
    title,
  } = props;

  const iconClasses = createMemo(() => {
    const classes = [
      "reynard-icon",
      `reynard-icon--${size}`,
      `reynard-icon--${variant}`,
    ];
    if (className) classes.push(className);
    return classes.filter(Boolean).join(" ");
  });

  const iconElement = createMemo(() => {
    return getIcon(name, packageId);
  });

  return (
    <span
      class={iconClasses()}
      style={style}
      {...(role && { role: role as any })}
      aria-label={ariaLabel}
      {...(ariaHidden !== undefined && {
        "aria-hidden": ariaHidden ? "true" : "false",
      })}
      title={title}
      data-testid="reynard-icon"
    >
      {iconElement()}
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

// Export registry utilities
export {
  iconRegistry,
  getIcon,
  searchIcons,
  getAllIconNames,
  getIconPackages,
} from "@reynard/fluent-icons";
