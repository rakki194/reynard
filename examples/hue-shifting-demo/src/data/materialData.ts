import type { MaterialDefinition } from "../types/materialTypes";
import { allIcons } from "reynard-fluent-icons";

export const MATERIALS: MaterialDefinition[] = [
  {
    key: "metal" as const,
    name: "Metal",
    description: "Reflective surface with cool shadows and warm highlights",
    icon: allIcons.settings.svg,
    exampleColor: { l: 50, c: 0.08, h: 0 }
  },
  {
    key: "skin" as const,
    name: "Skin",
    description: "Organic material with warm shadows and highlights",
    icon: allIcons.user.svg,
    exampleColor: { l: 70, c: 0.12, h: 30 }
  },
  {
    key: "fabric" as const,
    name: "Fabric",
    description: "Soft material with subtle hue shifts",
    icon: allIcons.tag.svg,
    exampleColor: { l: 60, c: 0.2, h: 240 }
  },
  {
    key: "plastic" as const,
    name: "Plastic",
    description: "Synthetic material with moderate hue shifts",
    icon: allIcons.box.svg,
    exampleColor: { l: 55, c: 0.15, h: 120 }
  }
];
