/**
 * Utility Types
 *
 * Defines common utility types, callback signatures, and helper types
 * used throughout the Reynard AI/ML framework.
 */
export type AsyncResult<T, E = Error> = Promise<{
    success: true;
    data: T;
} | {
    success: false;
    error: E;
}>;
export type ProgressCallback = (progress: number, message?: string) => void;
export type ShutdownCallback = () => Promise<void>;
export type InitializationCallback = () => Promise<void>;
