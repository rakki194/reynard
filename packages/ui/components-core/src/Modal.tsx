/**
 * Modal Component
 * A flexible modal dialog component with backdrop and animations.
 *
 * The Modal component properly composes the Button primitive for its close button,
 * ensuring consistency with the design system and maintaining the primitives library contract.
 *
 * @example
 * ```tsx
 * <Modal open={isOpen()} onClose={() => setIsOpen(false)} title="Example Modal">
 *   <p>Modal content goes here</p>
 * </Modal>
 * ```
 */
import { splitProps, mergeProps, createEffect, Show, Component, JSX } from "solid-js";
import { Portal } from "solid-js/web";
import { Button } from "reynard-primitives";
import { Icon } from "./icons/Icon";

export interface ModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Callback when modal should close */
  onClose?: () => void;
  /** Modal size variant */
  size?: "sm" | "md" | "lg" | "xl";
  /** Show close button in header */
  showCloseButton?: boolean;
  /** Close modal when backdrop is clicked */
  closeOnBackdrop?: boolean;
  /** Close modal when escape key is pressed */
  closeOnEscape?: boolean;
  /** Modal title */
  title?: string;
  /** Modal content */
  children?: JSX.Element;
  /** Additional CSS classes */
  class?: string;
}

const defaultProps: Partial<ModalProps> = {
  size: "md",
  showCloseButton: true,
  closeOnBackdrop: true,
  closeOnEscape: true,
};

// Hook for handling escape key events
const useEscapeKey = (
  open: () => boolean,
  closeOnEscape: () => boolean | undefined,
  onClose: () => (() => void) | undefined
) => {
  createEffect(() => {
    if (!open() || !closeOnEscape()) return;

    // Only run on client side
    if (typeof document === "undefined") return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()?.();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  });
};

// Hook for preventing body scroll when modal is open
const useBodyScrollLock = (open: () => boolean) => {
  createEffect(() => {
    // Only run on client side
    if (typeof document === "undefined") return;

    if (open()) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  });
};

// Modal header component
const ModalHeader: Component<{ title?: string; showCloseButton?: boolean; onClose?: () => void }> = props => {
  return (
    <Show when={props.title || props.showCloseButton}>
      <div class="reynard-modal__header">
        {props.title && <h2 class="reynard-modal__title">{props.title}</h2>}
        <Show when={props.showCloseButton}>
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            onClick={() => props.onClose?.()}
            aria-label="Close modal"
            class="reynard-modal__close"
          >
            <Icon name="dismiss" size="sm" />
          </Button>
        </Show>
      </div>
    </Show>
  );
};

export const Modal: Component<ModalProps> = props => {
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

  // Use custom hooks for side effects
  useEscapeKey(
    () => local.open,
    () => local.closeOnEscape,
    () => local.onClose
  );
  useBodyScrollLock(() => local.open);

  // Create computed values
  const modalClasses = () => {
    const sizeValue = local.size || "md";
    const classes = ["reynard-modal__content", `reynard-modal__content--${sizeValue}`];
    if (local.class) classes.push(local.class);
    return classes.join(" ");
  };

  const handleBackdropClick = (e: MouseEvent) => {
    if (local.closeOnBackdrop && e.target === e.currentTarget) {
      local.onClose?.();
    }
  };

  return (
    <Show when={local.open}>
      <Portal>
        <div class="reynard-modal">
          <div class="reynard-modal__backdrop" onClick={handleBackdropClick}>
            <div class={modalClasses()}>
              <ModalHeader title={local.title} showCloseButton={local.showCloseButton} onClose={local.onClose} />
              <div class="reynard-modal__body">{local.children}</div>
            </div>
          </div>
        </div>
      </Portal>
    </Show>
  );
};
