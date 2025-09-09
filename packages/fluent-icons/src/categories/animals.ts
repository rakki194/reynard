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
      caption:
        "A cat icon representing feline pets, animals, or cat-related features",
      keywords: ["cat", "feline", "pet", "animal"],
    },
  },
  dog: {
    svg: DogRegular,
    metadata: {
      name: "dog",
      tags: ["animal", "pet", "canine"],
      description: "Dog icon",
      caption:
        "A dog icon representing canine pets, animals, or dog-related features",
      keywords: ["dog", "canine", "pet", "animal"],
    },
  },
  turtle: {
    svg: TurtleRegular,
    metadata: {
      name: "turtle",
      tags: ["animal", "reptile", "slow"],
      description: "Turtle icon",
      caption:
        "A turtle icon representing reptiles, slow processes, or turtle-related features",
      keywords: ["turtle", "reptile", "slow", "animal"],
    },
  },
  "paw-print": {
    svg: AnimalPawPrintRegular,
    metadata: {
      name: "paw-print",
      tags: ["animal", "paw", "print"],
      description: "Paw print icon",
      caption:
        "A paw print icon representing animal footprints, pet-related features, or animal tracking",
      keywords: ["paw", "print", "animal", "footprint"],
    },
  },
} as const;
