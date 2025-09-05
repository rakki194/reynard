/**
 * Animal Icons
 * Icons for animals and creatures
 */

// Import Fluent UI animal icons
import CatRegular from "@fluentui/svg-icons/icons/animal_cat_24_regular.svg?raw";
import DogRegular from "@fluentui/svg-icons/icons/animal_dog_24_regular.svg?raw";
import TurtleRegular from "@fluentui/svg-icons/icons/animal_turtle_24_regular.svg?raw";
import AnimalPawPrintRegular from "@fluentui/svg-icons/icons/animal_paw_print_24_regular.svg?raw";

export const animalIcons = {
  cat: {
    svg: CatRegular,
    metadata: {
      name: "cat",
      tags: ["animal", "pet", "feline"],
      description: "Cat icon",
      keywords: ["cat", "feline", "pet", "animal"],
    },
  },
  dog: {
    svg: DogRegular,
    metadata: {
      name: "dog",
      tags: ["animal", "pet", "canine"],
      description: "Dog icon",
      keywords: ["dog", "canine", "pet", "animal"],
    },
  },
  turtle: {
    svg: TurtleRegular,
    metadata: {
      name: "turtle",
      tags: ["animal", "reptile", "slow"],
      description: "Turtle icon",
      keywords: ["turtle", "reptile", "slow", "animal"],
    },
  },
  "paw-print": {
    svg: AnimalPawPrintRegular,
    metadata: {
      name: "paw-print",
      tags: ["animal", "paw", "print"],
      description: "Paw print icon",
      keywords: ["paw", "print", "animal", "footprint"],
    },
  },
  admin: {
    svg: AnimalPawPrintRegular,
    metadata: {
      name: "admin",
      tags: ["animal", "admin", "paw"],
      description: "Admin paw print icon",
      keywords: ["admin", "paw", "print", "animal"],
    },
  },
} as const;
