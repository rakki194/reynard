/**
 * Status Display Component
 * Renders individual status items with consistent styling
 */
export const StatusItem = (props) => {
    return (<div class="status-item">
      <span class="status-label">{props.label}:</span>
      <span class={`status-value ${props.statusClass || ""}`}>
        {props.value}
      </span>
    </div>);
};
export { StatusItem as StatusDisplay };
