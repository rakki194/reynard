// Event system for decoupled communication

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
export function createEventId(id: number): EventId {
  return { id };
}

/**
 * Event collection for managing events of a specific type.
 */
export class Events<T = unknown> {
  private events: EventInstance<T>[] = [];
  private nextId: number = 0;

  /**
   * Sends an event.
   */
  send(event: T): EventId {
    const id = this.nextId++;
    const instance: EventInstance<T> = {
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
  sendBatch(events: T[]): EventId[] {
    return events.map(event => this.send(event));
  }

  /**
   * Gets an event by ID.
   */
  getEvent(id: number): [T, EventId] | undefined {
    const instance = this.events.find(e => e.id === id);
    return instance ? [instance.event, createEventId(instance.id)] : undefined;
  }

  /**
   * Gets all events.
   */
  getAllEvents(): EventInstance<T>[] {
    return [...this.events];
  }

  /**
   * Clears all events.
   */
  clear(): void {
    this.events.length = 0;
  }

  /**
   * Drains all events and returns them.
   */
  drain(): T[] {
    const events = this.events.map(instance => instance.event);
    this.events.length = 0;
    return events;
  }

  /**
   * Gets the number of events.
   */
  getEventCount(): number {
    return this.events.length;
  }
}

/**
 * Event reader implementation.
 */
export class EventReaderImpl<T = unknown> implements EventReader<T> {
  private lastReadIndex: number = 0;

  constructor(private events: Events<T>) {}

  /**
   * Reads new events since last read.
   */
  read(): Event<T>[] {
    const allEvents = this.events.getAllEvents();
    const newEvents = allEvents.slice(this.lastReadIndex);
    this.lastReadIndex = allEvents.length;

    return newEvents.map(instance => ({
      data: instance.event,
      timestamp: instance.timestamp,
    }));
  }

  /**
   * Clears the reader state.
   */
  clear(): void {
    this.lastReadIndex = 0;
  }
}

/**
 * Event writer implementation.
 */
export class EventWriterImpl<T = unknown> implements EventWriter<T> {
  constructor(private events: Events<T>) {}

  /**
   * Sends an event.
   */
  send(event: T): void {
    this.events.send(event);
  }

  /**
   * Sends multiple events.
   */
  sendBatch(events: T[]): void {
    this.events.sendBatch(events);
  }
}

/**
 * Event registry for managing event types.
 */
export class EventRegistry {
  private events: Map<string, Events<unknown>> = new Map();

  /**
   * Gets or creates an event collection for a type.
   */
  getOrCreateEvents<T>(eventType: string): Events<T> {
    if (!this.events.has(eventType)) {
      this.events.set(eventType, new Events<T>());
    }
    return this.events.get(eventType) as Events<T>;
  }

  /**
   * Gets an event collection for a type.
   */
  getEvents<T>(eventType: string): Events<T> | undefined {
    return this.events.get(eventType) as Events<T> | undefined;
  }

  /**
   * Creates an event reader for a type.
   */
  createReader<T>(eventType: string): EventReader<T> {
    const events = this.getOrCreateEvents<T>(eventType);
    return new EventReaderImpl(events);
  }

  /**
   * Creates an event writer for a type.
   */
  createWriter<T>(eventType: string): EventWriter<T> {
    const events = this.getOrCreateEvents<T>(eventType);
    return new EventWriterImpl(events);
  }

  /**
   * Clears all events.
   */
  clear(): void {
    for (const events of this.events.values()) {
      events.clear();
    }
  }
}
