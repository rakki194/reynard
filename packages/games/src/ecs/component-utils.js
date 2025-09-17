// Component utility functions
import { StorageType } from "./types";
export function createComponentType(name, storage = StorageType.Table, create) {
    // If no create function provided, create a default one that returns an empty object
    const createFn = create || (() => ({}));
    return { name, id: 0, storage, create: createFn };
}
