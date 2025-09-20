/**
 * Text File Upload Component for Reynard Caption System
 *
 * Handles file upload UI and interactions.
 */
import { Show } from "solid-js";
export const TextFileUpload = props => {
    return (<div class={`text-upload-section ${props.class || ""}`}>
      <label for="text-file-upload" class="upload-label">
        Upload Text Files
      </label>
      <input id="text-file-upload" type="file" multiple accept=".txt,.md,.json,.xml,.yaml,.yml,.toml,.js,.ts,.tsx,.jsx,.py,.java,.cpp,.c,.cs,.php,.rb,.go,.rs,.swift,.kt,.scala,.html,.css,.scss,.sass,.less,.sql,.sh,.bash,.zsh,.fish,.ps1,.bat,.dockerfile,.gitignore,.env,.log" onChange={props.onFileUpload} class="text-upload-input" disabled={props.isLoading}/>
      <Show when={props.isLoading}>
        <div class="loading-indicator">Processing text files...</div>
      </Show>
      <Show when={props.error}>
        <div class="error-message">{props.error}</div>
      </Show>
    </div>);
};
