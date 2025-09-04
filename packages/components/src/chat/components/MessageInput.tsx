/**
 * MessageInput Component for Reynard Chat System
 *
 * Advanced input component with support for:
 * - Multiline text with auto-resize
 * - Character counting and limits
 * - Keyboard shortcuts
 * - File attachments (future)
 * - Voice input (future)
 */

import { Component, createSignal, createEffect, onMount } from "solid-js";
import type { MessageInputProps } from "../types";

export const MessageInput: Component<MessageInputProps> = (props) => {
  const [value, setValue] = createSignal("");
  const [isFocused, setIsFocused] = createSignal(false);
  let textareaRef: HTMLTextAreaElement | undefined;

  // Auto-resize functionality
  const autoResize = () => {
    if (textareaRef && props.autoResize !== false) {
      textareaRef.style.height = "auto";
      textareaRef.style.height = `${textareaRef.scrollHeight}px`;
    }
  };

  // Handle input changes
  const handleInput = (event: Event) => {
    const target = event.target as HTMLTextAreaElement;
    const newValue = target.value;

    // Apply max length if specified
    if (props.maxLength && newValue.length > props.maxLength) {
      return;
    }

    setValue(newValue);
    props.onChange?.(newValue);

    if (props.autoResize !== false) {
      autoResize();
    }
  };

  // Handle key events
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      if (props.multiline && !event.shiftKey) {
        // Submit on Enter (without Shift)
        event.preventDefault();
        handleSubmit();
      } else if (!props.multiline) {
        // Submit on Enter for single-line
        event.preventDefault();
        handleSubmit();
      }
      // Allow Shift+Enter for new lines in multiline mode
    }

    // Handle other shortcuts
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case "Enter":
          event.preventDefault();
          handleSubmit();
          break;
      }
    }
  };

  // Handle form submission
  const handleSubmit = () => {
    const trimmedValue = value().trim();

    if (!trimmedValue || props.disabled || props.isStreaming) {
      return;
    }

    props.onSubmit?.(trimmedValue);
    setValue("");

    // Reset textarea height
    if (textareaRef && props.autoResize !== false) {
      textareaRef.style.height = "auto";
    }
  };

  // Character count info
  const getCharacterInfo = () => {
    const currentLength = value().length;
    const maxLength = props.maxLength;

    if (!maxLength) return null;

    return {
      current: currentLength,
      max: maxLength,
      remaining: maxLength - currentLength,
      isNearLimit: currentLength > maxLength * 0.8,
      isOverLimit: currentLength > maxLength,
    };
  };

  // Get component classes
  const getClasses = () => {
    const base = "reynard-message-input";
    const variant = `${base}--${props.variant || "default"}`;
    const focused = isFocused() ? `${base}--focused` : "";
    const disabled = props.disabled ? `${base}--disabled` : "";
    const streaming = props.isStreaming ? `${base}--streaming` : "";
    const multiline = props.multiline ? `${base}--multiline` : "";

    return [base, variant, focused, disabled, streaming, multiline]
      .filter(Boolean)
      .join(" ");
  };

  // Focus textarea on mount if not disabled
  onMount(() => {
    if (!props.disabled && textareaRef) {
      textareaRef.focus();
    }
  });

  // Update value when controlled
  createEffect(() => {
    if (props.onChange) {
      // This is controlled, don't update internal state
      return;
    }
  });

  return (
    <div class={getClasses()}>
      <div class="reynard-message-input__container">
        {/* Main Input Area */}
        <div class="reynard-message-input__input-wrapper">
          <textarea
            ref={textareaRef}
            class="reynard-message-input__textarea"
            value={value()}
            placeholder={props.placeholder || "Type your message..."}
            disabled={props.disabled || props.isStreaming}
            rows={props.multiline ? 3 : 1}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            aria-label="Message input"
            data-testid="message-input"
          />

          {/* Character Counter */}
          <div class="reynard-message-input__meta">
            {props.showCounter && getCharacterInfo() && (
              <div
                class={`reynard-message-input__counter ${
                  getCharacterInfo()!.isNearLimit
                    ? "reynard-message-input__counter--warning"
                    : ""
                } ${
                  getCharacterInfo()!.isOverLimit
                    ? "reynard-message-input__counter--error"
                    : ""
                }`}
              >
                {getCharacterInfo()!.current}
                {props.maxLength && ` / ${props.maxLength}`}
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div class="reynard-message-input__actions">
          {props.submitButton ? (
            <div
              class="reynard-message-input__custom-submit"
              onClick={handleSubmit}
            >
              {props.submitButton}
            </div>
          ) : (
            <button
              type="button"
              class="reynard-message-input__submit"
              disabled={
                !value().trim() ||
                props.disabled ||
                props.isStreaming ||
                getCharacterInfo()?.isOverLimit ||
                false
              }
              onClick={handleSubmit}
              aria-label="Send message"
              title={
                props.isStreaming
                  ? "Please wait..."
                  : props.multiline
                    ? "Send message (Ctrl+Enter)"
                    : "Send message (Enter)"
              }
            >
              {props.isStreaming ? (
                <div class="reynard-message-input__spinner">
                  <div class="reynard-message-input__spinner-dot"></div>
                  <div class="reynard-message-input__spinner-dot"></div>
                  <div class="reynard-message-input__spinner-dot"></div>
                </div>
              ) : (
                <svg
                  class="reynard-message-input__send-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path d="m22 2-7 20-4-9-9-4 20-7z" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Help Text */}
      <div class="reynard-message-input__help">
        {props.multiline ? (
          <span class="reynard-message-input__shortcut">
            Press Enter for new line, Ctrl+Enter to send
          </span>
        ) : (
          <span class="reynard-message-input__shortcut">
            Press Enter to send
          </span>
        )}
      </div>
    </div>
  );
};
