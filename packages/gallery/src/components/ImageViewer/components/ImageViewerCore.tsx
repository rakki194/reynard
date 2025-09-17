/**
 * ImageViewerCore Component
 * Core image display with event handling
 */

import { Component, Show } from "solid-js";
import type { ImageViewerProps, ImageViewerConfig } from "../types";
import { ZoomControls, NavigationControls, Instructions } from "./index";

export interface ImageViewerCoreProps extends ImageViewerProps {
  config: ImageViewerConfig;
  state: () => any;
  events: any;
  imageClasses: () => string;
  containerRef: HTMLDivElement | undefined;
  imageRef: HTMLImageElement | undefined;
}

export const ImageViewerCore: Component<ImageViewerCoreProps> = props => {
  return (
    <div
      class={`reynard-image-viewer ${props.class || ""}`}
      ref={props.containerRef}
      onWheel={props.events.handleWheel}
      onMouseDown={props.events.handleMouseDown}
      onMouseMove={props.events.handleMouseMove}
      onMouseUp={props.events.handleMouseUp}
      onMouseLeave={props.events.handleMouseUp}
    >
      {/* Image */}
      <img ref={props.imageRef} src={props.src} alt={props.alt || ""} class={props.imageClasses()} draggable={false} />

      {/* Zoom Controls */}
      <Show when={props.config.showZoomControls}>
        <ZoomControls
          zoom={props.state().zoom}
          minZoom={props.config.minZoom}
          maxZoom={props.config.maxZoom}
          onZoomIn={props.events.handleZoomIn}
          onZoomOut={props.events.handleZoomOut}
        />
      </Show>

      {/* Navigation Controls */}
      <Show when={props.config.showNavigationControls}>
        <NavigationControls onReset={props.events.handleReset} onFitToView={props.events.handleFitToView} />
      </Show>

      {/* Instructions */}
      <Instructions enableZoom={props.config.enableZoom} enablePan={props.config.enablePan} />
    </div>
  );
};
