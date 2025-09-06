/**
 * Timer Component
 * Countdown timer with start, pause, stop, and reset functionality
 */

import { Component, createSignal, onMount, onCleanup, Show } from "solid-js";
import { useNotifications } from "reynard-core";
import { Button, Card } from "reynard-components";

type TimerState = "stopped" | "running" | "paused";

interface TimerTime {
  hours: number;
  minutes: number;
  seconds: number;
}

export const Timer: Component = () => {
  const [time, setTime] = createSignal<TimerTime>({ hours: 0, minutes: 0, seconds: 0 });
  const [inputTime, setInputTime] = createSignal<TimerTime>({ hours: 0, minutes: 5, seconds: 0 });
  const [state, setState] = createSignal<TimerState>("stopped");
  const [originalTime, setOriginalTime] = createSignal<TimerTime>({ hours: 0, minutes: 5, seconds: 0 });
  
  const { notify } = useNotifications();
  
  let intervalId: NodeJS.Timeout;

  const formatTime = (time: TimerTime) => {
    const { hours, minutes, seconds } = time;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const timeToSeconds = (time: TimerTime) => {
    return time.hours * 3600 + time.minutes * 60 + time.seconds;
  };

  const secondsToTime = (totalSeconds: number): TimerTime => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return { hours, minutes, seconds };
  };

  const startTimer = () => {
    if (state() === "stopped") {
      setTime(inputTime());
      setOriginalTime(inputTime());
    }
    setState("running");
    notify("Timer started", "info");
  };

  const pauseTimer = () => {
    setState("paused");
    notify("Timer paused", "warning");
  };

  const stopTimer = () => {
    setState("stopped");
    setTime(originalTime());
    notify("Timer stopped", "info");
  };

  const resetTimer = () => {
    setState("stopped");
    setTime(inputTime());
    setOriginalTime(inputTime());
    notify("Timer reset", "info");
  };

  const updateTimer = () => {
    setTime((currentTime) => {
      const totalSeconds = timeToSeconds(currentTime);
      if (totalSeconds <= 1) {
        setState("stopped");
        setTime({ hours: 0, minutes: 0, seconds: 0 });
        notify("Timer finished!", "success");
        return { hours: 0, minutes: 0, seconds: 0 };
      }
      return secondsToTime(totalSeconds - 1);
    });
  };

  onMount(() => {
    intervalId = setInterval(() => {
      if (state() === "running") {
        updateTimer();
      }
    }, 1000);
  });

  onCleanup(() => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  });

  const handleInputChange = (field: keyof TimerTime, value: string) => {
    const numValue = Math.max(0, parseInt(value) || 0);
    setInputTime(prev => ({ ...prev, [field]: numValue }));
  };

  const getStatusText = () => {
    switch (state()) {
      case "running":
        return "Timer is running...";
      case "paused":
        return "Timer is paused";
      case "stopped":
        return "Timer is stopped";
      default:
        return "";
    }
  };

  const isTimeZero = () => {
    const current = time();
    return current.hours === 0 && current.minutes === 0 && current.seconds === 0;
  };

  return (
    <div class="timer-container">
      <Card class="timer-card">
        <div class="timer-display">
          {formatTime(time())}
        </div>
        
        <div class={`timer-status ${state()}`}>
          {getStatusText()}
        </div>

        <div class="timer-inputs">
          <div class="time-input">
            <label>Hours</label>
            <input
              type="number"
              min="0"
              max="23"
              value={inputTime().hours}
              onInput={(e) => handleInputChange("hours", e.currentTarget.value)}
              disabled={state() === "running"}
              title="Hours (0-23)"
            />
          </div>
          <div class="time-input">
            <label>Minutes</label>
            <input
              type="number"
              min="0"
              max="59"
              value={inputTime().minutes}
              onInput={(e) => handleInputChange("minutes", e.currentTarget.value)}
              disabled={state() === "running"}
              title="Minutes (0-59)"
            />
          </div>
          <div class="time-input">
            <label>Seconds</label>
            <input
              type="number"
              min="0"
              max="59"
              value={inputTime().seconds}
              onInput={(e) => handleInputChange("seconds", e.currentTarget.value)}
              disabled={state() === "running"}
              title="Seconds (0-59)"
            />
          </div>
        </div>

        <div class="timer-controls">
          <Show when={state() === "stopped"}>
            <Button
              onClick={startTimer}
              class="btn btn-success"
              disabled={isTimeZero()}
            >
              ▶️ Start
            </Button>
          </Show>
          
          <Show when={state() === "running"}>
            <Button
              onClick={pauseTimer}
              class="btn btn-warning"
            >
              ⏸️ Pause
            </Button>
            <Button
              onClick={stopTimer}
              class="btn btn-danger"
            >
              ⏹️ Stop
            </Button>
          </Show>
          
          <Show when={state() === "paused"}>
            <Button
              onClick={startTimer}
              class="btn btn-success"
            >
              ▶️ Resume
            </Button>
            <Button
              onClick={stopTimer}
              class="btn btn-danger"
            >
              ⏹️ Stop
            </Button>
          </Show>
          
          <Button
            onClick={resetTimer}
            class="btn btn-secondary"
            disabled={state() === "running"}
          >
            🔄 Reset
          </Button>
        </div>
      </Card>
    </div>
  );
};
