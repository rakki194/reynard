/**
 * OKLCH Color Demo Component
 * Orchestrates the modular OKLCH color system demonstration
 */
import { createSignal } from "solid-js";
import { fluentIconsPackage } from "reynard-fluent-icons";
import { ColorSelection, ColorPaletteDisplay, ColorVariants, TagColorsDemo, GradientDemo, OKLCHButtonsDemo, ThemeInfo, } from ".";
export const OKLCHColorDemo = () => {
    const [selectedColor, setSelectedColor] = createSignal("primary");
    return (<section class="oklch-demo-section">
      <div class="section-header">
        <h2>
          {fluentIconsPackage.getIcon("palette") && (<span class="section-icon">
              <div 
        // eslint-disable-next-line solid/no-innerhtml
        innerHTML={fluentIconsPackage.getIcon("palette")?.outerHTML}/>
            </span>)}
          OKLCH Color System Demo
        </h2>
        <p>Experience the power of OKLCH color space with perceptual uniformity and theme-aware generation</p>
      </div>

      <div class="oklch-demo-content">
        <ColorSelection selectedColor={selectedColor()} onColorSelect={setSelectedColor}/>

        <ColorPaletteDisplay selectedColor={selectedColor()}/>

        <ColorVariants selectedColor={selectedColor()}/>

        <TagColorsDemo />

        <GradientDemo />

        <OKLCHButtonsDemo />

        <ThemeInfo />
      </div>
    </section>);
};
