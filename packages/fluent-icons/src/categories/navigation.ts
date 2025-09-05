/**
 * Navigation Icons
 * Icons for navigation, arrows, and directional movement
 */

// Import Fluent UI navigation icons
import HomeIcon from "@fluentui/svg-icons/icons/home_24_regular.svg?raw";
import UpIcon from "@fluentui/svg-icons/icons/location_arrow_up_20_regular.svg?raw";
import ChevronDownIcon from "@fluentui/svg-icons/icons/chevron_down_24_regular.svg?raw";
import ChevronUpIcon from "@fluentui/svg-icons/icons/chevron_up_24_regular.svg?raw";
import ChevronRightIcon from "@fluentui/svg-icons/icons/chevron_right_24_regular.svg?raw";
import ChevronLeftIcon from "@fluentui/svg-icons/icons/chevron_left_24_regular.svg?raw";
import NavigationRegular from "@fluentui/svg-icons/icons/navigation_24_regular.svg?raw";
import ArrowSortRegular from "@fluentui/svg-icons/icons/arrow_sort_24_regular.svg?raw";
import ArrowSortDownRegular from "@fluentui/svg-icons/icons/arrow_sort_down_24_regular.svg?raw";
import ArrowSortUpRegular from "@fluentui/svg-icons/icons/arrow_sort_up_24_regular.svg?raw";
import ExpandRegular from "@fluentui/svg-icons/icons/arrow_expand_24_regular.svg?raw";
import CollapseRegular from "@fluentui/svg-icons/icons/arrow_collapse_all_24_regular.svg?raw";
import ContractUpRightRegular from "@fluentui/svg-icons/icons/contract_up_right_24_regular.svg?raw";
import ExpandUpRightRegular from "@fluentui/svg-icons/icons/expand_up_right_24_regular.svg?raw";
import MoveIcon from "@fluentui/svg-icons/icons/folder_arrow_right_24_regular.svg?raw";

export const navigationIcons = {
  home: {
    svg: HomeIcon,
    metadata: {
      name: "home",
      tags: ["navigation", "location", "main"],
      description: "Home icon",
      keywords: ["home", "house", "main", "start"],
    },
  },
  up: {
    svg: UpIcon,
    metadata: {
      name: "up",
      tags: ["navigation", "direction", "arrow"],
      description: "Up arrow icon",
      keywords: ["up", "arrow", "direction", "top"],
    },
  },
  "chevron-down": {
    svg: ChevronDownIcon,
    metadata: {
      name: "chevron-down",
      tags: ["navigation", "chevron", "direction"],
      description: "Chevron down icon",
      keywords: ["chevron", "down", "arrow", "direction"],
    },
  },
  "chevron-up": {
    svg: ChevronUpIcon,
    metadata: {
      name: "chevron-up",
      tags: ["navigation", "chevron", "direction"],
      description: "Chevron up icon",
      keywords: ["chevron", "up", "arrow", "direction"],
    },
  },
  "chevron-right": {
    svg: ChevronRightIcon,
    metadata: {
      name: "chevron-right",
      tags: ["navigation", "chevron", "direction"],
      description: "Chevron right icon",
      keywords: ["chevron", "right", "arrow", "direction"],
    },
  },
  "chevron-left": {
    svg: ChevronLeftIcon,
    metadata: {
      name: "chevron-left",
      tags: ["navigation", "chevron", "direction"],
      description: "Chevron left icon",
      keywords: ["chevron", "left", "arrow", "direction"],
    },
  },
  navigation: {
    svg: NavigationRegular,
    metadata: {
      name: "navigation",
      tags: ["navigation", "menu", "breadcrumb"],
      description: "Navigation icon",
      keywords: ["navigation", "menu", "breadcrumb", "nav"],
    },
  },
  breadcrumb: {
    svg: NavigationRegular,
    metadata: {
      name: "breadcrumb",
      tags: ["navigation", "menu", "breadcrumb"],
      description: "Breadcrumb navigation icon",
      keywords: ["breadcrumb", "navigation", "menu", "nav"],
    },
  },
  "arrow-sort": {
    svg: ArrowSortRegular,
    metadata: {
      name: "arrow-sort",
      tags: ["navigation", "sort", "arrow"],
      description: "Arrow sort icon",
      keywords: ["arrow", "sort", "direction", "order"],
    },
  },
  "arrow-sort-down": {
    svg: ArrowSortDownRegular,
    metadata: {
      name: "arrow-sort-down",
      tags: ["navigation", "sort", "arrow"],
      description: "Arrow sort down icon",
      keywords: ["arrow", "sort", "down", "descending"],
    },
  },
  "arrow-sort-up": {
    svg: ArrowSortUpRegular,
    metadata: {
      name: "arrow-sort-up",
      tags: ["navigation", "sort", "arrow"],
      description: "Arrow sort up icon",
      keywords: ["arrow", "sort", "up", "ascending"],
    },
  },
  expand: {
    svg: ExpandRegular,
    metadata: {
      name: "expand",
      tags: ["navigation", "expand", "arrow"],
      description: "Expand icon",
      keywords: ["expand", "arrow", "grow", "enlarge"],
    },
  },
  collapse: {
    svg: CollapseRegular,
    metadata: {
      name: "collapse",
      tags: ["navigation", "collapse", "arrow"],
      description: "Collapse icon",
      keywords: ["collapse", "arrow", "shrink", "minimize"],
    },
  },
  contract: {
    svg: ContractUpRightRegular,
    metadata: {
      name: "contract",
      tags: ["navigation", "contract", "arrow"],
      description: "Contract icon",
      keywords: ["contract", "arrow", "shrink", "minimize"],
    },
  },
  "expand-up-right": {
    svg: ExpandUpRightRegular,
    metadata: {
      name: "expand-up-right",
      tags: ["navigation", "expand", "arrow"],
      description: "Expand up right icon",
      keywords: ["expand", "arrow", "up", "right"],
    },
  },
  move: {
    svg: MoveIcon,
    metadata: {
      name: "move",
      tags: ["navigation", "move", "arrow"],
      description: "Move icon",
      keywords: ["move", "arrow", "relocate", "transfer"],
    },
  },
} as const;
