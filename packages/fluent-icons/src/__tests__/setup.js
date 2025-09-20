/**
 * Test setup for Fluent Icons package
 */
import { beforeAll } from "vitest";
// Mock DOM environment for tests
beforeAll(() => {
    // Create a mock document.createElement for SVG elements
    if (typeof document === "undefined") {
        global.document = {
            createElement: (tagName) => {
                if (tagName === "span") {
                    return {
                        innerHTML: "",
                        children: [],
                    };
                }
                return {};
            },
        };
    }
});
