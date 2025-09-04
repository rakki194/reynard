/**
 * Gallery Component
 * Complete file gallery with navigation, upload, and management features
 */
import { Component } from "solid-js";
import "./Gallery.css";
import type {
  GalleryData,
  GalleryConfiguration,
  GalleryCallbacks,
} from "../types";
export interface GalleryProps extends Partial<GalleryConfiguration> {
  /** Gallery data */
  data?: GalleryData;
  /** Loading state */
  loading?: boolean;
  /** Error state */
  error?: string;
  /** Gallery callbacks */
  callbacks?: GalleryCallbacks;
  /** Whether to show upload zone */
  showUpload?: boolean;
  /** Whether to show breadcrumb navigation */
  showBreadcrumbs?: boolean;
  /** Whether to show toolbar */
  showToolbar?: boolean;
  /** Custom class name */
  class?: string;
}
export declare const Gallery: Component<GalleryProps>;
