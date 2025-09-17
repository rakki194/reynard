/**
 * DOM utilities for testing with happy-dom
 * Provides safe access to DOM elements that might fail in happy-dom
 */
type SafeCSSStyleDeclaration = {
    display: string;
    visibility: string;
    opacity: string;
    position: string;
    top: string;
    left: string;
    width: string;
    height: string;
    [key: string]: string;
};
/**
 * Safely get document.body, creating it if necessary
 */
export declare function getDocumentBody(): HTMLElement;
/**
 * Safely append a child to document.body
 */
export declare function appendToBody(element: HTMLElement): void;
/**
 * Safely remove a child from document.body
 */
export declare function removeFromBody(element: HTMLElement): void;
/**
 * Create a test container element
 */
export declare function createTestContainer(): HTMLElement;
/**
 * Safely get computed styles for an element
 * Enhanced with better happy-dom compatibility
 */
export declare function getComputedStyles(element: Element): SafeCSSStyleDeclaration;
/**
 * Safely check if an element is in the document
 * Enhanced with better happy-dom compatibility
 */
export declare function isElementInDocument(element: Element): boolean;
/**
 * Safely get the active element
 */
export declare function getActiveElement(): Element | null;
/**
 * Safely set focus on an element
 */
export declare function setFocus(element: Element): void;
export {};
