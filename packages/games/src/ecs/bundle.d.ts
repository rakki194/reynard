import { Component, ComponentType } from "./types";
/**
 * A bundle represents a collection of components that can be added or removed together.
 * This is similar to Bevy's Bundle trait.
 */
export interface Bundle {
    readonly __bundle: true;
    readonly components: Component[];
}
/**
 * Bundle metadata for tracking bundle information.
 */
export interface BundleInfo {
    readonly id: number;
    readonly name: string;
    readonly componentTypes: ComponentType<Component>[];
}
/**
 * Creates bundle info.
 */
export declare function createBundleInfo(id: number, name: string, componentTypes: ComponentType<Component>[]): BundleInfo;
/**
 * Bundle registry for managing bundle types.
 */
export declare class BundleRegistry {
    private bundles;
    private bundleIds;
    private nextId;
    /**
     * Registers a new bundle type.
     */
    register(name: string, componentTypes: ComponentType<Component>[]): BundleInfo;
    /**
     * Gets a bundle by name.
     */
    getByName(name: string): BundleInfo | undefined;
    /**
     * Gets a bundle by ID.
     */
    getById(id: number): BundleInfo | undefined;
    /**
     * Gets all registered bundles.
     */
    getAllBundles(): BundleInfo[];
    /**
     * Checks if a bundle is registered.
     */
    has(name: string): boolean;
}
/**
 * Helper function to create a bundle from components.
 */
export declare function createBundle(components: Component[]): Bundle;
/**
 * Helper function to create a bundle from component types with default values.
 */
export declare function createBundleFromTypes(componentTypes: ComponentType<Component>[]): Bundle;
