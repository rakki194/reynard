import { Component, createSignal } from "solid-js";
import { useI18n } from "reynard-themes";
import { getDemoTranslation } from "../translations";

const CounterDemo: Component = () => {
  const { t, locale } = useI18n();
  const [count, setCount] = createSignal(0);

  return (
    <div class="counter-demo">
      <button onClick={() => setCount((c) => c - 1)}>-</button>
      <span class="count">{count()}</span>
      <button onClick={() => setCount((c) => c + 1)}>+</button>
      <p class="count-text">
        {count() === 0 && t("common.none")}
        {count() === 1 && getDemoTranslation(locale, "oneItem")}
        {count() !== 0 && count() !== 1 && getDemoTranslation(locale, "multipleItems").replace("{count}", count().toString())}
      </p>
    </div>
  );
};

export default CounterDemo;
