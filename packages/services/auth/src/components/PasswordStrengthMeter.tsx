/**
 * Password Strength Meter Component
 * Visual password strength indicator with detailed feedback
 */

import { Component, Show, For, createMemo } from "solid-js";
import { usePasswordStrength } from "../composables/usePasswordStrength";
import type { UsePasswordStrengthOptions } from "../composables/usePasswordStrength";
// import "./PasswordStrengthMeter.css";

export interface PasswordStrengthMeterProps extends UsePasswordStrengthOptions {
  /** Password to analyze */
  password: string;
  /** Whether to show detailed requirements */
  showRequirements?: boolean;
  /** Whether to show suggestions */
  showSuggestions?: boolean;
  /** Whether to show crack time estimate */
  showCrackTime?: boolean;
  /** Compact mode (less visual elements) */
  compact?: boolean;
  /** Custom class name */
  class?: string;
}

export const PasswordStrengthMeter: Component<PasswordStrengthMeterProps> = props => {
  const passwordSignal = () => props.password;

  const { strength, strengthLabel, strengthProgress, isAcceptable, feedback, requirements, requirementsSummary } =
    usePasswordStrength(passwordSignal, props);

  // Don't show anything if no password
  const shouldShow = createMemo(() => props.password && props.password.length > 0);

  // Get strength bar classes
  const getStrengthBarClasses = () => {
    const classes = ["password-strength-meter__bar"];

    if (strength().score >= 4) classes.push("password-strength-meter__bar--excellent");
    else if (strength().score >= 3) classes.push("password-strength-meter__bar--good");
    else if (strength().score >= 2) classes.push("password-strength-meter__bar--fair");
    else if (strength().score >= 1) classes.push("password-strength-meter__bar--weak");
    else classes.push("password-strength-meter__bar--very-weak");

    return classes.join(" ");
  };

  // Get container classes
  const getContainerClasses = () => {
    const classes = ["password-strength-meter"];

    if (props.compact) classes.push("password-strength-meter--compact");
    if (props.class) classes.push(props.class);

    return classes.join(" ");
  };

  return (
    <Show when={shouldShow()}>
      <div class={getContainerClasses()}>
        {/* Strength Bar */}
        <div class="password-strength-meter__progress">
          <div
            class={`${getStrengthBarClasses()} password-strength-meter__bar--width-${Math.floor(strengthProgress() / 20) * 20}`}
          />
        </div>

        {/* Strength Label and Feedback */}
        <Show when={!props.compact}>
          <div class="password-strength-meter__feedback">
            <div class="password-strength-meter__strength">
              <span
                class={`password-strength-meter__label password-strength-meter__label--${strength().score >= 4 ? "excellent" : strength().score >= 3 ? "good" : strength().score >= 2 ? "fair" : strength().score >= 1 ? "weak" : "very-weak"}`}
              >
                {strengthLabel()}
              </span>

              <Show when={props.showCrackTime && strength().crackTime}>
                <span class="password-strength-meter__crack-time">Time to crack: {strength().crackTime}</span>
              </Show>
            </div>

            <Show when={feedback()}>
              <div class="password-strength-meter__message">{feedback()}</div>
            </Show>
          </div>
        </Show>

        {/* Requirements Checklist */}
        <Show when={props.showRequirements && !props.compact}>
          <div class="password-strength-meter__requirements">
            <div class="password-strength-meter__requirements-header">
              <span class="password-strength-meter__requirements-title">Password Requirements</span>
              <span class="password-strength-meter__requirements-summary">
                {requirementsSummary().met} of {requirementsSummary().total} met
              </span>
            </div>

            <ul class="password-strength-meter__requirements-list">
              <For each={requirements()}>
                {requirement => (
                  <li
                    class={`password-strength-meter__requirement ${
                      requirement.met
                        ? "password-strength-meter__requirement--met"
                        : "password-strength-meter__requirement--unmet"
                    }`}
                  >
                    <span class="password-strength-meter__requirement-icon">{requirement.met ? "✓" : "○"}</span>
                    <span class="password-strength-meter__requirement-text">{requirement.label}</span>
                  </li>
                )}
              </For>
            </ul>
          </div>
        </Show>

        {/* Suggestions */}
        <Show when={props.showSuggestions && strength().suggestions.length > 0 && !props.compact}>
          <div class="password-strength-meter__suggestions">
            <div class="password-strength-meter__suggestions-title">Suggestions to improve:</div>
            <ul class="password-strength-meter__suggestions-list">
              <For each={strength().suggestions}>
                {suggestion => <li class="password-strength-meter__suggestion">{suggestion}</li>}
              </For>
            </ul>
          </div>
        </Show>

        {/* Compact Mode Summary */}
        <Show when={props.compact}>
          <div class="password-strength-meter__compact-summary">
            <span
              class={`password-strength-meter__compact-label password-strength-meter__compact-label--${strength().score >= 4 ? "excellent" : strength().score >= 3 ? "good" : strength().score >= 2 ? "fair" : strength().score >= 1 ? "weak" : "very-weak"}`}
            >
              {strengthLabel()}
            </span>

            <Show when={!isAcceptable()}>
              <span class="password-strength-meter__compact-warning">Password too weak</span>
            </Show>
          </div>
        </Show>
      </div>
    </Show>
  );
};
