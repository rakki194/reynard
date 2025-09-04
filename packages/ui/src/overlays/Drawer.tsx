/**
 * Drawer Component
 * Slide-out panel component with backdrop and animations
 */

import {
  Component,
  JSX,
  splitProps,
  mergeProps,
  createEffect,
  Show,
  onCleanup,
} from "solid-js";
import { Portal } from "solid-js/web";
import "./Drawer.css";

export interface DrawerProps {
  /** Whether the drawer is open */
  open: boolean;
  /** Function to call when drawer should close */
  onClose?: () => void;
  /** Drawer position */
  position?: "left" | "right" | "top" | "bottom";
  /** Drawer size */
  size?: "sm" | "md" | "lg" | "xl" | "full";
  /** Custom width/height (overrides size) */
  customSize?: string;
  /** Whether to show close button */
  showCloseButton?: boolean;
  /** Whether clicking backdrop closes drawer */
  closeOnBackdrop?: boolean;
  /** Whether pressing escape closes drawer */
  closeOnEscape?: boolean;
  /** Drawer title */
  title?: JSX.Element;
  /** Drawer content */
  children?: JSX.Element;
  /** Footer content */
  footer?: JSX.Element;
  /** Custom class name */
  class?: string;
  /** Z-index for the drawer */
  zIndex?: number;
}

const defaultProps: Partial<DrawerProps> = {
  position: "right",
  size: "md",
  showCloseButton: true,
  closeOnBackdrop: true,
  closeOnEscape: true,
  zIndex: 1000,
};



export const Drawer: Component<DrawerProps> = (props) => {
  const merged = mergeProps(defaultProps, props);
  const [local] = splitProps(merged, [
    "open",
    "onClose",
    "position",
    "size",
    "customSize",
    "showCloseButton",
    "closeOnBackdrop",
    "closeOnEscape",
    "title",
    "children",
    "footer",
    "class",
    "zIndex",
  ]);

  let drawerRef: HTMLDivElement | undefined;

  // Handle escape key
  createEffect(() => {
    if (!local.open || !local.closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        local.onClose?.();
      }
    };

    document.addEventListener("keydown", handleEscape);
    
    onCleanup(() => {
      document.removeEventListener("keydown", handleEscape);
    });
  });

  // Prevent body scroll when drawer is open
  createEffect(() => {
    if (local.open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  });

  // Focus management
  createEffect(() => {
    if (local.open && drawerRef) {
      const focusableElements = drawerRef.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      const firstElement = focusableElements[0] as HTMLElement;
      firstElement?.focus();
    }
  });

  const handleBackdropClick = (e: MouseEvent) => {
    if (local.closeOnBackdrop && e.target === e.currentTarget) {
      local.onClose?.();
    }
  };



  const getDrawerClasses = () => {
    const classes = [
      "reynard-drawer__content",
      `reynard-drawer__content--${local.position}`,
      `reynard-drawer__content--${local.size}`,
    ];

      // Add custom size class if customSize is provided
    if (local.customSize) {
      classes.push("reynard-drawer__content--custom");
    }

    // Add transform class based on open state and position
    if (!local.open) {
      classes.push(`reynard-drawer__content--closed-${local.position}`);
    } else {
      classes.push("reynard-drawer__content--open");
    }

    if (local.class) classes.push(local.class);

    return classes.join(" ");
  };

  const getDrawerContainerClasses = () => {
    const classes = ["reynard-drawer"];
    
    // Add z-index class based on the zIndex prop
    if (local.zIndex) {
      if (local.zIndex <= 1000) classes.push("reynard-drawer--z-1000");
      else if (local.zIndex <= 2000) classes.push("reynard-drawer--z-2000");
      else if (local.zIndex <= 3000) classes.push("reynard-drawer--z-3000");
      else if (local.zIndex <= 4000) classes.push("reynard-drawer--z-4000");
      else classes.push("reynard-drawer--z-5000");
    }

    return classes.join(" ");
  };

  // Set custom size CSS properties if needed
  createEffect(() => {
    if (local.open && local.customSize && drawerRef) {
      if (local.position === "left" || local.position === "right") {
        drawerRef.style.setProperty("--drawer-custom-width", local.customSize);
        drawerRef.style.setProperty("--drawer-custom-height", "100%");
      } else {
        drawerRef.style.setProperty("--drawer-custom-width", "100%");
        drawerRef.style.setProperty("--drawer-custom-height", local.customSize);
      }
    }
  });

  return (
    <Show when={local.open}>
      <Portal>
        <div class={getDrawerContainerClasses()}>
          <div class="reynard-drawer__backdrop" onClick={handleBackdropClick} />

          <div
            ref={drawerRef}
            class={getDrawerClasses()}
            role="dialog"
            aria-modal="true"
            aria-labelledby={local.title ? "drawer-title" : undefined}
          >
            {/* Header */}
            <Show when={local.title || local.showCloseButton}>
              <div class="reynard-drawer__header">
                <Show when={local.title}>
                  <h2 id="drawer-title" class="reynard-drawer__title">
                    {local.title}
                  </h2>
                </Show>

                <Show when={local.showCloseButton}>
                  <button
                    type="button"
                    class="reynard-drawer__close"
                    onClick={() => local.onClose?.()}
                    aria-label="Close drawer"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                    >
                      <path d="M8 6.585l3.593-3.592a1 1 0 011.414 1.414L9.415 8l3.592 3.593a1 1 0 01-1.414 1.414L8 9.415l-3.593 3.592a1 1 0 01-1.414-1.414L6.585 8 2.993 4.407a1 1 0 011.414-1.414L8 6.585z" />
                    </svg>
                  </button>
                </Show>
              </div>
            </Show>

            {/* Body */}
            <div class="reynard-drawer__body">{local.children}</div>

            {/* Footer */}
            <Show when={local.footer}>
              <div class="reynard-drawer__footer">{local.footer}</div>
            </Show>
          </div>
        </div>
      </Portal>
    </Show>
  );
};
