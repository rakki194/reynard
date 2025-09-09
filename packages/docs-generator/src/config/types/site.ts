/**
 * @fileoverview Site-level type definitions for docs generator
 */

export interface DocTheme {
  name: string;
  colors?: Record<string, string>;
  fonts?: Record<string, string>;
  primaryColor?: string;
  [key: string]: unknown;
}

export interface DocNavigation {
  main?: Array<Record<string, unknown>>;
  footer?: Array<Record<string, unknown>>;
  breadcrumbs?: boolean;
  sidebar?: boolean;
  [key: string]: unknown;
}

export interface DocFooter {
  links: Array<Record<string, unknown>>;
  copyright: string;
  [key: string]: unknown;
}

export interface DocSearchConfig {
  enabled: boolean;
  provider: string;
  apiKey?: string;
  placeholder?: string;
  [key: string]: unknown;
}

export interface DocAnalytics {
  enabled: boolean;
  provider: string;
  trackingId?: string;
  [key: string]: unknown;
}

export interface DocSocial {
  github?: string;
  twitter?: string;
  discord?: string;
  [key: string]: unknown;
}
