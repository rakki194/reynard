// Query result implementation for component access

import { Component, ComponentType, Entity, QueryResult } from "./types";

/**
 * Query result implementation.
 */
export class QueryResultImpl<T extends Component[]> implements QueryResult<T> {
    constructor(
        public readonly entities: Entity[],
        public readonly components: T,
        public readonly length: number,
        private readonly componentTypes: ComponentType<Component>[] = [],
        private readonly entityComponents: Map<number, Component[]> = new Map()
    ) { }

    forEach(callback: (entity: Entity, ...components: T) => void | false): void {
        for (let i = 0; i < this.length; i++) {
            const entity = this.entities[i];
            const componentValues = this.getComponentValuesForEntity(i) as T;
            const result = callback(entity, ...componentValues);
            if (result === false) {
                break; // Early termination
            }
        }
    }

    map<U>(callback: (entity: Entity, ...components: T) => U): U[] {
        const results: U[] = [];
        for (let i = 0; i < this.length; i++) {
            const entity = this.entities[i];
            const componentValues = this.getComponentValuesForEntity(i) as T;
            results.push(callback(entity, ...componentValues));
        }
        return results;
    }

    filter(predicate: (entity: Entity, ...components: T) => boolean): QueryResult<T> {
        const filteredEntities: Entity[] = [];
        const filteredEntityComponents = new Map<number, Component[]>();

        for (let i = 0; i < this.length; i++) {
            const entity = this.entities[i];
            const componentValues = this.getComponentValuesForEntity(i) as T;

            if (predicate(entity, ...componentValues)) {
                filteredEntities.push(entity);
                filteredEntityComponents.set(entity.index, componentValues);
            }
        }

        // Create a flat array of all components for backward compatibility
        const allComponents: Component[] = [];
        Array.from(filteredEntityComponents.values()).forEach(components => {
            allComponents.push(...components);
        });

        return new QueryResultImpl(
            filteredEntities,
            allComponents as T,
            filteredEntities.length,
            this.componentTypes,
            filteredEntityComponents
        );
    }

    first(): { entity: Entity; components: T } | undefined {
        if (this.length === 0) {
            return undefined;
        }

        const entity = this.entities[0];
        const components = this.getComponentValuesForEntity(0) as T;
        return { entity, components };
    }

    private getComponentValuesForEntity(entityIndex: number): Component[] {
        const entity = this.entities[entityIndex];
        const components = this.entityComponents.get(entity.index);
        if (!components) {
            throw new Error(`No components found for entity ${entity.index}`);
        }
        return components;
    }
}
