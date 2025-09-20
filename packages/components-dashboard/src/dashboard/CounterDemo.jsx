/**
 * Counter Demo Component
 * Demonstrates reactive state management with SolidJS signals
 */
import { createSignal } from "solid-js";
import { useNotifications } from "reynard-core";
import { fluentIconsPackage } from "reynard-fluent-icons";
export const CounterDemo = () => {
    const { notify } = useNotifications();
    const [counter, setCounter] = createSignal(0);
    const handleCounterAction = (action) => {
        switch (action) {
            case "increment":
                setCounter(counter() + 1);
                notify(`Counter increased to ${counter() + 1}`, "info");
                break;
            case "decrement":
                setCounter(counter() - 1);
                notify(`Counter decreased to ${counter() - 1}`, "info");
                break;
            case "reset":
                setCounter(0);
                notify("Counter reset to 0", "warning");
                break;
        }
    };
    return (<div class="dashboard-card">
      <div class="card-header">
        <h3>
          {fluentIconsPackage.getIcon("add") && (<span class="card-icon">
              <div 
        // eslint-disable-next-line solid/no-innerhtml
        innerHTML={fluentIconsPackage.getIcon("add")?.outerHTML}/>
            </span>)}
          Reactive Counter
        </h3>
      </div>
      <div class="card-content">
        <div class="counter-display">
          <span class="counter-value">{counter()}</span>
        </div>
        <div class="button-group">
          <button class="button button--small" onClick={() => handleCounterAction("decrement")}>
            {fluentIconsPackage.getIcon("subtract") && (<span 
        // eslint-disable-next-line solid/no-innerhtml
        innerHTML={fluentIconsPackage.getIcon("subtract")?.outerHTML}/>)}
          </button>
          <button class="button button--small" onClick={() => handleCounterAction("reset")}>
            {fluentIconsPackage.getIcon("refresh") && (<span 
        // eslint-disable-next-line solid/no-innerhtml
        innerHTML={fluentIconsPackage.getIcon("refresh")?.outerHTML}/>)}
          </button>
          <button class="button button--small" onClick={() => handleCounterAction("increment")}>
            {fluentIconsPackage.getIcon("add") && (<span 
        // eslint-disable-next-line solid/no-innerhtml
        innerHTML={fluentIconsPackage.getIcon("add")?.outerHTML}/>)}
          </button>
        </div>
      </div>
    </div>);
};
