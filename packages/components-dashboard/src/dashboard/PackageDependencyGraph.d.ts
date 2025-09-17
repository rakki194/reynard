/**
 * PackageDependencyGraph Component
 * Visual dependency graph and conflict resolution interface
 */
import { Component } from "solid-js";
export interface PackageDependencyGraphProps {
    /** Whether to show conflicts */
    showConflicts?: boolean;
    /** Whether to show resolution options */
    showResolution?: boolean;
    /** Whether to show visualization */
    showVisualization?: boolean;
}
export interface PackageDependency {
    name: string;
    version: string;
    dependencies: string[];
    dependents: string[];
    conflicts: string[];
    status: "resolved" | "conflict" | "missing" | "circular";
    isInstalled: boolean;
}
export interface DependencyConflict {
    package1: string;
    package2: string;
    conflictType: "version" | "dependency" | "circular";
    description: string;
    resolution: "manual" | "automatic" | "none";
}
export declare const PackageDependencyGraph: Component<PackageDependencyGraphProps>;
