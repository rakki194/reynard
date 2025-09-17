/**
 * Modal Component
 * A flexible modal dialog component with backdrop and animations
 */
import { Component } from "solid-js";
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
    children?: any;
    /** Additional CSS classes */
    class?: string;
}
export declare const Modal: Component<ModalProps>;
