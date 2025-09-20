/**
 * ServiceLoadingProgress Component
 * Loading progress indicator for service operations
 */
import { Show } from "solid-js";
import { fluentIconsPackage } from "reynard-fluent-icons";
export const ServiceLoadingProgress = props => {
    return (<div class="service-loading-progress">
      <Show when={props.showSpinner !== false}>
        <span class="loading-spinner">
          <div 
    // eslint-disable-next-line solid/no-innerhtml
    innerHTML={fluentIconsPackage.getIcon("spinner")?.outerHTML || ""}/>
        </span>
      </Show>

      <Show when={props.message}>
        <span class="loading-message">{props.message}</span>
      </Show>

      <Show when={props.showProgress && props.progress !== undefined}>
        <div class="progress-bar">
          <div class="progress-fill" data-progress={props.progress}/>
        </div>
        <span class="progress-text">{props.progress}%</span>
      </Show>
    </div>);
};
