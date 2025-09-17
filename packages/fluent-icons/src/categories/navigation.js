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
            caption: "A house icon representing the home page or main dashboard",
            keywords: ["home", "house", "main", "start"],
        },
    },
    up: {
        svg: UpIcon,
        metadata: {
            name: "up",
            tags: ["navigation", "direction", "arrow"],
            description: "Up arrow icon",
            caption: "An upward pointing arrow icon for navigating to higher levels or scrolling up",
            keywords: ["up", "arrow", "direction", "top"],
        },
    },
    "chevron-down": {
        svg: ChevronDownIcon,
        metadata: {
            name: "chevron-down",
            tags: ["navigation", "chevron", "direction"],
            description: "Chevron down icon",
            caption: "A downward pointing chevron icon for expanding menus or moving down",
            keywords: ["chevron", "down", "arrow", "direction"],
        },
    },
    "chevron-up": {
        svg: ChevronUpIcon,
        metadata: {
            name: "chevron-up",
            tags: ["navigation", "chevron", "direction"],
            description: "Chevron up icon",
            caption: "An upward pointing chevron icon for collapsing menus or moving up",
            keywords: ["chevron", "up", "arrow", "direction"],
        },
    },
    "chevron-right": {
        svg: ChevronRightIcon,
        metadata: {
            name: "chevron-right",
            tags: ["navigation", "chevron", "direction"],
            description: "Chevron right icon",
            caption: "A rightward pointing chevron icon for moving forward or expanding rightward",
            keywords: ["chevron", "right", "arrow", "direction"],
        },
    },
    "chevron-left": {
        svg: ChevronLeftIcon,
        metadata: {
            name: "chevron-left",
            tags: ["navigation", "chevron", "direction"],
            description: "Chevron left icon",
            caption: "A leftward pointing chevron icon for moving backward or expanding leftward",
            keywords: ["chevron", "left", "arrow", "direction"],
        },
    },
    navigation: {
        svg: NavigationRegular,
        metadata: {
            name: "navigation",
            tags: ["navigation", "menu", "breadcrumb"],
            description: "Navigation icon",
            caption: "A navigation menu icon with horizontal lines for accessing main navigation",
            keywords: ["navigation", "menu", "breadcrumb", "nav"],
        },
    },
    breadcrumb: {
        svg: NavigationRegular,
        metadata: {
            name: "breadcrumb",
            tags: ["navigation", "menu", "breadcrumb"],
            description: "Breadcrumb navigation icon",
            caption: "A breadcrumb navigation icon showing hierarchical navigation path",
            keywords: ["breadcrumb", "navigation", "menu", "nav"],
        },
    },
    "arrow-sort": {
        svg: ArrowSortRegular,
        metadata: {
            name: "arrow-sort",
            tags: ["navigation", "sort", "arrow"],
            description: "Arrow sort icon",
            caption: "A bidirectional arrow icon for sorting content in ascending or descending order",
            keywords: ["arrow", "sort", "direction", "order"],
        },
    },
    "arrow-sort-down": {
        svg: ArrowSortDownRegular,
        metadata: {
            name: "arrow-sort-down",
            tags: ["navigation", "sort", "arrow"],
            description: "Arrow sort down icon",
            caption: "A downward arrow icon for sorting content in descending order",
            keywords: ["arrow", "sort", "down", "descending"],
        },
    },
    "arrow-sort-up": {
        svg: ArrowSortUpRegular,
        metadata: {
            name: "arrow-sort-up",
            tags: ["navigation", "sort", "arrow"],
            description: "Arrow sort up icon",
            caption: "An upward arrow icon for sorting content in ascending order",
            keywords: ["arrow", "sort", "up", "ascending"],
        },
    },
    expand: {
        svg: ExpandRegular,
        metadata: {
            name: "expand",
            tags: ["navigation", "expand", "arrow"],
            description: "Expand icon",
            caption: "An outward pointing arrow icon for expanding content or panels",
            keywords: ["expand", "arrow", "grow", "enlarge"],
        },
    },
    collapse: {
        svg: CollapseRegular,
        metadata: {
            name: "collapse",
            tags: ["navigation", "collapse", "arrow"],
            description: "Collapse icon",
            caption: "An inward pointing arrow icon for collapsing content or panels",
            keywords: ["collapse", "arrow", "shrink", "minimize"],
        },
    },
    contract: {
        svg: ContractUpRightRegular,
        metadata: {
            name: "contract",
            tags: ["navigation", "contract", "arrow"],
            description: "Contract icon",
            caption: "A diagonal arrow icon for contracting or minimizing content",
            keywords: ["contract", "arrow", "shrink", "minimize"],
        },
    },
    "expand-up-right": {
        svg: ExpandUpRightRegular,
        metadata: {
            name: "expand-up-right",
            tags: ["navigation", "expand", "arrow"],
            description: "Expand up right icon",
            caption: "A diagonal arrow icon pointing up and right for expanding content",
            keywords: ["expand", "arrow", "up", "right"],
        },
    },
    move: {
        svg: MoveIcon,
        metadata: {
            name: "move",
            tags: ["navigation", "move", "arrow"],
            description: "Move icon",
            caption: "A folder with arrow icon for moving or relocating files or content",
            keywords: ["move", "arrow", "relocate", "transfer"],
        },
    },
};
