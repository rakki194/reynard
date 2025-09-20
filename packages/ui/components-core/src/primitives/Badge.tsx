import { Component, JSX } from "solid-js";

export interface BadgeProps {
  children: JSX.Element;
  variant?: "default" | "secondary" | "destructive" | "outline";
  size?: "sm" | "md" | "lg";
  class?: string;
}

export const Badge: Component<BadgeProps> = props => {
  const variant = () => props.variant || "default";
  const size = () => props.size || "md";

  const getVariantClasses = () => {
    switch (variant()) {
      case "secondary":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100";
      case "destructive":
        return "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100";
      case "outline":
        return "border border-gray-200 text-gray-800 dark:border-gray-700 dark:text-gray-100";
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100";
    }
  };

  const getSizeClasses = () => {
    switch (size()) {
      case "sm":
        return "px-2 py-1 text-xs";
      case "lg":
        return "px-3 py-1.5 text-sm";
      default:
        return "px-2.5 py-1 text-xs";
    }
  };

  return (
    <span
      class={`inline-flex items-center rounded-full font-medium ${getVariantClasses()} ${getSizeClasses()} ${props.class || ""}`}
    >
      {props.children}
    </span>
  );
};
