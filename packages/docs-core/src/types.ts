/**
 * @fileoverview Type definitions for Reynard documentation system
 */

import { Component } from 'solid-js';

/**
 * Documentation content types
 */
export type DocContentType = 
  | 'markdown'
  | 'mdx'
  | 'html'
  | 'component'
  | 'api'
  | 'example';

/**
 * Documentation metadata
 */
export interface DocMetadata {
  title: string;
  description?: string;
  author?: string;
  date?: string;
  tags?: string[];
  category?: string;
  version?: string;
  lastModified?: string;
  [key: string]: any;
}

/**
 * Documentation page structure
 */
export interface DocPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  metadata: DocMetadata;
  type: DocContentType;
  children?: DocPage[];
  parent?: string;
  order?: number;
  published?: boolean;
}

/**
 * Documentation section
 */
export interface DocSection {
  id: string;
  title: string;
  description?: string;
  pages: DocPage[];
  order: number;
  icon?: string;
  color?: string;
}

/**
 * Documentation site configuration
 */
export interface DocSiteConfig {
  title: string;
  description: string;
  baseUrl: string;
  logo?: string;
  favicon?: string;
  theme: DocTheme;
  navigation: DocNavigation;
  footer?: DocFooter;
  search?: DocSearchConfig;
  analytics?: DocAnalytics;
  social?: DocSocial;
}

/**
 * Documentation theme configuration
 */
export interface DocTheme {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  fontFamily?: string;
  customCSS?: string;
}

/**
 * Navigation configuration
 */
export interface DocNavigation {
  main: DocNavItem[];
  footer?: DocNavItem[];
  breadcrumbs?: boolean;
  sidebar?: boolean;
}

export interface DocNavItem {
  label: string;
  href?: string;
  icon?: string;
  children?: DocNavItem[];
  external?: boolean;
  badge?: string;
  color?: string;
}

/**
 * Footer configuration
 */
export interface DocFooter {
  links: DocNavItem[];
  copyright?: string;
  social?: DocSocial;
}

/**
 * Search configuration
 */
export interface DocSearchConfig {
  enabled: boolean;
  provider: 'local' | 'algolia' | 'custom';
  apiKey?: string;
  indexName?: string;
  placeholder?: string;
}

/**
 * Analytics configuration
 */
export interface DocAnalytics {
  provider: 'google' | 'plausible' | 'custom';
  trackingId?: string;
  domain?: string;
}

/**
 * Social media links
 */
export interface DocSocial {
  github?: string;
  twitter?: string;
  discord?: string;
  linkedin?: string;
  youtube?: string;
}

/**
 * Code example configuration
 */
export interface CodeExample {
  id: string;
  title: string;
  description?: string;
  code: string;
  language: string;
  live?: boolean;
  editable?: boolean;
  dependencies?: string[];
  imports?: string[];
  output?: string;
}

/**
 * API documentation
 */
export interface ApiDoc {
  name: string;
  type: 'function' | 'class' | 'interface' | 'type' | 'enum';
  description: string;
  parameters?: ApiParameter[];
  returns?: ApiReturn;
  examples?: CodeExample[];
  deprecated?: boolean;
  since?: string;
  tags?: string[];
}

export interface ApiParameter {
  name: string;
  type: string;
  description: string;
  required: boolean;
  default?: any;
  optional?: boolean;
}

export interface ApiReturn {
  type: string;
  description: string;
}

/**
 * Documentation renderer props
 */
export interface DocRendererProps {
  content: string;
  metadata: DocMetadata;
  type: DocContentType;
  theme?: DocTheme;
  className?: string;
  onNavigate?: (path: string) => void;
  onCodeRun?: (code: string) => void;
}

/**
 * Documentation engine configuration
 */
export interface DocEngineConfig {
  site: DocSiteConfig;
  pages: DocPage[];
  sections: DocSection[];
  examples: CodeExample[];
  api: ApiDoc[];
  customComponents?: Record<string, Component<any>>;
  plugins?: DocPlugin[];
}

/**
 * Documentation plugin interface
 */
export interface DocPlugin {
  name: string;
  version: string;
  install: (engine: DocEngine) => void;
  uninstall?: (engine: DocEngine) => void;
}

/**
 * Documentation engine interface
 */
export interface DocEngine {
  config: DocEngineConfig;
  render: (page: DocPage) => Component<DocRendererProps>;
  parse: (content: string, type: DocContentType) => Promise<DocPage>;
  search: (query: string) => DocPage[];
  getPage: (id: string) => DocPage | undefined;
  getSection: (id: string) => DocSection | undefined;
  addPlugin: (plugin: DocPlugin) => void;
  removePlugin: (name: string) => void;
}

/**
 * Markdown parsing options
 */
export interface MarkdownOptions {
  breaks?: boolean;
  gfm?: boolean;
  tables?: boolean;
  pedantic?: boolean;
  sanitize?: boolean;
  smartLists?: boolean;
  smartypants?: boolean;
  highlight?: (code: string, language: string) => string;
}

/**
 * Component documentation
 */
export interface ComponentDoc {
  name: string;
  description: string;
  props: ComponentProp[];
  examples: CodeExample[];
  usage: string;
  related?: string[];
}

export interface ComponentProp {
  name: string;
  type: string;
  description: string;
  required: boolean;
  default?: any;
  deprecated?: boolean;
}
