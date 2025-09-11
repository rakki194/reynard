import { Component, createMemo, createSignal } from "solid-js";
import type { OKLCHColor } from "reynard-colors";
import { basicHueShift, materialHueShift, MATERIAL_PATTERNS } from "../utils/hueShiftingAlgorithms";
import { sprites } from "../data/spriteData";
import { SpriteSelector } from "./SpriteSelector";
import { SpritePreview } from "./SpritePreview";
import { ComparisonView } from "./ComparisonView";
import "./PixelArtPreview.css";

interface PixelArtPreviewProps {
  baseColor: OKLCHColor;
  material: keyof typeof MATERIAL_PATTERNS | "custom";
  intensity: number;
}

export const PixelArtPreview: Component<PixelArtPreviewProps> = (props) => {
  const [selectedSprite, setSelectedSprite] = createSignal("character");
  
  const spriteColors = createMemo(() => {
    const base = props.baseColor;
    const material = props.material;
    const intensity = props.intensity;
    
    if (material === "custom") {
      return {
        shadow: basicHueShift(base, "shadow", intensity),
        base: base,
        highlight: basicHueShift(base, "highlight", intensity)
      };
    }
    
    return materialHueShift(base, material, intensity);
  });
  
  const currentSprite = createMemo(() => sprites[selectedSprite() as keyof typeof sprites]);
  
  return (
    <div class="pixel-art-preview">
      <SpriteSelector 
        selectedSprite={selectedSprite()} 
        onSpriteChange={setSelectedSprite} 
      />
      
      <SpritePreview 
        sprite={currentSprite()} 
        spriteColors={spriteColors()} 
      />
      
      <ComparisonView 
        sprite={currentSprite()} 
        baseColor={props.baseColor}
        spriteColors={spriteColors()} 
      />
    </div>
  );
};
