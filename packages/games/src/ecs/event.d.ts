import { Event, EventReader, EventWriter } from "./types";
/**
 * Event instance with metadata.
 */
export interface EventInstance<T = unknown> {
    readonly event: T;
    readonly id: number;
    readonly timestamp: number;
}
/**
 * Event ID for tracking specific events.
 */
export interface EventId {
    readonly id: number;
}
/**
 * Creates an event ID.
 */
export declare function createEventId(id: number): EventId;
/**
 * Event collection for managing events of a specific type.
 */
export declare class Events<T = unknown> {
    private events;
    private nextId;
    /**
     * Sends an event.
     */
    send(event: T): EventId;
    /**
     * Sends multiple events.
     */
    sendBatch(events: T[]): EventId[];
    /**
     * Gets an event by ID.
     */
    getEvent(id: number): [T, EventId] | undefined;
    /**
     * Gets all events.
     */
    getAllEvents(): EventInstance<T>[];
    /**
     * Clears all events.
     */
    clear(): void;
    /**
     * Drains all events and returns them.
     */
    drain(): T[];
    /**
     * Gets the number of events.
     */
    getEventCount(): number;
}
/**
 * Event reader implementation.
 */
export declare class EventReaderImpl<T = unknown> implements EventReader<T> {
    private events;
    private lastReadIndex;
    constructor(events: Events<T>);
    /**
     * Reads new events since last read.
     */
    read(): Event<T>[];
    /**
     * Clears the reader state.
     */
    clear(): void;
}
/**
 * Event writer implementation.
 */
export declare class EventWriterImpl<T = unknown> implements EventWriter<T> {
    private events;
    constructor(events: Events<T>);
    /**
     * Sends an event.
     */
    send(event: T): void;
    /**
     * Sends multiple events.
     */
    sendBatch(events: T[]): void;
}
/**
 * Event registry for managing event types.
 */
export declare class EventRegistry {
    private events;
    /**
     * Gets or creates an event collection for a type.
     */
    getOrCreateEvents<T>(eventType: string): Events<T>;
    /**
     * Gets an event collection for a type.
     */
    getEvents<T>(eventType: string): Events<T> | undefined;
    /**
     * Creates an event reader for a type.
     */
    createReader<T>(eventType: string): EventReader<T>;
    /**
     * Creates an event writer for a type.
     */
    createWriter<T>(eventType: string): EventWriter<T>;
    /**
     * Clears all events.
     */
    clear(): void;
}
