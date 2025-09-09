/**
 * AlarmList Component
 * Displays list of alarms with controls
 */

import { Component, For, Show } from "solid-js";
import { Button } from "reynard-components";
import type { Alarm } from "../types/alarm";

interface AlarmListProps {
  alarms: Alarm[];
  onToggleAlarm: (id: string) => void;
  onDeleteAlarm: (id: string) => void;
}

export const AlarmList: Component<AlarmListProps> = (props) => {
  const formatAlarmTime = (time: string): string => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div class="alarm-list">
      <h3 class="alarm-list-title">
        Active Alarms ({props.alarms.filter((a) => a.enabled).length})
      </h3>

      <Show when={props.alarms.length === 0}>
        <div class="alarm-empty-state">
          No alarms set. Add one above to get started!
        </div>
      </Show>

      <For each={props.alarms}>
        {(alarm) => (
          <div class="alarm-item">
            <div>
              <div class="alarm-time">{formatAlarmTime(alarm.time)}</div>
              <div class="alarm-label">{alarm.label}</div>
            </div>

            <div class="alarm-controls">
              <Button
                onClick={() => props.onToggleAlarm(alarm.id)}
                class={`btn ${alarm.enabled ? "btn-warning" : "btn-secondary"} btn-small`}
              >
                {alarm.enabled ? "🔔" : "🔕"}
              </Button>
              <Button
                onClick={() => props.onDeleteAlarm(alarm.id)}
                class="btn btn-danger btn-small"
              >
                🗑️
              </Button>
            </div>
          </div>
        )}
      </For>
    </div>
  );
};
