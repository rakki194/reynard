// Bundle system for grouped component operations

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
export function createBundleInfo(id: number, name: string, componentTypes: ComponentType<Component>[]): BundleInfo {
  return { id, name, componentTypes };
}

/**
 * Bundle registry for managing bundle types.
 */
export class BundleRegistry {
  private bundles: Map<string, BundleInfo> = new Map();
  private bundleIds: Map<number, BundleInfo> = new Map();
  private nextId: number = 0;

  /**
   * Registers a new bundle type.
   */
  register(name: string, componentTypes: ComponentType<Component>[]): BundleInfo {
    if (this.bundles.has(name)) {
      throw new Error(`Bundle type '${name}' is already registered`);
    }

    const id = this.nextId++;
    const bundleInfo: BundleInfo = {
      id,
      name,
      componentTypes,
    };

    this.bundles.set(name, bundleInfo);
    this.bundleIds.set(id, bundleInfo);
    return bundleInfo;
  }

  /**
   * Gets a bundle by name.
   */
  getByName(name: string): BundleInfo | undefined {
    return this.bundles.get(name);
  }

  /**
   * Gets a bundle by ID.
   */
  getById(id: number): BundleInfo | undefined {
    return this.bundleIds.get(id);
  }

  /**
   * Gets all registered bundles.
   */
  getAllBundles(): BundleInfo[] {
    return Array.from(this.bundles.values());
  }

  /**
   * Checks if a bundle is registered.
   */
  has(name: string): boolean {
    return this.bundles.has(name);
  }
}

/**
 * Helper function to create a bundle from components.
 */
export function createBundle(components: Component[]): Bundle {
  return {
    __bundle: true,
    components,
  };
}

/**
 * Helper function to create a bundle from component types with default values.
 */
export function createBundleFromTypes(componentTypes: ComponentType<Component>[]): Bundle {
  const components = componentTypes.map(ct => ct.create());
  return createBundle(components);
}
