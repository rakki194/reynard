// Event system for decoupled communication
/**
 * Creates an event ID.
 */
export function createEventId(id) {
    return { id };
}
/**
 * Event collection for managing events of a specific type.
 */
export class Events {
    constructor() {
        Object.defineProperty(this, "events", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "nextId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
    }
    /**
     * Sends an event.
     */
    send(event) {
        const id = this.nextId++;
        const instance = {
            event,
            id,
            timestamp: Date.now(),
        };
        this.events.push(instance);
        return createEventId(id);
    }
    /**
     * Sends multiple events.
     */
    sendBatch(events) {
        return events.map((event) => this.send(event));
    }
    /**
     * Gets an event by ID.
     */
    getEvent(id) {
        const instance = this.events.find((e) => e.id === id);
        return instance ? [instance.event, createEventId(instance.id)] : undefined;
    }
    /**
     * Gets all events.
     */
    getAllEvents() {
        return [...this.events];
    }
    /**
     * Clears all events.
     */
    clear() {
        this.events.length = 0;
    }
    /**
     * Drains all events and returns them.
     */
    drain() {
        const events = this.events.map((instance) => instance.event);
        this.events.length = 0;
        return events;
    }
    /**
     * Gets the number of events.
     */
    getEventCount() {
        return this.events.length;
    }
}
/**
 * Event reader implementation.
 */
export class EventReaderImpl {
    constructor(events) {
        Object.defineProperty(this, "events", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: events
        });
        Object.defineProperty(this, "lastReadIndex", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
    }
    /**
     * Reads new events since last read.
     */
    read() {
        const allEvents = this.events.getAllEvents();
        const newEvents = allEvents.slice(this.lastReadIndex);
        this.lastReadIndex = allEvents.length;
        return newEvents.map((instance) => ({
            data: instance.event,
            timestamp: instance.timestamp,
        }));
    }
    /**
     * Clears the reader state.
     */
    clear() {
        this.lastReadIndex = 0;
    }
}
/**
 * Event writer implementation.
 */
export class EventWriterImpl {
    constructor(events) {
        Object.defineProperty(this, "events", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: events
        });
    }
    /**
     * Sends an event.
     */
    send(event) {
        this.events.send(event);
    }
    /**
     * Sends multiple events.
     */
    sendBatch(events) {
        this.events.sendBatch(events);
    }
}
/**
 * Event registry for managing event types.
 */
export class EventRegistry {
    constructor() {
        Object.defineProperty(this, "events", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
    }
    /**
     * Gets or creates an event collection for a type.
     */
    getOrCreateEvents(eventType) {
        if (!this.events.has(eventType)) {
            this.events.set(eventType, new Events());
        }
        return this.events.get(eventType);
    }
    /**
     * Gets an event collection for a type.
     */
    getEvents(eventType) {
        return this.events.get(eventType);
    }
    /**
     * Creates an event reader for a type.
     */
    createReader(eventType) {
        const events = this.getOrCreateEvents(eventType);
        return new EventReaderImpl(events);
    }
    /**
     * Creates an event writer for a type.
     */
    createWriter(eventType) {
        const events = this.getOrCreateEvents(eventType);
        return new EventWriterImpl(events);
    }
    /**
     * Clears all events.
     */
    clear() {
        for (const events of this.events.values()) {
            events.clear();
        }
    }
}
