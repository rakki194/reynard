/**
 * @fileoverview Utility functions for Reynard documentation system
 */

import type { DocPage, DocSection, DocMetadata } from './types';

/**
 * Generate a URL-friendly slug from a string
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/**
 * Extract headings from HTML content
 */
export function extractHeadings(html: string): Array<{
  id: string;
  text: string;
  level: number;
}> {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
  
  return Array.from(headings).map((heading, index) => ({
    id: heading.id || `heading-${index}`,
    text: heading.textContent || '',
    level: parseInt(heading.tagName.charAt(1))
  }));
}

/**
 * Generate table of contents from headings
 */
export function generateTableOfContents(headings: Array<{
  id: string;
  text: string;
  level: number;
}>): Array<{
  id: string;
  text: string;
  level: number;
  children: any[];
}> {
  const toc: any[] = [];
  const stack: any[] = [];

  for (const heading of headings) {
    const item = {
      id: heading.id,
      text: heading.text,
      level: heading.level,
      children: []
    };

    // Find the correct parent level
    while (stack.length > 0 && stack[stack.length - 1].level >= heading.level) {
      stack.pop();
    }

    if (stack.length === 0) {
      toc.push(item);
    } else {
      stack[stack.length - 1].children.push(item);
    }

    stack.push(item);
  }

  return toc;
}

/**
 * Validate documentation metadata
 */
export function validateMetadata(metadata: DocMetadata): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!metadata.title || metadata.title.trim() === '') {
    errors.push('Title is required');
  }

  if (metadata.title && metadata.title.length > 100) {
    errors.push('Title should be less than 100 characters');
  }

  if (metadata.description && metadata.description.length > 500) {
    errors.push('Description should be less than 500 characters');
  }

  if (metadata.tags && !Array.isArray(metadata.tags)) {
    errors.push('Tags must be an array');
  }

  if (metadata.date && isNaN(Date.parse(metadata.date))) {
    errors.push('Date must be a valid date string');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Sort pages by order and title
 */
export function sortPages(pages: DocPage[]): DocPage[] {
  return [...pages].sort((a, b) => {
    // First sort by order if specified
    if (a.order !== undefined && b.order !== undefined) {
      return a.order - b.order;
    }
    
    // Then sort by title alphabetically
    return a.title.localeCompare(b.title);
  });
}

/**
 * Sort sections by order and title
 */
export function sortSections(sections: DocSection[]): DocSection[] {
  return [...sections].sort((a, b) => {
    // First sort by order
    if (a.order !== b.order) {
      return a.order - b.order;
    }
    
    // Then sort by title alphabetically
    return a.title.localeCompare(b.title);
  });
}

/**
 * Filter pages by criteria
 */
export function filterPages(
  pages: DocPage[], 
  criteria: {
    published?: boolean;
    category?: string;
    tags?: string[];
    search?: string;
  }
): DocPage[] {
  return pages.filter(page => {
    if (criteria.published !== undefined && page.published !== criteria.published) {
      return false;
    }

    if (criteria.category && page.metadata.category !== criteria.category) {
      return false;
    }

    if (criteria.tags && criteria.tags.length > 0) {
      const pageTags = page.metadata.tags || [];
      const hasMatchingTag = criteria.tags.some(tag => pageTags.includes(tag));
      if (!hasMatchingTag) {
        return false;
      }
    }

    if (criteria.search) {
      const searchTerm = criteria.search.toLowerCase();
      const searchableText = [
        page.title,
        page.metadata.description || '',
        page.content,
        ...(page.metadata.tags || [])
      ].join(' ').toLowerCase();

      if (!searchableText.includes(searchTerm)) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Calculate reading time for content
 */
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

/**
 * Extract code blocks from content
 */
export function extractCodeBlocks(content: string): Array<{
  language: string;
  code: string;
  startLine: number;
  endLine: number;
}> {
  const codeBlocks: Array<{
    language: string;
    code: string;
    startLine: number;
    endLine: number;
  }> = [];

  const lines = content.split('\n');
  let inCodeBlock = false;
  let currentLanguage = '';
  let currentCode: string[] = [];
  let startLine = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        // End of code block
        codeBlocks.push({
          language: currentLanguage,
          code: currentCode.join('\n'),
          startLine,
          endLine: i
        });
        inCodeBlock = false;
        currentCode = [];
      } else {
        // Start of code block
        inCodeBlock = true;
        currentLanguage = line.slice(3).trim() || 'text';
        startLine = i;
      }
    } else if (inCodeBlock) {
      currentCode.push(line);
    }
  }

  return codeBlocks;
}

/**
 * Generate a unique ID for documentation elements
 */
export function generateId(prefix: string = 'doc'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Format date for display
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Format relative time
 */
export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else {
    return formatDate(d);
  }
}

/**
 * Sanitize HTML content
 */
export function sanitizeHtml(html: string): string {
  // const allowedTags = [
  //   'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  //   'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'a', 'img', 'table',
  //   'thead', 'tbody', 'tr', 'th', 'td'
  // ];

  // const allowedAttributes = {
  //   'a': ['href', 'title', 'target', 'rel'],
  //   'img': ['src', 'alt', 'title', 'width', 'height'],
  //   'table': ['class'],
  //   'th': ['scope'],
  //   'td': ['colspan', 'rowspan']
  // };

  // Basic HTML sanitization - in production, use a proper library like DOMPurify
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  // Remove script tags and dangerous attributes
  const scripts = doc.querySelectorAll('script');
  scripts.forEach(script => script.remove());
  
  const dangerousElements = doc.querySelectorAll('*');
  dangerousElements.forEach(element => {
    // Remove dangerous attributes
    Array.from(element.attributes).forEach(attr => {
      if (attr.name.startsWith('on') || attr.name === 'javascript:') {
        element.removeAttribute(attr.name);
      }
    });
  });

  return doc.body.innerHTML;
}

/**
 * Deep merge objects
 */
export function deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
  const result = { ...target };
  
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      const sourceValue = source[key];
      const targetValue = result[key];
      
      if (sourceValue && typeof sourceValue === 'object' && !Array.isArray(sourceValue) &&
          targetValue && typeof targetValue === 'object' && !Array.isArray(targetValue)) {
        result[key] = deepMerge(targetValue, sourceValue);
      } else {
        result[key] = sourceValue as T[Extract<keyof T, string>];
      }
    }
  }
  
  return result;
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}
