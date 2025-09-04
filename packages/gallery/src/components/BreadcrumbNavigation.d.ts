/**
 * Breadcrumb Navigation Component
 * Shows the current path and allows navigation to parent folders
 */
import { Component } from "solid-js";
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
export declare const BreadcrumbNavigation: Component<BreadcrumbNavigationProps>;
