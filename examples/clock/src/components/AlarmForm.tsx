/**
 * AlarmForm Component
 * Form for adding new alarms
 */

import { Component, createSignal } from "solid-js";
import { Button } from "reynard-components";

interface AlarmFormProps {
  onAddAlarm: (time: string, label: string) => void;
}

export const AlarmForm: Component<AlarmFormProps> = props => {
  const [newAlarmTime, setNewAlarmTime] = createSignal("07:00");
  const [newAlarmLabel, setNewAlarmLabel] = createSignal("");

  const handleSubmit = (): void => {
    props.onAddAlarm(newAlarmTime(), newAlarmLabel());
    setNewAlarmTime("07:00");
    setNewAlarmLabel("");
  };

  return (
    <div class="alarm-form">
      <h3>Add New Alarm</h3>

      <div class="form-group">
        <label>Time</label>
        <input
          type="time"
          value={newAlarmTime()}
          onInput={e => setNewAlarmTime(e.currentTarget.value)}
          title="Select alarm time"
        />
      </div>

      <div class="form-group">
        <label>Label (optional)</label>
        <input
          type="text"
          placeholder="Wake up, Meeting, etc."
          value={newAlarmLabel()}
          onInput={e => setNewAlarmLabel(e.currentTarget.value)}
        />
      </div>

      <Button onClick={handleSubmit} class="btn btn-primary btn-full-width">
        ➕ Add Alarm
      </Button>
    </div>
  );
};
