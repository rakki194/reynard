import { Component, ComponentType, World } from "./types";
/**
 * A system condition that determines if a system should run.
 */
export interface SystemCondition {
    readonly __condition: true;
    readonly name: string;
    readonly run: (world: World) => boolean;
}
/**
 * Creates a system condition.
 */
export declare function createCondition(name: string, run: (world: World) => boolean): SystemCondition;
/**
 * Common system conditions.
 */
export declare const Conditions: {
    /**
     * Runs the system every N frames.
     */
    everyNFrames(n: number): SystemCondition;
    /**
     * Runs the system when a resource changes.
     */
    resourceChanged<T>(resourceType: any): SystemCondition;
    /**
     * Runs the system when a resource equals a specific value.
     */
    resourceEquals<T>(resourceType: any, value: T): SystemCondition;
    /**
     * Runs the system when a resource exists.
     */
    resourceExists<T>(resourceType: any): SystemCondition;
    /**
     * Runs the system when a resource does not exist.
     */
    resourceNotExists<T>(resourceType: any): SystemCondition;
    /**
     * Runs the system when any entity with specific components exists.
     */
    anyEntityWith<T extends Component[]>(...componentTypes: ComponentType<T[number]>[]): SystemCondition;
    /**
     * Runs the system when no entities with specific components exist.
     */
    noEntityWith<T extends Component[]>(...componentTypes: ComponentType<T[number]>[]): SystemCondition;
    /**
     * Runs the system when a specific number of entities exist.
     */
    entityCountEquals(count: number): SystemCondition;
    /**
     * Runs the system when entity count is greater than a threshold.
     */
    entityCountGreaterThan(threshold: number): SystemCondition;
    /**
     * Runs the system when entity count is less than a threshold.
     */
    entityCountLessThan(threshold: number): SystemCondition;
    /**
     * Runs the system when a specific event has been sent.
     */
    eventSent<T>(eventType: string): SystemCondition;
    /**
     * Runs the system when a specific event has not been sent.
     */
    eventNotSent<T>(eventType: string): SystemCondition;
    /**
     * Runs the system when a specific time has passed.
     */
    timePassed(seconds: number): SystemCondition;
    /**
     * Runs the system when a specific frame count has passed.
     */
    frameCountPassed(frames: number): SystemCondition;
    /**
     * Runs the system when a random condition is met.
     */
    randomChance(chance: number): SystemCondition;
    /**
     * Runs the system when a specific key is pressed.
     */
    keyPressed(key: string): SystemCondition;
    /**
     * Runs the system when a specific mouse button is pressed.
     */
    mousePressed(button: number): SystemCondition;
};
/**
 * Condition combinators for combining multiple conditions.
 */
export declare const ConditionCombinators: {
    /**
     * Combines conditions with AND logic.
     */
    and(...conditions: SystemCondition[]): SystemCondition;
    /**
     * Combines conditions with OR logic.
     */
    or(...conditions: SystemCondition[]): SystemCondition;
    /**
     * Negates a condition.
     */
    not(condition: SystemCondition): SystemCondition;
    /**
     * Combines conditions with XOR logic.
     */
    xor(...conditions: SystemCondition[]): SystemCondition;
};
