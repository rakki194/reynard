/**
 * Password Strength Meter Component
 * Visual password strength indicator with detailed feedback
 */

import { Component, Show, For, createMemo } from "solid-js";
import { usePasswordStrength } from "../composables/usePasswordStrength";
import type { UsePasswordStrengthOptions } from "../composables/usePasswordStrength";

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

export const PasswordStrengthMeter: Component<PasswordStrengthMeterProps> = (props) => {
  const {
    password,
    showRequirements = true,
    showSuggestions = true,
    showCrackTime = true,
    compact = false,
    class: className,
    ...strengthOptions
  } = props;

  const passwordSignal = () => password;
  
  const {
    strength,
    strengthLabel,
    strengthColor,
    strengthProgress,
    isAcceptable,
    feedback,
    requirements,
    requirementsSummary,
  } = usePasswordStrength(passwordSignal, strengthOptions);

  // Don't show anything if no password
  const shouldShow = createMemo(() => password && password.length > 0);

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
    
    if (compact) classes.push("password-strength-meter--compact");
    if (className) classes.push(className);
    
    return classes.join(" ");
  };

  return (
    <Show when={shouldShow()}>
      <div class={getContainerClasses()}>
        {/* Strength Bar */}
        <div class="password-strength-meter__progress">
          <div 
            class={getStrengthBarClasses()}
            style={{
              width: `${strengthProgress()}%`,
              "background-color": strengthColor(),
            }}
          />
        </div>

        {/* Strength Label and Feedback */}
        <Show when={!compact}>
          <div class="password-strength-meter__feedback">
            <div class="password-strength-meter__strength">
              <span 
                class="password-strength-meter__label"
                style={{ color: strengthColor() }}
              >
                {strengthLabel()}
              </span>
              
              <Show when={showCrackTime && strength().crackTime}>
                <span class="password-strength-meter__crack-time">
                  Time to crack: {strength().crackTime}
                </span>
              </Show>
            </div>
            
            <Show when={feedback()}>
              <div class="password-strength-meter__message">
                {feedback()}
              </div>
            </Show>
          </div>
        </Show>

        {/* Requirements Checklist */}
        <Show when={showRequirements && !compact}>
          <div class="password-strength-meter__requirements">
            <div class="password-strength-meter__requirements-header">
              <span class="password-strength-meter__requirements-title">
                Password Requirements
              </span>
              <span class="password-strength-meter__requirements-summary">
                {requirementsSummary().met} of {requirementsSummary().total} met
              </span>
            </div>
            
            <ul class="password-strength-meter__requirements-list">
              <For each={requirements()}>
                {(requirement) => (
                  <li 
                    class={`password-strength-meter__requirement ${
                      requirement.met 
                        ? "password-strength-meter__requirement--met" 
                        : "password-strength-meter__requirement--unmet"
                    }`}
                  >
                    <span class="password-strength-meter__requirement-icon">
                      {requirement.met ? "✓" : "○"}
                    </span>
                    <span class="password-strength-meter__requirement-text">
                      {requirement.label}
                    </span>
                  </li>
                )}
              </For>
            </ul>
          </div>
        </Show>

        {/* Suggestions */}
        <Show when={showSuggestions && strength().suggestions.length > 0 && !compact}>
          <div class="password-strength-meter__suggestions">
            <div class="password-strength-meter__suggestions-title">
              Suggestions to improve:
            </div>
            <ul class="password-strength-meter__suggestions-list">
              <For each={strength().suggestions}>
                {(suggestion) => (
                  <li class="password-strength-meter__suggestion">
                    {suggestion}
                  </li>
                )}
              </For>
            </ul>
          </div>
        </Show>

        {/* Compact Mode Summary */}
        <Show when={compact}>
          <div class="password-strength-meter__compact-summary">
            <span 
              class="password-strength-meter__compact-label"
              style={{ color: strengthColor() }}
            >
              {strengthLabel()}
            </span>
            
            <Show when={!isAcceptable()}>
              <span class="password-strength-meter__compact-warning">
                Password too weak
              </span>
            </Show>
          </div>
        </Show>
      </div>
    </Show>
  );
};




