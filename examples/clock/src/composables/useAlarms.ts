/**
 * useAlarms Composable
 * Composable for alarm management logic
 */

import { createSignal, onMount } from "solid-js";
import { useNotifications } from "reynard-core";
import type { Alarm } from "../types/alarm";
import { createAlarmStorage } from "../utils/alarmStorage";
import { useTimeManager } from "./useTimeManager";

export const useAlarms = () => {
  const [alarms, setAlarms] = createSignal<Alarm[]>([]);
  const { notify } = useNotifications();
  const storage = createAlarmStorage();
  const { currentTime } = useTimeManager(alarms);

  const addAlarm = (time: string, label: string): void => {
    if (!time) return;

    const newAlarm: Alarm = {
      id: Date.now().toString(),
      time,
      label: label || "Alarm",
      enabled: true,
    };

    const updatedAlarms = [...alarms(), newAlarm].sort((a, b) => a.time.localeCompare(b.time));
    setAlarms(updatedAlarms);
    storage.save(updatedAlarms);
    notify(`Alarm added for ${newAlarm.time}`, "success");
  };

  const deleteAlarm = (id: string): void => {
    const updatedAlarms = alarms().filter(alarm => alarm.id !== id);
    setAlarms(updatedAlarms);
    storage.save(updatedAlarms);
    notify("Alarm deleted", "info");
  };

  const toggleAlarm = (id: string): void => {
    const updatedAlarms = alarms().map(alarm => (alarm.id === id ? { ...alarm, enabled: !alarm.enabled } : alarm));
    setAlarms(updatedAlarms);
    storage.save(updatedAlarms);

    const alarm = alarms().find(a => a.id === id);
    if (alarm) {
      notify(`Alarm ${alarm.enabled ? "disabled" : "enabled"}`, "info");
    }
  };

  onMount(() => {
    setAlarms(storage.load());
  });

  return {
    alarms,
    currentTime,
    addAlarm,
    deleteAlarm,
    toggleAlarm,
  };
};
