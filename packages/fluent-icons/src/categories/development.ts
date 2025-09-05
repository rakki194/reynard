/**
 * Development and Code Icons
 * Icons for development tools, code, and technical operations
 */

// Import Fluent UI development icons
import CodeRegular from "@fluentui/svg-icons/icons/code_24_regular.svg?raw";
import DatabaseRegular from "@fluentui/svg-icons/icons/database_24_regular.svg?raw";
import BranchCompareRegular from "@fluentui/svg-icons/icons/branch_compare_24_regular.svg?raw";
import GitBranchIcon from "@fluentui/svg-icons/icons/branch_24_regular.svg?raw";
import BeakerRegular from "@fluentui/svg-icons/icons/beaker_24_regular.svg?raw";
import RocketFilled from "@fluentui/svg-icons/icons/rocket_24_filled.svg?raw";
import BrainRegular from "@fluentui/svg-icons/icons/brain_24_regular.svg?raw";
import BrainCircuitRegular from "@fluentui/svg-icons/icons/brain_circuit_24_regular.svg?raw";
import PuzzleCubeRegular from "@fluentui/svg-icons/icons/puzzle_cube_24_regular.svg?raw";
import PuzzlePieceRegular from "@fluentui/svg-icons/icons/puzzle_piece_24_regular.svg?raw";

export const developmentIcons = {
  code: {
    svg: CodeRegular,
    metadata: {
      name: "code",
      tags: ["development", "programming", "code"],
      description: "Code icon",
      keywords: ["code", "programming", "development", "source"],
    },
  },
  database: {
    svg: DatabaseRegular,
    metadata: {
      name: "database",
      tags: ["development", "data", "storage"],
      description: "Database icon",
      keywords: ["database", "data", "storage", "server"],
    },
  },
  "branch-compare": {
    svg: BranchCompareRegular,
    metadata: {
      name: "branch-compare",
      tags: ["development", "git", "version"],
      description: "Branch compare icon",
      keywords: ["branch", "compare", "git", "version"],
    },
  },
  "git-branch": {
    svg: GitBranchIcon,
    metadata: {
      name: "git-branch",
      tags: ["development", "git", "branch"],
      description: "Git branch icon",
      keywords: ["git", "branch", "version", "control"],
    },
  },
  beaker: {
    svg: BeakerRegular,
    metadata: {
      name: "beaker",
      tags: ["development", "experiment", "test"],
      description: "Beaker icon",
      keywords: ["beaker", "experiment", "test", "lab"],
    },
  },
  rocket: {
    svg: RocketFilled,
    metadata: {
      name: "rocket",
      tags: ["development", "deploy", "launch"],
      description: "Rocket icon",
      keywords: ["rocket", "deploy", "launch", "release"],
    },
  },
  brain: {
    svg: BrainRegular,
    metadata: {
      name: "brain",
      tags: ["development", "ai", "intelligence"],
      description: "Brain icon",
      keywords: ["brain", "ai", "intelligence", "thinking"],
    },
  },
  "brain-circuit": {
    svg: BrainCircuitRegular,
    metadata: {
      name: "brain-circuit",
      tags: ["development", "ai", "neural"],
      description: "Brain circuit icon",
      keywords: ["brain", "circuit", "neural", "ai"],
    },
  },
  "puzzle-cube": {
    svg: PuzzleCubeRegular,
    metadata: {
      name: "puzzle-cube",
      tags: ["development", "puzzle", "problem"],
      description: "Puzzle cube icon",
      keywords: ["puzzle", "cube", "problem", "solve"],
    },
  },
  "puzzle-piece": {
    svg: PuzzlePieceRegular,
    metadata: {
      name: "puzzle-piece",
      tags: ["development", "puzzle", "component"],
      description: "Puzzle piece icon",
      keywords: ["puzzle", "piece", "component", "part"],
    },
  },
} as const;
