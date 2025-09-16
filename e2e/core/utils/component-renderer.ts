/**
 * @fileoverview Component renderer utility for benchmark testing
 *
 * Provides utilities for rendering Reynard components in different approaches
 * for performance benchmarking and comparison.
 *
 * @author Pool-Theorist-35 (Reynard Otter Specialist)
 * @since 1.0.0
 */

import { Page } from "@playwright/test";
import { ComponentCategory } from "../types/benchmark-types";

export class ComponentRenderer {
  private page: Page | null = null;

  constructor(page?: Page) {
    this.page = page || null;
  }

  /**
   * Set the Playwright page instance
   */
  setPage(page: Page): void {
    this.page = page;
  }

  /**
   * Render components using Client-Side Rendering (CSR)
   */
  async renderCSR(category: ComponentCategory, count: number): Promise<void> {
    if (!this.page) throw new Error("Page not set");

    await this.page.evaluate(
      ({ category, count }) => {
        // Clear existing content
        const container = document.querySelector('[data-testid="benchmark-container"]');
        if (container) {
          container.innerHTML = "";
        }

        // Render components client-side
        const components = generateComponents(category, count);
        components.forEach(component => {
          if (container) {
            container.appendChild(component);
          }
        });
      },
      { category, count }
    );
  }

  /**
   * Render components using Server-Side Rendering (SSR)
   */
  async renderSSR(category: ComponentCategory, count: number): Promise<void> {
    if (!this.page) throw new Error("Page not set");

    // Navigate to SSR endpoint
    await this.page.goto(`/benchmark/ssr/${category.name}?count=${count}`);
    await this.page.waitForSelector('[data-testid="benchmark-container"]');
  }

  /**
   * Render components using Lazy Loading
   */
  async renderLazy(category: ComponentCategory, count: number): Promise<void> {
    if (!this.page) throw new Error("Page not set");

    await this.page.evaluate(
      ({ category, count }) => {
        const container = document.querySelector('[data-testid="benchmark-container"]');
        if (!container) return;

        container.innerHTML = "";

        // Create lazy loading components
        for (let i = 0; i < count; i++) {
          const lazyComponent = createLazyComponent(category, i);
          container.appendChild(lazyComponent);
        }

        // Trigger lazy loading
        const observer = new IntersectionObserver(entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const component = entry.target as HTMLElement;
              component.setAttribute("data-loaded", "true");
              observer.unobserve(component);
            }
          });
        });

        container.querySelectorAll("[data-lazy]").forEach(el => {
          observer.observe(el);
        });
      },
      { category, count }
    );
  }

  /**
   * Render components using Virtual Scrolling
   */
  async renderVirtual(category: ComponentCategory, count: number): Promise<void> {
    if (!this.page) throw new Error("Page not set");

    await this.page.evaluate(
      ({ category, count }) => {
        const container = document.querySelector('[data-testid="benchmark-container"]');
        if (!container) return;

        container.innerHTML = "";

        // Create virtual scrolling container
        const virtualContainer = document.createElement("div");
        virtualContainer.style.height = "400px";
        virtualContainer.style.overflow = "auto";
        virtualContainer.setAttribute("data-virtual", "true");

        // Create virtual scrolling implementation
        const itemHeight = 50;
        const visibleItems = Math.ceil(400 / itemHeight);
        const buffer = 5;

        let scrollTop = 0;
        let startIndex = 0;
        let endIndex = Math.min(startIndex + visibleItems + buffer, count);

        const renderItems = () => {
          virtualContainer.innerHTML = "";

          // Add spacer for items before visible area
          const topSpacer = document.createElement("div");
          topSpacer.style.height = `${startIndex * itemHeight}px`;
          virtualContainer.appendChild(topSpacer);

          // Render visible items
          for (let i = startIndex; i < endIndex; i++) {
            const component = generateComponent(category, i);
            component.style.height = `${itemHeight}px`;
            virtualContainer.appendChild(component);
          }

          // Add spacer for items after visible area
          const bottomSpacer = document.createElement("div");
          bottomSpacer.style.height = `${(count - endIndex) * itemHeight}px`;
          virtualContainer.appendChild(bottomSpacer);
        };

        virtualContainer.addEventListener("scroll", () => {
          scrollTop = virtualContainer.scrollTop;
          startIndex = Math.floor(scrollTop / itemHeight);
          endIndex = Math.min(startIndex + visibleItems + buffer, count);
          renderItems();
        });

        renderItems();
        container.appendChild(virtualContainer);
      },
      { category, count }
    );
  }

  /**
   * Render components using Static Generation
   */
  async renderStatic(category: ComponentCategory, count: number): Promise<void> {
    if (!this.page) throw new Error("Page not set");

    // Navigate to pre-generated static page
    await this.page.goto(`/benchmark/static/${category.name}?count=${count}`);
    await this.page.waitForSelector('[data-testid="benchmark-container"]');
  }

  /**
   * Measure component render performance
   */
  async measureRenderPerformance(
    category: ComponentCategory,
    approach: string,
    count: number
  ): Promise<{
    renderTime: number;
    memoryUsage: number;
    componentCount: number;
  }> {
    if (!this.page) throw new Error("Page not set");

    const startTime = performance.now();
    const startMemory = await this.page.evaluate(() => (performance as any).memory?.usedJSHeapSize || 0);

    // Render components based on approach
    switch (approach) {
      case "csr":
        await this.renderCSR(category, count);
        break;
      case "ssr":
        await this.renderSSR(category, count);
        break;
      case "lazy":
        await this.renderLazy(category, count);
        break;
      case "virtual":
        await this.renderVirtual(category, count);
        break;
      case "static":
        await this.renderStatic(category, count);
        break;
      default:
        throw new Error(`Unknown rendering approach: ${approach}`);
    }

    const endTime = performance.now();
    const endMemory = await this.page.evaluate(() => (performance as any).memory?.usedJSHeapSize || 0);

    return {
      renderTime: endTime - startTime,
      memoryUsage: endMemory - startMemory,
      componentCount: count,
    };
  }

  /**
   * Clean up rendered components
   */
  async cleanup(): Promise<void> {
    if (!this.page) throw new Error("Page not set");

    await this.page.evaluate(() => {
      const container = document.querySelector('[data-testid="benchmark-container"]');
      if (container) {
        container.innerHTML = "";
      }

      // Clear any observers
      if (window.intersectionObserver) {
        window.intersectionObserver.disconnect();
      }
    });
  }
}

// Helper functions for component generation

function generateComponents(category: ComponentCategory, count: number): HTMLElement[] {
  const components: HTMLElement[] = [];

  for (let i = 0; i < count; i++) {
    const component = generateComponent(category, i);
    components.push(component);
  }

  return components;
}

function generateComponent(category: ComponentCategory, index: number): HTMLElement {
  const component = document.createElement("div");
  component.className = `reynard-${category.name}-component`;
  component.setAttribute("data-index", index.toString());

  switch (category.name) {
    case "primitives":
      component.innerHTML = `
        <button class="reynard-button" data-testid="button-${index}">
          Button ${index}
        </button>
      `;
      break;
    case "layouts":
      component.innerHTML = `
        <div class="reynard-grid-item" data-testid="grid-item-${index}">
          <div class="content">Grid Item ${index}</div>
        </div>
      `;
      break;
    case "data":
      component.innerHTML = `
        <div class="reynard-data-item" data-testid="data-item-${index}">
          <span class="label">Item ${index}</span>
          <span class="value">Value ${index}</span>
        </div>
      `;
      break;
    case "overlays":
      component.innerHTML = `
        <div class="reynard-overlay" data-testid="overlay-${index}">
          <div class="overlay-content">Overlay ${index}</div>
        </div>
      `;
      break;
    default:
      component.innerHTML = `<div>Component ${index}</div>`;
  }

  return component;
}

function createLazyComponent(category: ComponentCategory, index: number): HTMLElement {
  const component = document.createElement("div");
  component.setAttribute("data-lazy", "true");
  component.setAttribute("data-index", index.toString());
  component.className = `reynard-${category.name}-lazy`;

  // Placeholder content
  component.innerHTML = `
    <div class="lazy-placeholder">
      Loading component ${index}...
    </div>
  `;

  return component;
}
