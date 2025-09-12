import { Component } from "solid-js";
import { sprites } from "../data/spriteData";

interface SpriteSelectorProps {
  selectedSprite: string;
  onSpriteChange: (sprite: string) => void;
}

export const SpriteSelector: Component<SpriteSelectorProps> = (props) => {
  return (
    <div class="sprite-selector">
      <h4>Sprite Type</h4>
      <div class="sprite-buttons">
        {Object.entries(sprites).map(([key, sprite]) => (
          <button
            class={`sprite-button ${props.selectedSprite === key ? "selected" : ""}`}
            onClick={() => props.onSpriteChange(key)}
          >
            {sprite.name}
          </button>
        ))}
      </div>
    </div>
  );
};
