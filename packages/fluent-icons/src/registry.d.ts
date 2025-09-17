/**
 * Icon Registry
 *
 * Central registry for managing multiple icon packages
 * in the Reynard design system.
 */
import type { IconPackage, IconRegistry, IconSearchResult } from "./types";
declare class ReynardIconRegistry implements IconRegistry {
    private packages;
    register(pkg: IconPackage): void;
    unregister(packageId: string): void;
    getIcon(name: string, packageId?: string): SVGElement | null;
    getAllIconNames(): string[];
    getPackages(): IconPackage[];
    searchIcons(query: string): IconSearchResult[];
}
export declare const iconRegistry: ReynardIconRegistry;
export declare const registerIconPackage: (pkg: IconPackage) => void;
export declare const unregisterIconPackage: (packageId: string) => void;
export declare const getIcon: (name: string, packageId?: string) => SVGElement | null;
export declare const getAllIconNames: () => string[];
export declare const getIconPackages: () => IconPackage[];
export declare const searchIcons: (query: string) => IconSearchResult[];
export {};
