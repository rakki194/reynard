/**
 * Alarm Component
 * Main alarm management component that orchestrates smaller modules
 */

import { Component } from "solid-js";
import { Card } from "reynard-components";
import { useAlarms } from "../composables/useAlarms";
import { AlarmForm } from "./AlarmForm";
import { AlarmList } from "./AlarmList";

export const Alarm: Component = () => {
  const { alarms, currentTime, addAlarm, deleteAlarm, toggleAlarm } =
    useAlarms();

  return (
    <div class="alarm-container">
      <Card class="alarm-card">
        <h2 class="alarm-current-time">Current Time: {currentTime()}</h2>

        <AlarmForm onAddAlarm={addAlarm} />
        <AlarmList
          alarms={alarms()}
          onToggleAlarm={toggleAlarm}
          onDeleteAlarm={deleteAlarm}
        />
      </Card>
    </div>
  );
};
