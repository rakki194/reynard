/**
 * 🦊 Accessibility Compliance Monitor
 * 
 * Monitors accessibility preferences and provides compliance scoring.
 * 
 * @author Agile-Prime-90 (Reynard Lizard Specialist)
 * @since 1.0.0
 */

import { onCleanup } from "solid-js";

export interface AccessibilityCompliance {
  respectsReducedMotion: boolean;
  respectsHighContrast: boolean;
  respectsReducedData: boolean;
  complianceScore: number;
}

export interface AccessibilityComplianceCallback {
  (compliance: AccessibilityCompliance): void;
}

/**
 * Accessibility compliance monitor
 */
export class AccessibilityComplianceMonitor {
  private mediaQueryListeners: Array<{ mediaQuery: MediaQueryList; listener: () => void }> = [];
  private complianceCallback: AccessibilityComplianceCallback | null = null;
  private currentCompliance: AccessibilityCompliance = {
    respectsReducedMotion: false,
    respectsHighContrast: false,
    respectsReducedData: false,
    complianceScore: 0,
  };

  constructor(callback?: AccessibilityComplianceCallback) {
    this.complianceCallback = callback || null;
    this.setupMonitoring();
  }

  /**
   * Set up accessibility compliance monitoring
   */
  private setupMonitoring(): void {
    // Monitor prefers-reduced-motion
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const reducedMotionListener = () => {
      this.updateCompliance();
    };
    reducedMotionQuery.addEventListener("change", reducedMotionListener);
    this.mediaQueryListeners.push({ mediaQuery: reducedMotionQuery, listener: reducedMotionListener });

    // Monitor prefers-contrast
    const highContrastQuery = window.matchMedia("(prefers-contrast: high)");
    const highContrastListener = () => {
      this.updateCompliance();
    };
    highContrastQuery.addEventListener("change", highContrastListener);
    this.mediaQueryListeners.push({ mediaQuery: highContrastQuery, listener: highContrastListener });

    // Monitor prefers-reduced-data
    const reducedDataQuery = window.matchMedia("(prefers-reduced-data: reduce)");
    const reducedDataListener = () => {
      this.updateCompliance();
    };
    reducedDataQuery.addEventListener("change", reducedDataListener);
    this.mediaQueryListeners.push({ mediaQuery: reducedDataQuery, listener: reducedDataListener });

    // Initial compliance check
    this.updateCompliance();
  }

  /**
   * Update accessibility compliance
   */
  private updateCompliance(): void {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const highContrast = window.matchMedia("(prefers-contrast: high)").matches;
    const reducedData = window.matchMedia("(prefers-reduced-data: reduce)").matches;

    this.currentCompliance = {
      respectsReducedMotion: reducedMotion,
      respectsHighContrast: highContrast,
      respectsReducedData: reducedData,
      complianceScore: this.calculateComplianceScore(reducedMotion, highContrast, reducedData),
    };

    if (this.complianceCallback) {
      this.complianceCallback(this.currentCompliance);
    }
  }

  /**
   * Calculate compliance score (0-100)
   */
  private calculateComplianceScore(reducedMotion: boolean, highContrast: boolean, reducedData: boolean): number {
    let score = 0;
    if (reducedMotion) score += 40;
    if (highContrast) score += 30;
    if (reducedData) score += 30;
    return score;
  }

  /**
   * Get current compliance status
   */
  getCompliance(): AccessibilityCompliance {
    return { ...this.currentCompliance };
  }

  /**
   * Set compliance callback
   */
  setCallback(callback: AccessibilityComplianceCallback): void {
    this.complianceCallback = callback;
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.mediaQueryListeners.forEach(({ mediaQuery, listener }) => {
      mediaQuery.removeEventListener("change", listener);
    });
    this.mediaQueryListeners = [];
  }
}

