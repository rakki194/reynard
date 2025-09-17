/**
 * @fileoverview Storage types and strategies for component management.
 *
 * Defines how components are stored and accessed in the ECS system.
 * Different storage strategies optimize for different access patterns.
 *
 * @example
 * ```typescript
 * // Table storage for frequently accessed components
 * const positionType = registry.register('Position', StorageType.Table, () => new Position(0, 0));
 *
 * // SparseSet storage for optional components
 * const powerUpType = registry.register('PowerUp', StorageType.SparseSet, () => new PowerUp());
 * ```
 *
 * @performance Table: O(1) iteration, O(n) insertion/removal | SparseSet: O(1) insertion/removal, O(n) iteration
 * @author Reynard ECS Team
 * @since 1.0.0
 */
/**
 * Storage strategy for components in the ECS system.
 *
 * Different storage strategies optimize for different access patterns.
 * Choose the right strategy based on how your components are used.
 *
 * @example
 * ```typescript
 * // Table storage for frequently accessed components
 * const positionType = registry.register('Position', StorageType.Table, () => new Position(0, 0));
 *
 * // SparseSet storage for optional components
 * const powerUpType = registry.register('PowerUp', StorageType.SparseSet, () => new PowerUp());
 * ```
 *
 * @performance
 * - Table: O(1) iteration, O(n) insertion/removal
 * - SparseSet: O(1) insertion/removal, O(n) iteration
 *
 * @since 1.0.0
 */
export var StorageType;
(function (StorageType) {
    /** Dense storage optimized for iteration and frequent access */
    StorageType["Table"] = "table";
    /** Sparse storage optimized for insertion/removal and optional components */
    StorageType["SparseSet"] = "sparse";
})(StorageType || (StorageType = {}));
