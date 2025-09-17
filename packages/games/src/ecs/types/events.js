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
export {};
