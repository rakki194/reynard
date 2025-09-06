/**
 * Alarm Component
 * Alarm management with time picker and notifications
 */

import { Component, createSignal, onMount, onCleanup, Show, For } from "solid-js";
import { useNotifications } from "reynard-core";
import { Button, Card } from "reynard-components";

interface Alarm {
  id: string;
  time: string;
  label: string;
  enabled: boolean;
}

export const Alarm: Component = () => {
  const [alarms, setAlarms] = createSignal<Alarm[]>([]);
  const [newAlarmTime, setNewAlarmTime] = createSignal("07:00");
  const [newAlarmLabel, setNewAlarmLabel] = createSignal("");
  const [currentTime, setCurrentTime] = createSignal("");
  
  const { notify } = useNotifications();
  
  let intervalId: NodeJS.Timeout;

  const updateCurrentTime = () => {
    const now = new Date();
    setCurrentTime(now.toTimeString().slice(0, 5));
    
    // Check for alarms
    const currentTimeStr = now.toTimeString().slice(0, 5);
    const enabledAlarms = alarms().filter(alarm => alarm.enabled);
    
    enabledAlarms.forEach(alarm => {
      if (alarm.time === currentTimeStr) {
        notify(`Alarm: ${alarm.label || "Wake up!"}`, "warning");
        // Disable alarm after triggering (optional)
        // toggleAlarm(alarm.id);
      }
    });
  };

  onMount(() => {
    updateCurrentTime();
    intervalId = setInterval(updateCurrentTime, 1000);
    
    // Load saved alarms from localStorage
    const savedAlarms = localStorage.getItem("reynard-alarms");
    if (savedAlarms) {
      try {
        setAlarms(JSON.parse(savedAlarms));
      } catch (error) {
        console.error("Failed to load alarms:", error);
      }
    }
  });

  onCleanup(() => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  });

  const saveAlarms = (alarmList: Alarm[]) => {
    localStorage.setItem("reynard-alarms", JSON.stringify(alarmList));
  };

  const addAlarm = () => {
    if (!newAlarmTime()) return;
    
    const newAlarm: Alarm = {
      id: Date.now().toString(),
      time: newAlarmTime(),
      label: newAlarmLabel() || "Alarm",
      enabled: true,
    };
    
    const updatedAlarms = [...alarms(), newAlarm].sort((a, b) => a.time.localeCompare(b.time));
    setAlarms(updatedAlarms);
    saveAlarms(updatedAlarms);
    
    setNewAlarmTime("07:00");
    setNewAlarmLabel("");
    notify(`Alarm added for ${newAlarm.time}`, "success");
  };

  const deleteAlarm = (id: string) => {
    const updatedAlarms = alarms().filter(alarm => alarm.id !== id);
    setAlarms(updatedAlarms);
    saveAlarms(updatedAlarms);
    notify("Alarm deleted", "info");
  };

  const toggleAlarm = (id: string) => {
    const updatedAlarms = alarms().map(alarm =>
      alarm.id === id ? { ...alarm, enabled: !alarm.enabled } : alarm
    );
    setAlarms(updatedAlarms);
    saveAlarms(updatedAlarms);
    
    const alarm = alarms().find(a => a.id === id);
    if (alarm) {
      notify(`Alarm ${alarm.enabled ? "disabled" : "enabled"}`, "info");
    }
  };

  const formatAlarmTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div class="alarm-container">
      <Card class="alarm-card">
        <h2 class="alarm-current-time">
          Current Time: {currentTime()}
        </h2>

        <div class="alarm-form">
          <h3>Add New Alarm</h3>
          
          <div class="form-group">
            <label>Time</label>
            <input
              type="time"
              value={newAlarmTime()}
              onInput={(e) => setNewAlarmTime(e.currentTarget.value)}
              title="Select alarm time"
            />
          </div>
          
          <div class="form-group">
            <label>Label (optional)</label>
            <input
              type="text"
              placeholder="Wake up, Meeting, etc."
              value={newAlarmLabel()}
              onInput={(e) => setNewAlarmLabel(e.currentTarget.value)}
            />
          </div>
          
          <Button
            onClick={addAlarm}
            class="btn btn-primary btn-full-width"
          >
            ➕ Add Alarm
          </Button>
        </div>

        <div class="alarm-list">
          <h3 class="alarm-list-title">
            Active Alarms ({alarms().filter(a => a.enabled).length})
          </h3>
          
          <Show when={alarms().length === 0}>
            <div class="alarm-empty-state">
              No alarms set. Add one above to get started!
            </div>
          </Show>
          
          <For each={alarms()}>
            {(alarm) => (
              <div class="alarm-item">
                <div>
                  <div class="alarm-time">
                    {formatAlarmTime(alarm.time)}
                  </div>
                  <div class="alarm-label">
                    {alarm.label}
                  </div>
                </div>
                
                <div class="alarm-controls">
                  <Button
                    onClick={() => toggleAlarm(alarm.id)}
                    class={`btn ${alarm.enabled ? "btn-warning" : "btn-secondary"} btn-small`}
                  >
                    {alarm.enabled ? "🔔" : "🔕"}
                  </Button>
                  <Button
                    onClick={() => deleteAlarm(alarm.id)}
                    class="btn btn-danger btn-small"
                  >
                    🗑️
                  </Button>
                </div>
              </div>
            )}
          </For>
        </div>
      </Card>
    </div>
  );
};
