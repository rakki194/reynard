/**
 * Alarm Types
 * Type definitions for alarm functionality
 */

export interface Alarm {
  id: string;
  time: string;
  label: string;
  enabled: boolean;
}

export interface AlarmFormData {
  time: string;
  label: string;
}

export interface AlarmStorage {
  save: (alarms: Alarm[]) => void;
  load: () => Alarm[];
}
