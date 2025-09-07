/**
 * ContextMenu Backdrop Component
 * Handles backdrop click to close menu
 */

import { Component } from "solid-js";

export interface ContextMenuBackdropProps {
  onClose: () => void;
}

/**
 * Backdrop component for context menu
 */
export const ContextMenuBackdrop: Component<ContextMenuBackdropProps> = (props) => {
  return (
    <div
      class="reynard-context-menu__backdrop"
      onClick={() => props.onClose()}
    />
  );
};
