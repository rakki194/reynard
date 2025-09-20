/**
 * ThinkingIndicator Component for Reynard Chat System
 *
 * Displays thinking/processing state with various animation styles
 * and expandable content viewing.
 */
import { Show, createSignal } from "solid-js";
export const ThinkingIndicator = props => {
  const [isExpanded, setIsExpanded] = createSignal(props.showContent || false);
  const getVariantClass = () => {
    const base = "reynard-thinking-indicator";
    const variant = `${base}--${props.variant || "dots"}`;
    const active = props.isActive ? `${base}--active` : "";
    const expanded = isExpanded() ? `${base}--expanded` : "";
    return [base, variant, active, expanded].filter(Boolean).join(" ");
  };
  const renderAnimation = () => {
    switch (props.variant) {
      case "pulse":
        return (
          <div class="reynard-thinking-indicator__pulse">
            <div class="reynard-thinking-indicator__pulse-dot"></div>
          </div>
        );
      case "typing":
        return (
          <div class="reynard-thinking-indicator__typing">
            <span class="reynard-thinking-indicator__typing-text">{props.label || "Thinking"}</span>
            <span class="reynard-thinking-indicator__cursor">|</span>
          </div>
        );
      case "dots":
      default:
        return (
          <div class="reynard-thinking-indicator__dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        );
    }
  };
  return (
    <div class={getVariantClass()}>
      <div class="reynard-thinking-indicator__header">
        <div class="reynard-thinking-indicator__icon">💭</div>

        <div class="reynard-thinking-indicator__label">
          <span>{props.label || "Thinking..."}</span>
          {renderAnimation()}
        </div>

        <Show when={props.content}>
          <button
            class="reynard-thinking-indicator__toggle"
            onClick={() => setIsExpanded(!isExpanded())}
            attr:aria-expanded={isExpanded() ? "true" : "false"}
            aria-label={isExpanded() ? "Hide thinking content" : "Show thinking content"}
          >
            <span class="reynard-thinking-indicator__toggle-icon">{isExpanded() ? "▼" : "▶"}</span>
          </button>
        </Show>
      </div>

      <Show when={isExpanded() && props.content}>
        <div class="reynard-thinking-indicator__content">
          <div class="reynard-thinking-indicator__content-text">{props.content}</div>
        </div>
      </Show>
    </div>
  );
};
