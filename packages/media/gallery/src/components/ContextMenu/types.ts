/**
 * ContextMenu Types and Interfaces
 * Type definitions for the context menu system
 */

export interface ContextMenuItem {
  /** Unique identifier for the menu item */
  id: string;
  /** Display label */
  label: string;
  /** Optional icon */
  icon?: string;
  /** Whether the item is disabled */
  disabled?: boolean;
  /** Whether to show a separator after this item */
  separator?: boolean;
  /** Submenu items */
  submenu?: ContextMenuItem[];
  /** Click handler */
  onClick?: () => void;
}

export interface ContextMenuProps {
  /** Whether the context menu is visible */
  visible: boolean;
  /** X position of the context menu */
  x: number;
  /** Y position of the context menu */
  y: number;
  /** Array of menu items */
  items: ContextMenuItem[];
  /** Whether to show icons */
  showIcons?: boolean;
  /** Whether to enable keyboard navigation */
  enableKeyboard?: boolean;
  /** Callback when the context menu should close */
  onClose: () => void;
  /** Custom class name */
  class?: string;
}

export interface ContextMenuState {
  selectedIndex: number;
  submenuOpen: number | null;
  isVisible: boolean;
}

export interface ContextMenuHandlers {
  handleOutsideClick: (event: MouseEvent) => void;
  handleKeyDown: (event: KeyboardEvent) => void;
  handleItemClick: (item: ContextMenuItem) => void;
  handleItemMouseEnter: (index: number) => void;
  handleItemMouseLeave: () => void;
}

export interface ContextMenuPositioning {
  setMenuPosition: () => void;
  setSubmenuPosition: () => void;
}
