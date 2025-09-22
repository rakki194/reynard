/**
 * Floating Panel Overlay Component
 *
 * Main overlay container that manages the backdrop and coordinates panel animations.
 * Based on Yipyap's sophisticated overlay system.
 */
import { createEffect, onCleanup } from "solid-js";
import type { FloatingPanelOverlayProps } from "../types.js";
import "./FloatingPanelOverlay.css";

export const FloatingPanelOverlay = (props: FloatingPanelOverlayProps) => {
  // Handle transition phase changes
  createEffect(() => {
    const phase = props.transitionPhase;
    if (phase) {
      props.onTransitionStart?.(phase);
      // Set up transition end callback
      const timeoutId = setTimeout(() => {
        props.onTransitionEnd?.(phase);
      }, 300); // Default transition duration
      onCleanup(() => clearTimeout(timeoutId));
    }
  });
  // Handle escape key to close overlay
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape" && props.isActive) {
      // Could emit close event here if needed
    }
  };
  createEffect(() => {
    if (props.isActive) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  });
  // Prevent body scroll when overlay is active
  createEffect(() => {
    if (props.isActive) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  });
  return (
    <div
      class={`floating-panel-overlay ${props.isActive ? "active" : ""} ${props.class || ""}`}
      data-transition-phase={props.transitionPhase || "idle"}
      tabIndex={-1}
      onPointerDown={props.onPointerDown}
      onPointerMove={props.onPointerMove}
      onPointerUp={props.onPointerUp}
      onMouseMove={props.onMouseMove}
      onMouseLeave={props.onMouseLeave}
      aria-label="Floating panel overlay"
      aria-hidden={!props.isActive}
    >
      {props.children}
    </div>
  );
};
