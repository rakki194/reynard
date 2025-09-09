/**
 * @fileoverview Event system types for decoupled communication.
 *
 * Events provide a way for systems to communicate without direct coupling.
 * They are perfect for handling user input, game events, and system-to-system
 * communication in a clean, decoupled manner.
 *
 * @example
 * ```typescript
 * interface PlayerDiedEvent {
 *   playerId: string;
 *   cause: string;
 *   timestamp: number;
 * }
 *
 * // Send an event
 * const eventWriter = world.getEventWriter<PlayerDiedEvent>('player_died');
 * eventWriter.send({
 *   playerId: 'player1',
 *   cause: 'collision',
 *   timestamp: Date.now()
 * });
 *
 * // Read events
 * const eventReader = world.getEventReader<PlayerDiedEvent>('player_died');
 * const events = eventReader.read();
 * events.forEach(event => {
 *   console.log(`Player ${event.data.playerId} died from ${event.data.cause}`);
 * });
 * ```
 *
 * @performance Events are stored in efficient queues, automatic cleanup of old events
 * @author Reynard ECS Team
 * @since 1.0.0
 */

/**
 * Event system for decoupled communication between systems.
 *
 * Events provide a way for systems to communicate without direct coupling.
 * They are perfect for handling user input, game events, and system-to-system
 * communication in a clean, decoupled manner.
 *
 * @template T The type of data carried by the event
 *
 * @example
 * ```typescript
 * interface PlayerDiedEvent {
 *   playerId: string;
 *   cause: string;
 *   timestamp: number;
 * }
 *
 * // Send an event
 * const eventWriter = world.getEventWriter<PlayerDiedEvent>('player_died');
 * eventWriter.send({
 *   playerId: 'player1',
 *   cause: 'collision',
 *   timestamp: Date.now()
 * });
 *
 * // Read events
 * const eventReader = world.getEventReader<PlayerDiedEvent>('player_died');
 * const events = eventReader.read();
 * events.forEach(event => {
 *   console.log(`Player ${event.data.playerId} died from ${event.data.cause}`);
 * });
 * ```
 *
 * @performance
 * - Events are stored in efficient queues
 * - Automatic cleanup of old events
 * - Zero-copy event reading where possible
 *
 * @since 1.0.0
 */
export interface Event<T = unknown> {
  /** The event data */
  readonly data: T;
  /** Timestamp when the event was created */
  readonly timestamp: number;
}

/**
 * Event reader for consuming events of a specific type.
 *
 * Event readers provide a way to consume events without affecting other
 * readers. They maintain their own read position and can be cleared
 * independently.
 *
 * @template T The type of event data
 *
 * @since 1.0.0
 */
export interface EventReader<T = unknown> {
  /**
   * Reads all new events since the last read.
   * @returns Array of new events
   */
  read(): Event<T>[];

  /**
   * Clears the reader's position, causing the next read to return all events.
   */
  clear(): void;
}

/**
 * Event writer for sending events of a specific type.
 *
 * Event writers provide a way to send events that will be consumed
 * by event readers. They support both single events and batch sending.
 *
 * @template T The type of event data
 *
 * @since 1.0.0
 */
export interface EventWriter<T = unknown> {
  /**
   * Sends a single event.
   * @param event The event data to send
   */
  send(event: T): void;

  /**
   * Sends multiple events in a batch.
   * @param events Array of event data to send
   */
  sendBatch(events: T[]): void;
}
