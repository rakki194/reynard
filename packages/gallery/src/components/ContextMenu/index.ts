/**
 * ContextMenu Barrel Exports
 * Clean API boundary for the context menu system
 */

// Main component
export { ContextMenu } from "./ContextMenu";

// Sub-components
export { ContextMenuItemComponent } from "./ContextMenuItem";
export { ContextSubmenu } from "./ContextSubmenu";
export { ContextMenuRenderer } from "./ContextMenuRenderer";
export { ContextMenuBackdrop } from "./ContextMenuBackdrop";
export { ContextMenuContainer } from "./ContextMenuContainer";
export { ContextMenuSubmenuWrapper } from "./ContextMenuSubmenuWrapper";

// Composables
export { useContextMenu } from "./useContextMenu";
export { useContextMenuState } from "./useContextMenuState";
export { useKeyboardNavigation } from "./useKeyboardNavigation";
export { useContextMenuPositioning } from "./useContextMenuPositioning";
export { useContextMenuHandlers } from "./useContextMenuHandlers";
export { useContextMenuEffects } from "./useContextMenuEffects";

// Types
export type {
  ContextMenuItem as ContextMenuItemType,
  ContextMenuProps,
  ContextMenuState,
  ContextMenuHandlers,
  ContextMenuPositioning,
} from "./types";
