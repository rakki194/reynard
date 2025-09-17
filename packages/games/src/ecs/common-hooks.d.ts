import { Component, ComponentType } from "./types";
import { ComponentHook } from "./component-hook-types";
/**
 * Common component hook implementations.
 */
export declare const CommonHooks: {
    /**
     * Logs when a component is added.
     */
    logOnAdd<T extends Component>(componentType: ComponentType<T>): ComponentHook;
    /**
     * Logs when a component is removed.
     */
    logOnRemove<T extends Component>(componentType: ComponentType<T>): ComponentHook;
    /**
     * Validates component data on add.
     */
    validateOnAdd<T extends Component>(componentType: ComponentType<T>, validator: (component: T) => boolean): ComponentHook;
    /**
     * Triggers an event when a component is added.
     */
    eventOnAdd<T extends Component>(eventType: string): ComponentHook;
    /**
     * Updates a counter when a component is added.
     */
    counterOnAdd<T extends Component>(counterResource: any): ComponentHook;
    /**
     * Updates a counter when a component is removed.
     */
    counterOnRemove<T extends Component>(counterResource: any): ComponentHook;
    /**
     * Cleans up resources when a component is removed.
     */
    cleanupOnRemove<T extends Component>(cleanup: (component: T) => void): ComponentHook;
    /**
     * Initializes component state on add.
     */
    initializeOnAdd<T extends Component>(initializer: (component: T) => void): ComponentHook;
};
