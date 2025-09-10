import { Component } from "solid-js";
import type { OKLCHColor } from "reynard-colors";
import "./MaterialSelector.css";

interface MaterialSelectorProps {
  selected: string;
  onMaterialChange: (material: string) => void;
}

interface MaterialInfo {
  name: string;
  description: string;
  icon: string;
  exampleColor: OKLCHColor;
}

export const MaterialSelector: Component<MaterialSelectorProps> = (props) => {
  const materials: MaterialInfo[] = [
    {
      name: "metal",
      description: "Reflective surface with cool shadows and warm highlights",
      icon: "⚙️",
      exampleColor: { l: 50, c: 0.08, h: 0 }
    },
    {
      name: "skin",
      description: "Organic material with warm shadows and highlights",
      icon: "👤",
      exampleColor: { l: 70, c: 0.12, h: 30 }
    },
    {
      name: "fabric",
      description: "Soft material with subtle hue shifts",
      icon: "🧵",
      exampleColor: { l: 60, c: 0.2, h: 240 }
    },
    {
      name: "plastic",
      description: "Synthetic material with moderate hue shifts",
      icon: "🔲",
      exampleColor: { l: 55, c: 0.15, h: 120 }
    },
    {
      name: "custom",
      description: "Manual control over hue shifting parameters",
      icon: "🎨",
      exampleColor: { l: 60, c: 0.2, h: 180 }
    }
  ];
  
  return (
    <div class="material-selector">
      <div class="material-grid">
        {materials.map((material) => (
          <button
            class={`material-option ${props.selected === material.name ? 'selected' : ''}`}
            onClick={() => props.onMaterialChange(material.name)}
          >
            <div class="material-icon">
              {material.icon}
            </div>
            <div class="material-info">
              <h4>{material.name.charAt(0).toUpperCase() + material.name.slice(1)}</h4>
              <p>{material.description}</p>
            </div>
            <div 
              class="material-preview"
              style={{
                "background-color": `oklch(${material.exampleColor.l}% ${material.exampleColor.c} ${material.exampleColor.h})`
              }}
            />
          </button>
        ))}
      </div>
      
      <div class="material-details">
        <h4>Material Properties</h4>
        <div class="properties-grid">
          {getMaterialProperties(props.selected).map((prop) => (
            <div class="property">
              <span class="property-name">{prop.name}:</span>
              <span class="property-value">{prop.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

function getMaterialProperties(material: string) {
  const properties = {
    metal: [
      { name: "Shadow Shift", value: "30°" },
      { name: "Highlight Shift", value: "15°" },
      { name: "Chroma Boost", value: "0.15" },
      { name: "Lightness Range", value: "50%" }
    ],
    skin: [
      { name: "Shadow Shift", value: "20°" },
      { name: "Highlight Shift", value: "25°" },
      { name: "Chroma Boost", value: "0.08" },
      { name: "Lightness Range", value: "35%" }
    ],
    fabric: [
      { name: "Shadow Shift", value: "15°" },
      { name: "Highlight Shift", value: "10°" },
      { name: "Chroma Boost", value: "0.05" },
      { name: "Lightness Range", value: "40%" }
    ],
    plastic: [
      { name: "Shadow Shift", value: "10°" },
      { name: "Highlight Shift", value: "20°" },
      { name: "Chroma Boost", value: "0.12" },
      { name: "Lightness Range", value: "45%" }
    ],
    custom: [
      { name: "Shadow Shift", value: "Variable" },
      { name: "Highlight Shift", value: "Variable" },
      { name: "Chroma Boost", value: "Variable" },
      { name: "Lightness Range", value: "Variable" }
    ]
  };
  
  return properties[material as keyof typeof properties] || properties.custom;
}
