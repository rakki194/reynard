// Component registry for managing component types

import { Component, ComponentType, StorageType } from "./types";

export class ComponentRegistry {
  private componentTypes: Map<string, ComponentType<Component>> = new Map();
  private componentIds: Map<number, ComponentType<Component>> = new Map();
  private nextId: number = 0;

  register<T extends Component>(
    name: string,
    storage: StorageType = StorageType.Table,
    create: () => T
  ): ComponentType<T> {
    if (this.componentTypes.has(name)) {
      throw new Error(`Component type '${name}' is already registered`);
    }

    const id = this.nextId++;
    const componentType: ComponentType<T> = { name, id, storage, create };
    this.componentTypes.set(name, componentType as ComponentType<Component>);
    this.componentIds.set(id, componentType as ComponentType<Component>);
    return componentType;
  }

  getByName<T extends Component>(name: string): ComponentType<T> | undefined {
    return this.componentTypes.get(name) as ComponentType<T> | undefined;
  }

  getById<T extends Component>(id: number): ComponentType<T> | undefined {
    return this.componentIds.get(id) as ComponentType<T> | undefined;
  }

  getAllTypes(): ComponentType<Component>[] {
    return Array.from(this.componentTypes.values());
  }

  has(name: string): boolean {
    return this.componentTypes.has(name);
  }
}
