/**
 * Alarm Storage Utility
 * Handles persistence of alarm data to localStorage
 */

import type { Alarm, AlarmStorage } from "../types/alarm";

const STORAGE_KEY = "reynard-alarms";

export const createAlarmStorage = (): AlarmStorage => {
  const save = (alarms: Alarm[]): void => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(alarms));
    } catch (error) {
      console.error("Failed to save alarms:", error);
    }
  };

  const load = (): Alarm[] => {
    try {
      const savedAlarms = localStorage.getItem(STORAGE_KEY);
      return savedAlarms ? JSON.parse(savedAlarms) : [];
    } catch (error) {
      console.error("Failed to load alarms:", error);
      return [];
    }
  };

  return { save, load };
};
