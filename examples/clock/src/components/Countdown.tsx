/**
 * Countdown Component
 * Countdown timer to a specific date and time
 */

import { Component, createSignal, onMount, onCleanup, Show } from "solid-js";
import { useNotifications } from "reynard-core";
import { Button, Card } from "reynard-components";

interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface CountdownTarget {
  date: string;
  time: string;
  label: string;
}

export const Countdown: Component = () => {
  const [countdown, setCountdown] = createSignal<CountdownTime>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [target, setTarget] = createSignal<CountdownTarget>({
    date: "",
    time: "00:00",
    label: "Event"
  });
  const [isActive, setIsActive] = createSignal(false);
  const [isCompleted, setIsCompleted] = createSignal(false);
  
  const { notify } = useNotifications();
  
  let intervalId: NodeJS.Timeout;

  const updateCountdown = () => {
    const targetDate = new Date(`${target().date}T${target().time}`);
    const now = new Date();
    const difference = targetDate.getTime() - now.getTime();

    if (difference <= 0) {
      setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      setIsActive(false);
      setIsCompleted(true);
      notify(`Countdown completed: ${target().label}!`, "success");
      return;
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    setCountdown({ days, hours, minutes, seconds });
  };

  onMount(() => {
    // Set default target to tomorrow at midnight
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    setTarget({
      date: tomorrow.toISOString().split('T')[0],
      time: "00:00",
      label: "New Day"
    });
  });

  onCleanup(() => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  });

  const startCountdown = () => {
    if (!target().date || !target().time) {
      notify("Please set a target date and time", "warning");
      return;
    }

    const targetDate = new Date(`${target().date}T${target().time}`);
    const now = new Date();
    
    if (targetDate <= now) {
      notify("Target date must be in the future", "warning");
      return;
    }

    setIsActive(true);
    setIsCompleted(false);
    updateCountdown();
    
    intervalId = setInterval(updateCountdown, 1000);
    notify(`Countdown started for ${target().label}`, "info");
  };

  const stopCountdown = () => {
    setIsActive(false);
    if (intervalId) {
      clearInterval(intervalId);
    }
    notify("Countdown stopped", "info");
  };

  const resetCountdown = () => {
    setIsActive(false);
    setIsCompleted(false);
    setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    if (intervalId) {
      clearInterval(intervalId);
    }
    notify("Countdown reset", "info");
  };

  const handleDateChange = (value: string) => {
    setTarget(prev => ({ ...prev, date: value }));
  };

  const handleTimeChange = (value: string) => {
    setTarget(prev => ({ ...prev, time: value }));
  };

  const handleLabelChange = (value: string) => {
    setTarget(prev => ({ ...prev, label: value }));
  };

  const getStatusText = () => {
    if (isCompleted()) return "Countdown completed!";
    if (isActive()) return "Countdown is running...";
    return "Countdown is stopped";
  };

  const formatTargetDate = () => {
    if (!target().date) return "";
    const date = new Date(`${target().date}T${target().time}`);
    return date.toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div class="countdown-container">
      <Card class="countdown-card">
        <h2 class="countdown-title">
          {target().label}
        </h2>
        
        <div class="countdown-target-date">
          {formatTargetDate()}
        </div>

        <div class={`countdown-status ${isActive() ? "active" : isCompleted() ? "completed" : ""}`}>
          {getStatusText()}
        </div>

        <div class="countdown-display">
          <div class="countdown-unit">
            <div class="countdown-value">{countdown().days}</div>
            <div class="countdown-label">Days</div>
          </div>
          <div class="countdown-unit">
            <div class="countdown-value">{countdown().hours}</div>
            <div class="countdown-label">Hours</div>
          </div>
          <div class="countdown-unit">
            <div class="countdown-value">{countdown().minutes}</div>
            <div class="countdown-label">Minutes</div>
          </div>
          <div class="countdown-unit">
            <div class="countdown-value">{countdown().seconds}</div>
            <div class="countdown-label">Seconds</div>
          </div>
        </div>

        <div class="countdown-form">
          <h3>Set Countdown Target</h3>
          
          <div class="form-group">
            <label>Event Label</label>
            <input
              type="text"
              placeholder="Birthday, Holiday, Deadline..."
              value={target().label}
              onInput={(e) => handleLabelChange(e.currentTarget.value)}
            />
          </div>
          
          <div class="form-group">
            <label>Target Date</label>
            <input
              type="date"
              value={target().date}
              onInput={(e) => handleDateChange(e.currentTarget.value)}
              title="Select target date"
            />
          </div>
          
          <div class="form-group">
            <label>Target Time</label>
            <input
              type="time"
              value={target().time}
              onInput={(e) => handleTimeChange(e.currentTarget.value)}
              title="Select target time"
            />
          </div>
          
          <div class="countdown-controls">
            <Show when={!isActive()}>
              <Button
                onClick={startCountdown}
                class="btn btn-success countdown-control-button"
              >
                ▶️ Start Countdown
              </Button>
            </Show>
            
            <Show when={isActive()}>
              <Button
                onClick={stopCountdown}
                class="btn btn-danger countdown-control-button"
              >
                ⏹️ Stop
              </Button>
            </Show>
            
            <Button
              onClick={resetCountdown}
              class="btn btn-secondary countdown-control-button"
            >
              🔄 Reset
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
