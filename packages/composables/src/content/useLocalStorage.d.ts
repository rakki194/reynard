export interface LocalStorageOptions {
    defaultValue?: any;
    serializer?: {
        read: (value: string) => any;
        write: (value: any) => string;
    };
    syncAcrossTabs?: boolean;
}
/**
 * Local storage composable with reactive updates and cross-tab synchronization
 *
 * @param key Storage key
 * @param options Configuration options
 * @returns Signal with storage value and setter
 */
export declare function useLocalStorage(key: string, options?: LocalStorageOptions): readonly [import("solid-js").Accessor<any>, (value: any) => void, () => void];
/**
 * Session storage composable with reactive updates
 *
 * @param key Storage key
 * @param options Configuration options
 * @returns Signal with storage value and setter
 */
export declare function useSessionStorage(key: string, options?: Omit<LocalStorageOptions, "syncAcrossTabs">): readonly [import("solid-js").Accessor<any>, (value: any) => void, () => void];
