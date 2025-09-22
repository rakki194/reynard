/**
 * 🦊 Animation Control System Tests
 * 
 * Tests for the global animation control system including:
 * - Animation disable functionality
 * - Accessibility preferences
 * - Performance modes
 * - Package availability detection
 * 
 * @author Agile-Prime-90 (Reynard Lizard Specialist)
 * @since 1.0.0
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render } from "@solidjs/testing-library";
import { createSignal } from "solid-js";

// Mock the media query hook
vi.mock("../useMediaQuery", () => ({
  usePrefersReducedMotion: () => createSignal(false),
}));

// Mock the animation package import
vi.mock("reynard-animation", () => ({}), { virtual: true });

describe("useAnimationControl", () => {
  beforeEach(() => {
    // Reset DOM classes
    document.documentElement.className = "";
  });

  it("should initialize with default configuration", () => {
    const { useAnimationControl } = require("../useAnimationControl");
    
    render(() => {
      const control = useAnimationControl();
      
      expect(control.config().enabled).toBe(true);
      expect(control.config().respectReducedMotion).toBe(true);
      expect(control.config().fallbackToCSS).toBe(true);
      expect(control.config().performanceMode).toBe(false);
    });
  });

  it("should disable animations when globally disabled", () => {
    const { useAnimationControl } = require("../useAnimationControl");
    
    render(() => {
      const control = useAnimationControl();
      
      control.disableAllAnimations();
      
      expect(control.isAnimationsDisabled()).toBe(true);
      expect(document.documentElement.classList.contains("animations-disabled")).toBe(true);
    });
  });

  it("should enable animations when globally enabled", () => {
    const { useAnimationControl } = require("../useAnimationControl");
    
    render(() => {
      const control = useAnimationControl();
      
      control.disableAllAnimations();
      control.enableAllAnimations();
      
      expect(control.isAnimationsDisabled()).toBe(false);
      expect(document.documentElement.classList.contains("animations-disabled")).toBe(false);
    });
  });

  it("should toggle animations correctly", () => {
    const { useAnimationControl } = require("../useAnimationControl");
    
    render(() => {
      const control = useAnimationControl();
      
      expect(control.isAnimationsDisabled()).toBe(false);
      
      control.toggleAnimations();
      expect(control.isAnimationsDisabled()).toBe(true);
      
      control.toggleAnimations();
      expect(control.isAnimationsDisabled()).toBe(false);
    });
  });

  it("should enable performance mode", () => {
    const { useAnimationControl } = require("../useAnimationControl");
    
    render(() => {
      const control = useAnimationControl();
      
      control.enablePerformanceMode();
      
      expect(control.isPerformanceMode()).toBe(true);
      expect(document.documentElement.classList.contains("performance-mode")).toBe(true);
    });
  });

  it("should disable performance mode", () => {
    const { useAnimationControl } = require("../useAnimationControl");
    
    render(() => {
      const control = useAnimationControl();
      
      control.enablePerformanceMode();
      control.disablePerformanceMode();
      
      expect(control.isPerformanceMode()).toBe(false);
      expect(document.documentElement.classList.contains("performance-mode")).toBe(false);
    });
  });

  it("should toggle performance mode correctly", () => {
    const { useAnimationControl } = require("../useAnimationControl");
    
    render(() => {
      const control = useAnimationControl();
      
      expect(control.isPerformanceMode()).toBe(false);
      
      control.togglePerformanceMode();
      expect(control.isPerformanceMode()).toBe(true);
      
      control.togglePerformanceMode();
      expect(control.isPerformanceMode()).toBe(false);
    });
  });

  it("should enable accessibility mode", () => {
    const { useAnimationControl } = require("../useAnimationControl");
    
    render(() => {
      const control = useAnimationControl();
      
      control.enableAccessibilityMode();
      
      expect(control.isAccessibilityMode()).toBe(false); // No reduced motion preference
      expect(document.documentElement.classList.contains("accessibility-mode")).toBe(false);
    });
  });

  it("should disable accessibility mode", () => {
    const { useAnimationControl } = require("../useAnimationControl");
    
    render(() => {
      const control = useAnimationControl();
      
      control.enableAccessibilityMode();
      control.disableAccessibilityMode();
      
      expect(control.isAccessibilityMode()).toBe(false);
      expect(document.documentElement.classList.contains("accessibility-mode")).toBe(false);
    });
  });

  it("should toggle accessibility mode correctly", () => {
    const { useAnimationControl } = require("../useAnimationControl");
    
    render(() => {
      const control = useAnimationControl();
      
      expect(control.isAccessibilityMode()).toBe(false);
      
      control.toggleAccessibilityMode();
      expect(control.isAccessibilityMode()).toBe(false); // No reduced motion preference
      
      control.toggleAccessibilityMode();
      expect(control.isAccessibilityMode()).toBe(false);
    });
  });

  it("should update configuration correctly", () => {
    const { useAnimationControl } = require("../useAnimationControl");
    
    render(() => {
      const control = useAnimationControl();
      
      control.updateConfig({
        enabled: false,
        performanceMode: true,
      });
      
      expect(control.config().enabled).toBe(false);
      expect(control.config().performanceMode).toBe(true);
      expect(control.isAnimationsDisabled()).toBe(true);
    });
  });

  it("should clean up CSS classes on unmount", () => {
    const { useAnimationControl } = require("../useAnimationControl");
    
    const { unmount } = render(() => {
      const control = useAnimationControl();
      
      control.enablePerformanceMode();
      control.disableAllAnimations();
      
      expect(document.documentElement.classList.contains("performance-mode")).toBe(true);
      expect(document.documentElement.classList.contains("animations-disabled")).toBe(true);
    });

    unmount();
    
    expect(document.documentElement.classList.contains("performance-mode")).toBe(false);
    expect(document.documentElement.classList.contains("animations-disabled")).toBe(false);
  });
});

describe("useIsAnimationsDisabled", () => {
  it("should return animation disabled state", () => {
    const { useIsAnimationsDisabled } = require("../useAnimationControl");
    
    render(() => {
      const isDisabled = useIsAnimationsDisabled();
      
      expect(typeof isDisabled()).toBe("boolean");
    });
  });
});

describe("useIsAnimationPackageAvailable", () => {
  it("should return package availability state", () => {
    const { useIsAnimationPackageAvailable } = require("../useAnimationControl");
    
    render(() => {
      const isAvailable = useIsAnimationPackageAvailable();
      
      expect(typeof isAvailable()).toBe("boolean");
    });
  });
});

describe("useIsPerformanceMode", () => {
  it("should return performance mode state", () => {
    const { useIsPerformanceMode } = require("../useAnimationControl");
    
    render(() => {
      const isPerformanceMode = useIsPerformanceMode();
      
      expect(typeof isPerformanceMode()).toBe("boolean");
    });
  });
});

describe("useIsAccessibilityMode", () => {
  it("should return accessibility mode state", () => {
    const { useIsAccessibilityMode } = require("../useAnimationControl");
    
    render(() => {
      const isAccessibilityMode = useIsAccessibilityMode();
      
      expect(typeof isAccessibilityMode()).toBe("boolean");
    });
  });
});
