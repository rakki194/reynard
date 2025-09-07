// Component utility functions

import { Component, ComponentType, StorageType } from './types';

// Overloaded function signatures for createComponentType
export function createComponentType<T extends Component>(
  name: string
): ComponentType<T>;
export function createComponentType<T extends Component>(
  name: string,
  storage: StorageType,
  create: () => T
): ComponentType<T>;
export function createComponentType<T extends Component>(
  name: string,
  storage: StorageType = StorageType.Table,
  create?: () => T
): ComponentType<T> {
  // If no create function provided, create a default one that returns an empty object
  const createFn = create || (() => ({} as T));
  return { name, id: 0, storage, create: createFn };
}
