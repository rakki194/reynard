/**
 * DOM utilities for testing with happy-dom
 * Provides safe access to DOM elements that might fail in happy-dom
 */
/**
 * Safely get document.body, creating it if necessary
 */
export function getDocumentBody() {
    try {
        if (document.body) {
            return document.body;
        }
    }
    catch (error) {
        // happy-dom sometimes fails to access document.body
        console.warn("Could not access document.body:", error);
    }
    // Create a body element if it doesn't exist or can't be accessed
    const body = document.createElement("body");
    try {
        document.documentElement.appendChild(body);
    }
    catch (error) {
        console.warn("Could not append body to documentElement:", error);
    }
    return body;
}
/**
 * Safely append a child to document.body
 */
export function appendToBody(element) {
    const body = getDocumentBody();
    try {
        body.appendChild(element);
    }
    catch (error) {
        console.warn("Could not append element to body:", error);
        // Fallback: append to documentElement
        document.documentElement.appendChild(element);
    }
}
/**
 * Safely remove a child from document.body
 */
export function removeFromBody(element) {
    try {
        if (element.parentNode) {
            element.parentNode.removeChild(element);
        }
    }
    catch (error) {
        console.warn("Could not remove element from body:", error);
    }
}
/**
 * Create a test container element
 */
export function createTestContainer() {
    const container = document.createElement("div");
    container.setAttribute("data-testid", "test-container");
    return container;
}
/**
 * Safely get computed styles for an element
 * Enhanced with better happy-dom compatibility
 */
export function getComputedStyles(element) {
    try {
        const styles = window.getComputedStyle(element);
        // Check if happy-dom returned a valid style object
        if (styles && typeof styles.display !== 'undefined') {
            return styles;
        }
    }
    catch (error) {
        console.warn("Could not get computed styles:", error);
    }
    // Enhanced fallback that better handles happy-dom limitations
    const mockStyle = {
        display: "block",
        visibility: "visible",
        opacity: "1",
        position: "static",
        top: "auto",
        left: "auto",
        width: "auto",
        height: "auto",
    };
    // Check for inline styles and use them if available
    if (element instanceof HTMLElement) {
        const inlineStyle = element.style;
        if (inlineStyle.display)
            mockStyle.display = inlineStyle.display;
        if (inlineStyle.visibility)
            mockStyle.visibility = inlineStyle.visibility;
        if (inlineStyle.opacity)
            mockStyle.opacity = inlineStyle.opacity;
        if (inlineStyle.position)
            mockStyle.position = inlineStyle.position;
    }
    // Check for common CSS classes that might indicate hidden state
    if (element.classList.contains('hidden') || element.classList.contains('sr-only')) {
        mockStyle.display = 'none';
    }
    return mockStyle;
}
/**
 * Safely check if an element is in the document
 * Enhanced with better happy-dom compatibility
 */
export function isElementInDocument(element) {
    try {
        // Try the standard approach first
        if (document.contains && typeof document.contains === 'function') {
            return document.contains(element);
        }
    }
    catch (error) {
        console.warn("Could not check if element is in document:", error);
    }
    // Enhanced fallback: check multiple indicators
    try {
        // Check if element has a parent and is connected to the document
        if (element.parentNode === null) {
            return false;
        }
        // Check if element is connected to the document root
        let current = element;
        while (current.parentNode) {
            current = current.parentNode;
            if (current === document || current === document.documentElement) {
                return true;
            }
        }
        // Fallback: check if element is in a container that's in the document
        return element.parentNode !== null;
    }
    catch (error) {
        console.warn("Fallback document check failed:", error);
        return false;
    }
}
/**
 * Safely get the active element
 */
export function getActiveElement() {
    try {
        return document.activeElement;
    }
    catch (error) {
        console.warn("Could not get active element:", error);
        return null;
    }
}
/**
 * Safely set focus on an element
 */
export function setFocus(element) {
    try {
        if (element instanceof HTMLElement && typeof element.focus === 'function') {
            element.focus();
        }
    }
    catch (error) {
        console.warn("Could not set focus on element:", error);
    }
}
