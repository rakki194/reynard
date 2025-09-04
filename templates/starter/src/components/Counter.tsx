/**
 * Counter Component
 * Demonstrates reactive state management
 */

import { Component } from 'solid-js';

interface CounterProps {
  count: number;
  setCount: (value: number) => void;
}

export const Counter: Component<CounterProps> = (props) => {
  const increment = () => {
    props.setCount(props.count + 1);
  };

  const decrement = () => {
    props.setCount(props.count - 1);
  };

  const reset = () => {
    props.setCount(0);
  };

  return (
    <div class="counter">
      <div class="counter-display">
        Count: <strong>{props.count}</strong>
      </div>
      <div class="button-group">
        <button class="button button--small" onClick={decrement}>
          -
        </button>
        <button class="button button--small" onClick={reset}>
          Reset
        </button>
        <button class="button button--small" onClick={increment}>
          +
        </button>
      </div>
    </div>
  );
};
