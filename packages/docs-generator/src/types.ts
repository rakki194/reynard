/**
 * Lightweight shared types for the docs generator
 */

export interface DocEngineConfig {
  rootPath?: string;
  outputPath?: string;
  packages?: any[];
  templates?: any[];
  examples?: any[];
  site?: any;
  theme?: any;
  navigation?: any;
  footer?: any;
  search?: any;
  analytics?: any;
  social?: any;
  pages?: any[];
  sections?: any[];
  api?: any[];
  customComponents?: Record<string, any>;
  plugins?: any[];
  [key: string]: any;
}

export interface DocPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  metadata: any;
  type: string;
  published?: boolean;
  order?: number;
}

export interface DocSection {
  id: string;
  title: string;
  description: string;
  pages: DocPage[];
  order: number;
}
