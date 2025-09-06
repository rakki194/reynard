#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a simple, clean declaration file
const indexDeclaration = `/**
 * reynard-fluent-icons
 * 
 * Fluent UI icons package for the Reynard design system.
 * Provides a modular icon system with Fluent UI icons.
 */

export interface IconPackage {
  id: string;
  name: string;
  version: string;
  getIcon: (name: string) => SVGElement | null;
  getIconNames: () => string[];
  hasIcon: (name: string) => boolean;
  getIconMetadata?: (name: string) => IconMetadata | null;
}

export interface IconMetadata {
  name: string;
  category: string;
  tags?: string[];
  description?: string;
  keywords?: string[];
}

export interface IconRegistry {
  register: (pkg: IconPackage) => void;
  unregister: (packageId: string) => void;
  getIcon: (name: string, packageId?: string) => SVGElement | null;
  getAllIconNames: () => string[];
  getPackages: () => IconPackage[];
  searchIcons: (query: string) => IconSearchResult[];
}

export interface IconSearchResult {
  name: string;
  package: string;
  category: string;
  tags: string[];
  score: number;
}

export declare const iconRegistry: IconRegistry;
export declare function registerIconPackage(pkg: IconPackage): void;
export declare function unregisterIconPackage(packageId: string): void;
export declare function getIcon(name: string, packageId?: string): SVGElement | null;
export declare function getAllIconNames(): string[];
export declare function getIconPackages(): IconPackage[];
export declare function searchIcons(query: string): IconSearchResult[];

// Fluent Icons Package
export declare const fluentIconsPackage: IconPackage;
`;

// Write the main declaration file
const distDir = path.join(__dirname, '../dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

fs.writeFileSync(path.join(distDir, 'index.d.ts'), indexDeclaration);

// Create registry.d.ts
const registryDeclaration = `export interface IconPackage {
  id: string;
  name: string;
  version: string;
  getIcon: (name: string) => SVGElement | null;
  getIconNames: () => string[];
  hasIcon: (name: string) => boolean;
  getIconMetadata?: (name: string) => IconMetadata | null;
}

export interface IconMetadata {
  name: string;
  category: string;
  tags?: string[];
  description?: string;
  keywords?: string[];
}

export interface IconRegistry {
  register: (pkg: IconPackage) => void;
  unregister: (packageId: string) => void;
  getIcon: (name: string, packageId?: string) => SVGElement | null;
  getAllIconNames: () => string[];
  getPackages: () => IconPackage[];
  searchIcons: (query: string) => IconSearchResult[];
}

export interface IconSearchResult {
  name: string;
  package: string;
  category: string;
  tags: string[];
  score: number;
}

export declare const iconRegistry: IconRegistry;
export declare function registerIconPackage(pkg: IconPackage): void;
export declare function unregisterIconPackage(packageId: string): void;
export declare function getIcon(name: string, packageId?: string): SVGElement | null;
export declare function getAllIconNames(): string[];
export declare function getIconPackages(): IconPackage[];
export declare function searchIcons(query: string): IconSearchResult[];
`;

fs.writeFileSync(path.join(distDir, 'registry.d.ts'), registryDeclaration);

// Create fluentIcons.d.ts
const fluentIconsDeclaration = `export interface IconPackage {
  id: string;
  name: string;
  version: string;
  getIcon: (name: string) => SVGElement | null;
  getIconNames: () => string[];
  hasIcon: (name: string) => boolean;
  getIconMetadata?: (name: string) => IconMetadata | null;
}

export interface IconMetadata {
  name: string;
  category: string;
  tags?: string[];
  description?: string;
  keywords?: string[];
}

export declare const fluentIconsPackage: IconPackage;
`;

fs.writeFileSync(path.join(distDir, 'fluentIcons.d.ts'), fluentIconsDeclaration);

console.log('✅ Generated clean TypeScript declaration files successfully!');
console.log('📁 Files created:');
console.log('   - dist/index.d.ts');
console.log('   - dist/registry.d.ts');
console.log('   - dist/fluentIcons.d.ts');
