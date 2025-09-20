/**
 * EventLog Component
 * Displays real-time event log for the annotation system
 */

import { Component, For } from "solid-js";
import { Card } from "reynard-components";
import type { AnyAnnotationEvent } from "reynard-annotating-core";

interface EventLogProps {
  events: AnyAnnotationEvent[];
}

export const EventLog: Component<EventLogProps> = props => {
  const getEventIcon = (eventType: string) => {
    if (eventType.includes("model_")) return "🤖";
    if (eventType.includes("caption_")) return "📝";
    if (eventType.includes("batch_")) return "📦";
    return "📋";
  };

  const getEventColor = (eventType: string) => {
    if (eventType.includes("error") || eventType.includes("failed")) return "error";
    if (eventType.includes("completed") || eventType.includes("success")) return "success";
    if (eventType.includes("started") || eventType.includes("loading")) return "info";
    return "default";
  };

  return (
    <div class="event-log">
      <Card class="event-log-header" padding="lg">
        <h3>Real-time Event Log</h3>
        <p>Monitor system events as they happen</p>
      </Card>

      <div class="events-list">
        {props.events.length > 0 ? (
          <For each={props.events}>
            {(event, index) => (
              <Card class={`event-item ${getEventColor(event.type)}`} padding="md">
                <div class="event-header">
                  <div class="event-icon">{getEventIcon(event.type)}</div>
                  <div class="event-info">
                    <h4 class="event-type">{event.type}</h4>
                    <span class="event-time">{new Date(event.timestamp).toLocaleString()}</span>
                  </div>
                </div>

                <div class="event-data">
                  <pre>{JSON.stringify(event.data, null, 2)}</pre>
                </div>
              </Card>
            )}
          </For>
        ) : (
          <Card class="empty-events" padding="xl">
            <div class="empty-content">
              <div class="empty-icon">📋</div>
              <h3>No Events Yet</h3>
              <p>Start generating captions to see real-time events!</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
