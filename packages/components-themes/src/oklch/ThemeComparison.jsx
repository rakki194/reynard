/**
 * Theme Comparison Component
 * Demonstrates theme-aware color generation
 */
import { For, createEffect } from "solid-js";
import { formatOKLCH } from "reynard-colors";
export const ThemeComparison = props => {
    const themeTagsRef = [];
    // Helper function to set CSS custom properties
    const setCSSProperty = (element, property, value) => {
        element.style.setProperty(property, value);
    };
    // Update theme tags
    createEffect(() => {
        const tagColors = props.themeTagColors;
        let tagIndex = 0;
        tagColors.forEach(tagData => {
            tagData.colors.forEach(colorData => {
                const ref = themeTagsRef[tagIndex];
                if (ref) {
                    setCSSProperty(ref, "--dynamic-bg-color", formatOKLCH(colorData.color));
                    setCSSProperty(ref, "--dynamic-opacity", props.selectedTheme === colorData.theme ? "1" : "0.3");
                }
                tagIndex++;
            });
        });
    });
    return (<div class="theme-comparison-section">
      <h2>Theme-Aware Color Generation</h2>
      <div class="theme-selector">
        <For each={props.availableThemes}>
          {theme => (<button class={`theme-button ${props.selectedTheme === theme ? "active" : ""}`} onClick={() => props.onThemeChange(theme)}>
              {theme}
            </button>)}
        </For>
      </div>

      <div class="theme-demo">
        <h3>Tag Colors Across Themes</h3>
        <div class="tag-comparison">
          <For each={props.themeTagColors}>
            {tagData => (<div class="tag-row">
                <span class="tag-label">{tagData.tag}</span>
                <div class="tag-colors">
                  <For each={tagData.colors}>
                    {(colorData, _colorIndex) => (<div ref={el => {
                    if (el) {
                        const globalIndex = tagData.colors.findIndex(c => c === colorData);
                        themeTagsRef[globalIndex] = el;
                    }
                }} class="theme-tag" data-background-color={formatOKLCH(colorData.color)} data-opacity={props.selectedTheme === colorData.theme ? 1 : 0.3}>
                        {colorData.theme}
                      </div>)}
                  </For>
                </div>
              </div>)}
          </For>
        </div>
      </div>
    </div>);
};
