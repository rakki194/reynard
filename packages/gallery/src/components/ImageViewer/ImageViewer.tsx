/**
 * ImageViewer Component
 * Advanced image viewer with zoom, pan, and navigation capabilities
 */

import { Component, splitProps } from "solid-js";
import "./ImageViewer.css";
import type { ImageViewerProps } from "./types";
import { useImageViewer } from "./composables";
import { ImageViewerCore } from "./components";

export const ImageViewer: Component<ImageViewerProps> = (props) => {
  const [local] = splitProps(props, [
    "src",
    "alt",
    "initialZoom",
    "minZoom",
    "maxZoom",
    "enablePan",
    "enableZoom",
    "showZoomControls",
    "showNavigationControls",
    "onZoomChange",
    "onPanChange",
    "class",
  ]);

  // Refs
  let containerRef: HTMLDivElement | undefined;
  let imageRef: HTMLImageElement | undefined;

  // Main composable that orchestrates everything
  const { config, state, events, imageClasses } = useImageViewer(
    local,
    () => containerRef,
    () => imageRef,
  );

  return (
    <ImageViewerCore
      {...local}
      config={config()}
      state={state}
      events={events}
      imageClasses={imageClasses}
      containerRef={containerRef}
      imageRef={imageRef}
    />
  );
};
