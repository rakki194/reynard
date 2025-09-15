/**
 * 🦦 LAYOUT MONITORING UTILITIES
 *
 * *splashes with layout analysis excitement* Comprehensive utilities for
 * monitoring layout shifts, refreshes, and visual stability during tests.
 */

import { Page, expect } from "@playwright/test";

export interface LayoutShiftEvent {
  timestamp: number;
  value: number;
  hadRecentInput: boolean;
  sources: LayoutShiftSource[];
}

export interface LayoutShiftSource {
  node: string;
  previousRect: DOMRect;
  currentRect: DOMRect;
}

export interface LayoutMetrics {
  cumulativeLayoutShift: number;
  layoutShiftEvents: LayoutShiftEvent[];
  largestContentfulPaint: number;
  firstInputDelay: number;
  firstContentfulPaint: number;
  timeToInteractive: number;
  totalBlockingTime: number;
}

export interface VisualStabilityMetrics {
  layoutShifts: number;
  unexpectedLayoutChanges: number;
  stableElements: number;
  unstableElements: number;
  averageShiftDistance: number;
}

export class LayoutMonitor {
  private page: Page;
  private layoutShiftObserver: any;
  private performanceObserver: any;
  private metrics: LayoutMetrics;
  private visualStability: VisualStabilityMetrics;

  constructor(page: Page) {
    this.page = page;
    this.metrics = {
      cumulativeLayoutShift: 0,
      layoutShiftEvents: [],
      largestContentfulPaint: 0,
      firstInputDelay: 0,
      firstContentfulPaint: 0,
      timeToInteractive: 0,
      totalBlockingTime: 0,
    };
    this.visualStability = {
      layoutShifts: 0,
      unexpectedLayoutChanges: 0,
      stableElements: 0,
      unstableElements: 0,
      averageShiftDistance: 0,
    };
  }

  /**
   * Initialize layout monitoring with comprehensive observers
   */
  async initialize(): Promise<void> {
    console.log("🦦 Initializing layout monitoring...");

    await this.page.addInitScript(() => {
      // Layout Shift Observer
      if (typeof PerformanceObserver !== "undefined") {
        const layoutShiftObserver = new PerformanceObserver(list => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === "layout-shift") {
              const layoutShiftEntry = entry as any;
              window.layoutShiftEvents = window.layoutShiftEvents || [];
              window.layoutShiftEvents.push({
                timestamp: layoutShiftEntry.startTime,
                value: layoutShiftEntry.value,
                hadRecentInput: layoutShiftEntry.hadRecentInput,
                sources: layoutShiftEntry.sources || [],
              });
            }
          }
        });

        layoutShiftObserver.observe({ entryTypes: ["layout-shift"] });

        // Performance Observer for Core Web Vitals
        const performanceObserver = new PerformanceObserver(list => {
          for (const entry of list.getEntries()) {
            switch (entry.entryType) {
              case "largest-contentful-paint":
                window.lcpValue = entry.startTime;
                break;
              case "first-input":
                window.fidValue = (entry as any).processingStart - entry.startTime;
                break;
              case "paint":
                if (entry.name === "first-contentful-paint") {
                  window.fcpValue = entry.startTime;
                }
                break;
              case "navigation":
                const navEntry = entry as any;
                window.ttfbValue = navEntry.responseStart - navEntry.fetchStart;
                break;
            }
          }
        });

        performanceObserver.observe({
          entryTypes: ["largest-contentful-paint", "first-input", "paint", "navigation"],
        });

        // Long Task Observer for Total Blocking Time
        const longTaskObserver = new PerformanceObserver(list => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === "longtask") {
              window.longTasks = window.longTasks || [];
              window.longTasks.push(entry.duration);
            }
          }
        });

        longTaskObserver.observe({ entryTypes: ["longtask"] });

        // Element Stability Monitor
        window.elementStability = {
          stable: new Set(),
          unstable: new Set(),
          shifts: new Map(),
        };

        // Monitor element positions
        const elementObserver = new MutationObserver(mutations => {
          mutations.forEach(mutation => {
            if (
              mutation.type === "attributes" &&
              (mutation.attributeName === "style" || mutation.attributeName === "class")
            ) {
              const element = mutation.target as Element;
              const rect = element.getBoundingClientRect();
              const elementId = this.getElementId(element);

              if (window.elementStability.shifts.has(elementId)) {
                const previousRect = window.elementStability.shifts.get(elementId);
                const distance = this.calculateDistance(previousRect, rect);

                if (distance > 5) {
                  // Threshold for significant movement
                  window.elementStability.unstable.add(elementId);
                  window.elementStability.stable.delete(elementId);
                }
              }

              window.elementStability.shifts.set(elementId, rect);
            }
          });
        });

        elementObserver.observe(document.body, {
          attributes: true,
          subtree: true,
          attributeFilter: ["style", "class"],
        });
      }
    });

    // Wait for observers to be set up
    await this.page.waitForTimeout(100);
  }

  /**
   * Start monitoring layout changes for a specific test
   */
  async startMonitoring(): Promise<void> {
    console.log("🦦 Starting layout monitoring...");

    // Clear previous metrics
    await this.page.evaluate(() => {
      window.layoutShiftEvents = [];
      window.lcpValue = 0;
      window.fidValue = 0;
      window.fcpValue = 0;
      window.ttfbValue = 0;
      window.longTasks = [];
      window.elementStability = {
        stable: new Set(),
        unstable: new Set(),
        shifts: new Map(),
      };
    });
  }

  /**
   * Stop monitoring and collect metrics
   */
  async stopMonitoring(): Promise<LayoutMetrics> {
    console.log("🦦 Stopping layout monitoring and collecting metrics...");

    const metrics = await this.page.evaluate(() => {
      const layoutShiftEvents = window.layoutShiftEvents || [];
      const cumulativeLayoutShift = layoutShiftEvents
        .filter((event: any) => !event.hadRecentInput)
        .reduce((sum: number, event: any) => sum + event.value, 0);

      const longTasks = window.longTasks || [];
      const totalBlockingTime = longTasks
        .filter((duration: number) => duration > 50)
        .reduce((sum: number, duration: number) => sum + (duration - 50), 0);

      return {
        cumulativeLayoutShift,
        layoutShiftEvents,
        largestContentfulPaint: window.lcpValue || 0,
        firstInputDelay: window.fidValue || 0,
        firstContentfulPaint: window.fcpValue || 0,
        timeToInteractive: 0, // Would need more complex calculation
        totalBlockingTime,
      };
    });

    this.metrics = metrics;
    return metrics;
  }

  /**
   * Capture visual stability metrics
   */
  async captureVisualStability(): Promise<VisualStabilityMetrics> {
    const stability = await this.page.evaluate(() => {
      const elementStability = window.elementStability || {
        stable: new Set(),
        unstable: new Set(),
        shifts: new Map(),
      };

      const layoutShiftEvents = window.layoutShiftEvents || [];
      const totalShifts = layoutShiftEvents.length;
      const unexpectedShifts = layoutShiftEvents.filter((event: any) => !event.hadRecentInput).length;

      // Calculate average shift distance
      let totalDistance = 0;
      let shiftCount = 0;

      layoutShiftEvents.forEach((event: any) => {
        event.sources?.forEach((source: any) => {
          const distance = Math.sqrt(
            Math.pow(source.currentRect.x - source.previousRect.x, 2) +
              Math.pow(source.currentRect.y - source.previousRect.y, 2)
          );
          totalDistance += distance;
          shiftCount++;
        });
      });

      return {
        layoutShifts: totalShifts,
        unexpectedLayoutChanges: unexpectedShifts,
        stableElements: elementStability.stable.size,
        unstableElements: elementStability.unstable.size,
        averageShiftDistance: shiftCount > 0 ? totalDistance / shiftCount : 0,
      };
    });

    this.visualStability = stability;
    return stability;
  }

  /**
   * Assert layout stability thresholds
   */
  async assertLayoutStability(thresholds: {
    maxCLS?: number;
    maxLayoutShifts?: number;
    maxUnstableElements?: number;
  }): Promise<void> {
    const metrics = await this.stopMonitoring();
    const stability = await this.captureVisualStability();

    if (thresholds.maxCLS !== undefined) {
      expect(metrics.cumulativeLayoutShift).toBeLessThanOrEqual(thresholds.maxCLS);
    }

    if (thresholds.maxLayoutShifts !== undefined) {
      expect(stability.layoutShifts).toBeLessThanOrEqual(thresholds.maxLayoutShifts);
    }

    if (thresholds.maxUnstableElements !== undefined) {
      expect(stability.unstableElements).toBeLessThanOrEqual(thresholds.maxUnstableElements);
    }
  }

  /**
   * Generate comprehensive layout report
   */
  async generateLayoutReport(): Promise<string> {
    const metrics = await this.stopMonitoring();
    const stability = await this.captureVisualStability();

    return `
# 🦦 Layout Monitoring Report

## Core Web Vitals
- **Cumulative Layout Shift (CLS)**: ${metrics.cumulativeLayoutShift.toFixed(4)}
- **Largest Contentful Paint (LCP)**: ${metrics.largestContentfulPaint.toFixed(2)}ms
- **First Input Delay (FID)**: ${metrics.firstInputDelay.toFixed(2)}ms
- **First Contentful Paint (FCP)**: ${metrics.firstContentfulPaint.toFixed(2)}ms
- **Total Blocking Time (TBT)**: ${metrics.totalBlockingTime.toFixed(2)}ms

## Layout Stability
- **Total Layout Shifts**: ${stability.layoutShifts}
- **Unexpected Layout Changes**: ${stability.unexpectedLayoutChanges}
- **Stable Elements**: ${stability.stableElements}
- **Unstable Elements**: ${stability.unstableElements}
- **Average Shift Distance**: ${stability.averageShiftDistance.toFixed(2)}px

## Layout Shift Events
${metrics.layoutShiftEvents
  .map(
    (event, index) => `
### Event ${index + 1}
- **Timestamp**: ${event.timestamp.toFixed(2)}ms
- **Value**: ${event.value.toFixed(4)}
- **Had Recent Input**: ${event.hadRecentInput}
- **Sources**: ${event.sources.length}
`
  )
  .join("")}
`;
  }

  /**
   * Helper method to get element ID
   */
  private getElementId(element: Element): string {
    if (element.id) return element.id;
    if (element.getAttribute("data-testid")) return element.getAttribute("data-testid")!;
    return element.tagName + "_" + Array.from(element.parentNode?.children || []).indexOf(element);
  }

  /**
   * Helper method to calculate distance between rectangles
   */
  private calculateDistance(rect1: DOMRect, rect2: DOMRect): number {
    return Math.sqrt(Math.pow(rect2.x - rect1.x, 2) + Math.pow(rect2.y - rect1.y, 2));
  }
}
