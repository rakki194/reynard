/**
 * Theme and Visual Icons
 * Icons for themes, visual effects, and decorative elements
 */

// Import Fluent UI theme icons
import SunIcon from "@fluentui/svg-icons/icons/weather_sunny_24_regular.svg?raw";
import CloudIcon from "@fluentui/svg-icons/icons/weather_cloudy_24_regular.svg?raw";
import MoonIcon from "@fluentui/svg-icons/icons/weather_moon_24_regular.svg?raw";
import AccessibilityFilled from "@fluentui/svg-icons/icons/accessibility_24_filled.svg?raw";
import AccessibilityRegular from "@fluentui/svg-icons/icons/accessibility_24_regular.svg?raw";
import SparkleIcon from "@fluentui/svg-icons/icons/text_effects_sparkle_24_regular.svg?raw";
import StarFilled from "@fluentui/svg-icons/icons/star_24_filled.svg?raw";
import StarRegular from "@fluentui/svg-icons/icons/star_24_regular.svg?raw";
import StarHalfRegular from "@fluentui/svg-icons/icons/star_half_24_regular.svg?raw";
import StarHalfFilled from "@fluentui/svg-icons/icons/star_half_24_filled.svg?raw";
import StarEmphasisFilled from "@fluentui/svg-icons/icons/star_emphasis_24_filled.svg?raw";
import StarEmphasisRegular from "@fluentui/svg-icons/icons/star_emphasis_24_regular.svg?raw";
import StarOffFilled from "@fluentui/svg-icons/icons/star_off_24_filled.svg?raw";
import StarOneQuarterRegular from "@fluentui/svg-icons/icons/star_one_quarter_24_regular.svg?raw";
import StarThreeQuarterRegular from "@fluentui/svg-icons/icons/star_three_quarter_24_regular.svg?raw";
import ChristmasTreeIcon from "@fluentui/svg-icons/icons/tree_evergreen_20_regular.svg?raw";
import BowTieIcon from "@fluentui/svg-icons/icons/bow_tie_24_regular.svg?raw";

export const themeIcons = {
  sun: {
    svg: SunIcon,
    metadata: {
      name: "sun",
      tags: ["theme", "weather", "light"],
      description: "Sun icon",
      keywords: ["sun", "sunny", "light", "weather"],
    },
  },
  cloud: {
    svg: CloudIcon,
    metadata: {
      name: "cloud",
      tags: ["theme", "weather", "cloudy"],
      description: "Cloud icon",
      keywords: ["cloud", "cloudy", "weather", "gray"],
    },
  },
  moon: {
    svg: MoonIcon,
    metadata: {
      name: "moon",
      tags: ["theme", "weather", "dark"],
      description: "Moon icon",
      keywords: ["moon", "dark", "night", "weather"],
    },
  },
  contrast: {
    svg: AccessibilityFilled,
    metadata: {
      name: "contrast",
      tags: ["theme", "accessibility", "contrast"],
      description: "High contrast icon",
      keywords: ["contrast", "accessibility", "high", "filled"],
    },
  },
  "contrast-inverse": {
    svg: AccessibilityRegular,
    metadata: {
      name: "contrast-inverse",
      tags: ["theme", "accessibility", "contrast"],
      description: "High contrast inverse icon",
      keywords: ["contrast", "accessibility", "inverse", "regular"],
    },
  },
  sparkle: {
    svg: SparkleIcon,
    metadata: {
      name: "sparkle",
      tags: ["theme", "effect", "magic"],
      description: "Sparkle icon",
      keywords: ["sparkle", "magic", "effect", "star"],
    },
  },
  "star-filled": {
    svg: StarFilled,
    metadata: {
      name: "star-filled",
      tags: ["theme", "star", "rating"],
      description: "Star filled icon",
      keywords: ["star", "filled", "rating", "favorite"],
    },
  },
  star: {
    svg: StarRegular,
    metadata: {
      name: "star",
      tags: ["theme", "star", "rating"],
      description: "Star icon",
      keywords: ["star", "rating", "favorite", "regular"],
    },
  },
  "star-half": {
    svg: StarHalfRegular,
    metadata: {
      name: "star-half",
      tags: ["theme", "star", "rating"],
      description: "Star half icon",
      keywords: ["star", "half", "rating", "partial"],
    },
  },
  "star-half-filled": {
    svg: StarHalfFilled,
    metadata: {
      name: "star-half-filled",
      tags: ["theme", "star", "rating"],
      description: "Star half filled icon",
      keywords: ["star", "half", "filled", "rating"],
    },
  },
  "star-emphasis-filled": {
    svg: StarEmphasisFilled,
    metadata: {
      name: "star-emphasis-filled",
      tags: ["theme", "star", "emphasis"],
      description: "Star emphasis filled icon",
      keywords: ["star", "emphasis", "filled", "highlight"],
    },
  },
  "star-emphasis": {
    svg: StarEmphasisRegular,
    metadata: {
      name: "star-emphasis",
      tags: ["theme", "star", "emphasis"],
      description: "Star emphasis icon",
      keywords: ["star", "emphasis", "highlight", "regular"],
    },
  },
  "star-off": {
    svg: StarOffFilled,
    metadata: {
      name: "star-off",
      tags: ["theme", "star", "off"],
      description: "Star off icon",
      keywords: ["star", "off", "disabled", "filled"],
    },
  },
  "star-one-quarter": {
    svg: StarOneQuarterRegular,
    metadata: {
      name: "star-one-quarter",
      tags: ["theme", "star", "rating"],
      description: "Star one quarter icon",
      keywords: ["star", "one", "quarter", "rating"],
    },
  },
  "star-three-quarter": {
    svg: StarThreeQuarterRegular,
    metadata: {
      name: "star-three-quarter",
      tags: ["theme", "star", "rating"],
      description: "Star three quarter icon",
      keywords: ["star", "three", "quarter", "rating"],
    },
  },
  christmas: {
    svg: ChristmasTreeIcon,
    metadata: {
      name: "christmas",
      tags: ["theme", "holiday", "tree"],
      description: "Christmas tree icon",
      keywords: ["christmas", "tree", "holiday", "evergreen"],
    },
  },
  bowtie: {
    svg: BowTieIcon,
    metadata: {
      name: "bowtie",
      tags: ["theme", "fashion", "tie"],
      description: "Bow tie icon",
      keywords: ["bowtie", "tie", "fashion", "formal"],
    },
  },
} as const;
