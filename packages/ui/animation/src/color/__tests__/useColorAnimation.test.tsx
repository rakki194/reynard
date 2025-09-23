/**
 * 🦊 Color Animation Composable Tests
 * 
 * Test suite for the useColorAnimation SolidJS composable.
 * Tests reactive color animations and smart import integration.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import type { OKLCHColor } from "reynard-colors";
import { useColorAnimation, useHueShiftAnimation } from "../useColorAnimation.js";

// Mock OKLCHColor for testing
const mockBaseColor: OKLCHColor = { l: 0.5, c: 0.1, h: 0 };
const mockTargetColor: OKLCHColor = { l: 0.7, c: 0.2, h: 120 };

// Mock requestAnimationFrame
const mockRAF = vi.fn((callback: FrameRequestCallback) => {
  setTimeout(callback, 16);
  return 1;
});

const mockCAF = vi.fn((id: number) => {
  // Mock cancelAnimationFrame
});

beforeEach(() => {
  global.requestAnimationFrame = mockRAF;
  global.cancelAnimationFrame = mockCAF;
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useColorAnimation", () => {
  it("should initialize with base color", () => {
    const TestComponent = () => {
      const { currentColor } = useColorAnimation({ baseColor: mockBaseColor });
      return <div data-testid="color" style={{ backgroundColor: `oklch(${currentColor().l} ${currentColor().c} ${currentColor().h})` }} />;
    };

    render(() => <TestComponent />);
    const colorElement = screen.getByTestId("color");
    expect(colorElement.style.backgroundColor).toBe("oklch(0.5 0.1 0)");
  });

  it("should provide animation state", () => {
    const TestComponent = () => {
      const { isAnimating, animationEngine, isAnimationsDisabled } = useColorAnimation();
      return (
        <div>
          <div data-testid="animating">{isAnimating().toString()}</div>
          <div data-testid="engine">{animationEngine()}</div>
          <div data-testid="disabled">{isAnimationsDisabled().toString()}</div>
        </div>
      );
    };

    render(() => <TestComponent />);
    expect(screen.getByTestId("animating").textContent).toBe("false");
    expect(screen.getByTestId("engine")).toBeInTheDocument();
    expect(screen.getByTestId("disabled")).toBeInTheDocument();
  });

  it("should animate to target color", async () => {
    const TestComponent = () => {
      const { currentColor, animateToColor, isAnimating } = useColorAnimation({
        baseColor: mockBaseColor,
        duration: 50, // Short duration for testing
      });

      const handleAnimate = () => {
        animateToColor(mockTargetColor);
      };

      return (
        <div>
          <div data-testid="color" style={{ backgroundColor: `oklch(${currentColor().l} ${currentColor().c} ${currentColor().h})` }} />
          <div data-testid="animating">{isAnimating().toString()}</div>
          <button data-testid="animate" onClick={handleAnimate}>Animate</button>
        </div>
      );
    };

    render(() => <TestComponent />);
    
    const animateButton = screen.getByTestId("animate");
    const animatingElement = screen.getByTestId("animating");
    
    fireEvent.click(animateButton);
    
    expect(animatingElement.textContent).toBe("true");
    
    // Wait for animation to complete
    await waitFor(() => {
      expect(animatingElement.textContent).toBe("false");
    }, { timeout: 100 });
  });

  it("should animate hue shift", async () => {
    const TestComponent = () => {
      const { currentColor, animateHueShift, isAnimating } = useColorAnimation({
        baseColor: mockBaseColor,
        duration: 50,
      });

      const handleShift = () => {
        animateHueShift(60);
      };

      return (
        <div>
          <div data-testid="color" style={{ backgroundColor: `oklch(${currentColor().l} ${currentColor().c} ${currentColor().h})` }} />
          <div data-testid="animating">{isAnimating().toString()}</div>
          <button data-testid="shift" onClick={handleShift}>Shift Hue</button>
        </div>
      );
    };

    render(() => <TestComponent />);
    
    const shiftButton = screen.getByTestId("shift");
    const animatingElement = screen.getByTestId("animating");
    
    fireEvent.click(shiftButton);
    
    expect(animatingElement.textContent).toBe("true");
    
    await waitFor(() => {
      expect(animatingElement.textContent).toBe("false");
    }, { timeout: 100 });
  });

  it("should generate color ramp", () => {
    const TestComponent = () => {
      const { generateColorRamp } = useColorAnimation({ baseColor: mockBaseColor });
      const ramp = generateColorRamp(mockTargetColor, 3);
      
      return (
        <div>
          {ramp.map((color, index) => (
            <div key={index} data-testid={`ramp-${index}`} style={{ backgroundColor: `oklch(${color.l} ${color.c} ${color.h})` }} />
          ))}
        </div>
      );
    };

    render(() => <TestComponent />);
    
    expect(screen.getByTestId("ramp-0")).toBeInTheDocument();
    expect(screen.getByTestId("ramp-1")).toBeInTheDocument();
    expect(screen.getByTestId("ramp-2")).toBeInTheDocument();
  });

  it("should generate hue ramp", () => {
    const TestComponent = () => {
      const { generateHueRamp } = useColorAnimation({ baseColor: mockBaseColor });
      const ramp = generateHueRamp(120, 3);
      
      return (
        <div>
          {ramp.map((color, index) => (
            <div key={index} data-testid={`hue-ramp-${index}`} style={{ backgroundColor: `oklch(${color.l} ${color.c} ${color.h})` }} />
          ))}
        </div>
      );
    };

    render(() => <TestComponent />);
    
    expect(screen.getByTestId("hue-ramp-0")).toBeInTheDocument();
    expect(screen.getByTestId("hue-ramp-1")).toBeInTheDocument();
    expect(screen.getByTestId("hue-ramp-2")).toBeInTheDocument();
  });

  it("should stop animation", async () => {
    const TestComponent = () => {
      const { currentColor, animateToColor, stopAnimation, isAnimating } = useColorAnimation({
        baseColor: mockBaseColor,
        duration: 1000, // Long duration
      });

      const handleAnimate = () => {
        animateToColor(mockTargetColor);
      };

      const handleStop = () => {
        stopAnimation();
      };

      return (
        <div>
          <div data-testid="color" style={{ backgroundColor: `oklch(${currentColor().l} ${currentColor().c} ${currentColor().h})` }} />
          <div data-testid="animating">{isAnimating().toString()}</div>
          <button data-testid="animate" onClick={handleAnimate}>Animate</button>
          <button data-testid="stop" onClick={handleStop}>Stop</button>
        </div>
      );
    };

    render(() => <TestComponent />);
    
    const animateButton = screen.getByTestId("animate");
    const stopButton = screen.getByTestId("stop");
    const animatingElement = screen.getByTestId("animating");
    
    fireEvent.click(animateButton);
    expect(animatingElement.textContent).toBe("true");
    
    fireEvent.click(stopButton);
    expect(animatingElement.textContent).toBe("false");
  });

  it("should reset to base color", () => {
    const TestComponent = () => {
      const { currentColor, resetToBase } = useColorAnimation({ baseColor: mockBaseColor });
      
      return (
        <div>
          <div data-testid="color" style={{ backgroundColor: `oklch(${currentColor().l} ${currentColor().c} ${currentColor().h})` }} />
          <button data-testid="reset" onClick={resetToBase}>Reset</button>
        </div>
      );
    };

    render(() => <TestComponent />);
    
    const resetButton = screen.getByTestId("reset");
    const colorElement = screen.getByTestId("color");
    
    fireEvent.click(resetButton);
    
    expect(colorElement.style.backgroundColor).toBe("oklch(0.5 0.1 0)");
  });

  it("should handle multiple rapid animations", async () => {
    const TestComponent = () => {
      const { currentColor, animateToColor, isAnimating } = useColorAnimation({
        baseColor: mockBaseColor,
        duration: 100,
      });

      const handleAnimate1 = () => {
        animateToColor(mockTargetColor);
      };

      const handleAnimate2 = () => {
        animateToColor({ l: 0.3, c: 0.05, h: 240 });
      };

      return (
        <div>
          <div data-testid="color" style={{ backgroundColor: `oklch(${currentColor().l} ${currentColor().c} ${currentColor().h})` }} />
          <div data-testid="animating">{isAnimating().toString()}</div>
          <button data-testid="animate1" onClick={handleAnimate1}>Animate 1</button>
          <button data-testid="animate2" onClick={handleAnimate2}>Animate 2</button>
        </div>
      );
    };

    render(() => <TestComponent />);
    
    const animate1Button = screen.getByTestId("animate1");
    const animate2Button = screen.getByTestId("animate2");
    const animatingElement = screen.getByTestId("animating");
    
    // Start first animation
    fireEvent.click(animate1Button);
    expect(animatingElement.textContent).toBe("true");
    
    // Start second animation (should ignore)
    fireEvent.click(animate2Button);
    expect(animatingElement.textContent).toBe("true");
    
    await waitFor(() => {
      expect(animatingElement.textContent).toBe("false");
    }, { timeout: 200 });
  });
});

describe("useHueShiftAnimation", () => {
  it("should provide hue shift functionality", () => {
    const TestComponent = () => {
      const { currentColor, shiftHue } = useHueShiftAnimation(mockBaseColor, {
        duration: 50,
      });

      const handleShift = () => {
        shiftHue(60);
      };

      return (
        <div>
          <div data-testid="color" style={{ backgroundColor: `oklch(${currentColor().l} ${currentColor().c} ${currentColor().h})` }} />
          <button data-testid="shift" onClick={handleShift}>Shift Hue</button>
        </div>
      );
    };

    render(() => <TestComponent />);
    
    const shiftButton = screen.getByTestId("shift");
    fireEvent.click(shiftButton);
    
    // Should trigger animation
    expect(mockRAF).toHaveBeenCalled();
  });
});

describe("Accessibility Integration", () => {
  it("should respect prefers-reduced-motion", () => {
    vi.spyOn(window, "matchMedia").mockReturnValue({
      matches: true,
      media: "(prefers-reduced-motion: reduce)",
    } as MediaQueryList);

    const TestComponent = () => {
      const { isAnimationsDisabled } = useColorAnimation();
      return <div data-testid="disabled">{isAnimationsDisabled().toString()}</div>;
    };

    render(() => <TestComponent />);
    expect(screen.getByTestId("disabled").textContent).toBe("true");
  });

  it("should respect performance mode", () => {
    document.documentElement.classList.add("performance-mode");

    const TestComponent = () => {
      const { isAnimationsDisabled } = useColorAnimation();
      return <div data-testid="disabled">{isAnimationsDisabled().toString()}</div>;
    };

    render(() => <TestComponent />);
    expect(screen.getByTestId("disabled").textContent).toBe("true");
    
    document.documentElement.classList.remove("performance-mode");
  });
});

describe("Performance Optimizations", () => {
  it("should use immediate completion when disabled", async () => {
    document.documentElement.classList.add("animations-disabled");

    const TestComponent = () => {
      const { currentColor, animateToColor, isAnimating } = useColorAnimation({
        baseColor: mockBaseColor,
        respectGlobalControl: true,
      });

      const handleAnimate = () => {
        animateToColor(mockTargetColor);
      };

      return (
        <div>
          <div data-testid="color" style={{ backgroundColor: `oklch(${currentColor().l} ${currentColor().c} ${currentColor().h})` }} />
          <div data-testid="animating">{isAnimating().toString()}</div>
          <button data-testid="animate" onClick={handleAnimate}>Animate</button>
        </div>
      );
    };

    render(() => <TestComponent />);
    
    const animateButton = screen.getByTestId("animate");
    const animatingElement = screen.getByTestId("animating");
    
    fireEvent.click(animateButton);
    
    // Should complete immediately
    expect(animatingElement.textContent).toBe("false");
    
    document.documentElement.classList.remove("animations-disabled");
  });
});


