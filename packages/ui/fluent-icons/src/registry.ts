/**
 * Icon Registry
 *
 * Central registry for managing multiple icon packages
 * in the Reynard design system.
 */

import type { IconPackage, IconRegistry, IconSearchResult } from "./types";

class ReynardIconRegistry implements IconRegistry {
  private packages = new Map<string, IconPackage>();

  register(pkg: IconPackage): void {
    if (this.packages.has(pkg.id)) {
      console.warn(`Icon package '${pkg.id}' is already registered. Overwriting.`);
    }
    this.packages.set(pkg.id, pkg);
  }

  unregister(packageId: string): void {
    this.packages.delete(packageId);
  }

  getIcon(name: string, packageId?: string): SVGElement | null {
    if (packageId) {
      const pkg = this.packages.get(packageId);
      return pkg?.getIcon(name) || null;
    }

    // Search all packages for the icon
    for (const pkg of this.packages.values()) {
      const icon = pkg.getIcon(name);
      if (icon) {
        return icon;
      }
    }

    return null;
  }

  getAllIconNames(): string[] {
    const allNames = new Set<string>();

    for (const pkg of this.packages.values()) {
      const names = pkg.getIconNames();
      names.forEach(name => allNames.add(name));
    }

    return Array.from(allNames);
  }

  getPackages(): IconPackage[] {
    return Array.from(this.packages.values());
  }

  searchIcons(query: string): IconSearchResult[] {
    const results: IconSearchResult[] = [];
    const lowerQuery = query.toLowerCase();

    for (const pkg of this.packages.values()) {
      const iconNames = pkg.getIconNames();

      for (const name of iconNames) {
        let score = 0;

        // Exact match gets highest score
        if (name === lowerQuery) {
          score = 100;
        }
        // Starts with query gets high score
        else if (name.startsWith(lowerQuery)) {
          score = 80;
        }
        // Contains query gets medium score
        else if (name.includes(lowerQuery)) {
          score = 60;
        }
        // Check metadata keywords
        else if (pkg.getIconMetadata) {
          const metadata = pkg.getIconMetadata(name);
          if (metadata?.keywords) {
            const keywordMatch = metadata.keywords.some(keyword => keyword.toLowerCase().includes(lowerQuery));
            if (keywordMatch) {
              score = 40;
            }
          }
        }

        if (score > 0) {
          results.push({
            name,
            packageId: pkg.id,
            packageName: pkg.name,
            metadata: pkg.getIconMetadata?.(name) || undefined,
            score,
          });
        }
      }
    }

    // Sort by score (highest first)
    return results.sort((a, b) => (b.score || 0) - (a.score || 0));
  }
}

// Global registry instance
export const iconRegistry = new ReynardIconRegistry();

// Convenience functions
export const registerIconPackage = (pkg: IconPackage) => iconRegistry.register(pkg);
export const unregisterIconPackage = (packageId: string) => iconRegistry.unregister(packageId);
export const getIcon = (name: string, packageId?: string) => iconRegistry.getIcon(name, packageId);
export const getAllIconNames = () => iconRegistry.getAllIconNames();
export const getIconPackages = () => iconRegistry.getPackages();
export const searchIcons = (query: string) => iconRegistry.searchIcons(query);
