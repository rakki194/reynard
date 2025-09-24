/**
 * 🦊 Scroll Observer
 * 
 * Implements Intersection Observer for scroll triggers with scroll position tracking
 */

export interface ScrollTriggerOptions {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
  triggerOnce?: boolean;
  onEnter?: (entry: IntersectionObserverEntry) => void;
  onExit?: (entry: IntersectionObserverEntry) => void;
  onProgress?: (progress: number, entry: IntersectionObserverEntry) => void;
}

export interface ScrollPositionOptions {
  onScroll?: (scrollY: number, scrollX: number) => void;
  throttle?: number;
}

export class ScrollObserver {
  private intersectionObserver: IntersectionObserver | null = null;
  private scrollListener: (() => void) | null = null;
  private elements: Map<Element, ScrollTriggerOptions> = new Map();
  private scrollThrottle: number = 16; // ~60fps
  private lastScrollTime: number = 0;

  constructor() {
    this.setupScrollListener();
  }

  private setupScrollListener(): void {
    let ticking = false;
    
    this.scrollListener = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          this.handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', this.scrollListener, { passive: true });
  }

  private handleScroll(): void {
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;

    // Update progress for all observed elements
    this.elements.forEach((options, element) => {
      if (options.onProgress) {
        const progress = this.calculateScrollProgress(element);
        options.onProgress(progress, {
          target: element,
          isIntersecting: true,
          intersectionRatio: progress,
          boundingClientRect: element.getBoundingClientRect(),
          rootBounds: null,
          time: performance.now(),
        } as IntersectionObserverEntry);
      }
    });
  }

  private calculateScrollProgress(element: Element): number {
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const elementHeight = rect.height;
    
    // Calculate how much of the element is visible
    const elementTop = rect.top;
    const elementBottom = rect.bottom;
    
    // Element is completely above viewport
    if (elementBottom < 0) {
      return 0;
    }
    
    // Element is completely below viewport
    if (elementTop > windowHeight) {
      return 0;
    }
    
    // Element is partially or completely visible
    const visibleTop = Math.max(0, elementTop);
    const visibleBottom = Math.min(windowHeight, elementBottom);
    const visibleHeight = visibleBottom - visibleTop;
    
    return Math.min(1, Math.max(0, visibleHeight / elementHeight));
  }

  observe(element: Element, options: ScrollTriggerOptions = {}): void {
    this.elements.set(element, options);

    if (!this.intersectionObserver) {
      this.intersectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const elementOptions = this.elements.get(entry.target);
            if (!elementOptions) return;

            if (entry.isIntersecting) {
              elementOptions.onEnter?.(entry);
            } else {
              elementOptions.onExit?.(entry);
            }

            // Trigger once and unobserve if specified
            if (elementOptions.triggerOnce && entry.isIntersecting) {
              this.unobserve(entry.target);
            }
          });
        },
        {
          root: options.root,
          rootMargin: options.rootMargin,
          threshold: options.threshold,
        }
      );
    }

    this.intersectionObserver.observe(element);
  }

  unobserve(element: Element): void {
    this.elements.delete(element);
    this.intersectionObserver?.unobserve(element);
  }

  disconnect(): void {
    this.elements.clear();
    this.intersectionObserver?.disconnect();
    this.intersectionObserver = null;
    
    if (this.scrollListener) {
      window.removeEventListener('scroll', this.scrollListener);
      this.scrollListener = null;
    }
  }

  // Utility methods for scroll-based animations
  getScrollProgress(element: Element): number {
    return this.calculateScrollProgress(element);
  }

  getScrollPosition(): { x: number; y: number } {
    return {
      x: window.scrollX,
      y: window.scrollY,
    };
  }

  getElementPosition(element: Element): { top: number; bottom: number; height: number } {
    const rect = element.getBoundingClientRect();
    return {
      top: rect.top + window.scrollY,
      bottom: rect.bottom + window.scrollY,
      height: rect.height,
    };
  }
}

// Global scroll observer instance
export const globalScrollObserver = new ScrollObserver();
