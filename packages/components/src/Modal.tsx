/**
 * Modal Component
 * A flexible modal dialog component with backdrop and animations
 */

import {
  Component,
  JSX,
  splitProps,
  mergeProps,
  createEffect,
  Show,
} from "solid-js";
import { Portal } from "solid-js/web";

export interface ModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Function to call when modal should close */
  onClose?: () => void;
  /** Modal size */
  size?: "sm" | "md" | "lg" | "xl" | "full";
  /** Whether to show close button */
  showCloseButton?: boolean;
  /** Whether clicking backdrop closes modal */
  closeOnBackdrop?: boolean;
  /** Whether pressing escape closes modal */
  closeOnEscape?: boolean;
  /** Modal title */
  title?: JSX.Element;
  /** Modal content */
  children?: JSX.Element;
  /** Custom class name */
  class?: string;
}

const defaultProps: Partial<ModalProps> = {
  size: "md",
  showCloseButton: true,
  closeOnBackdrop: true,
  closeOnEscape: true,
};

export const Modal: Component<ModalProps> = (props) => {
  const merged = mergeProps(defaultProps, props);
  const [local] = splitProps(merged, [
    "open",
    "onClose",
    "size",
    "showCloseButton",
    "closeOnBackdrop",
    "closeOnEscape",
    "title",
    "children",
    "class",
  ]);

  // Handle escape key
  createEffect(() => {
    if (!local.open || !local.closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        local.onClose?.();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  });

  // Prevent body scroll when modal is open
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

  const handleBackdropClick = (e: MouseEvent) => {
    if (local.closeOnBackdrop && e.target === e.currentTarget) {
      local.onClose?.();
    }
  };

  const getModalClasses = () => {
    const classes = [
      "reynard-modal__content",
      `reynard-modal__content--${local.size}`,
    ];

    if (local.class) classes.push(local.class);

    return classes.join(" ");
  };

  return (
    <Show when={local.open}>
      <Portal>
        <div class="reynard-modal">
          <div class="reynard-modal__backdrop" onClick={handleBackdropClick}>
            <div class={getModalClasses()}>
              {(local.title || local.showCloseButton) && (
                <div class="reynard-modal__header">
                  {local.title && (
                    <h2 class="reynard-modal__title">{local.title}</h2>
                  )}

                  {local.showCloseButton && (
                    <button
                      type="button"
                      class="reynard-modal__close"
                      onClick={() => local.onClose?.()}
                      aria-label="Close modal"
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
                  )}
                </div>
              )}

              <div class="reynard-modal__body">{local.children}</div>
            </div>
          </div>
        </div>
      </Portal>
    </Show>
  );
};
