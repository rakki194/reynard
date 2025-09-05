/**
 * Interface and UI Icons
 * Icons for user interface elements, controls, and interactions
 */

// Import Fluent UI interface icons
import SettingsIcon from "@fluentui/svg-icons/icons/settings_24_regular.svg?raw";
import SearchIcon from "@fluentui/svg-icons/icons/search_24_regular.svg?raw";
import FilterIcon from "@fluentui/svg-icons/icons/filter_24_regular.svg?raw";
import GridRegular from "@fluentui/svg-icons/icons/grid_24_regular.svg?raw";
import ListRegular from "@fluentui/svg-icons/icons/list_24_regular.svg?raw";
import EyeIcon from "@fluentui/svg-icons/icons/eye_24_regular.svg?raw";
import EyeOffIcon from "@fluentui/svg-icons/icons/eye_off_24_regular.svg?raw";
import BoundingBoxIcon from "@fluentui/svg-icons/icons/rectangle_landscape_24_regular.svg?raw";
import LayerRegular from "@fluentui/svg-icons/icons/layer_24_regular.svg?raw";
import WindowBrushRegular from "@fluentui/svg-icons/icons/window_brush_24_regular.svg?raw";
import DashboardRegular from "@fluentui/svg-icons/icons/grid_dots_24_regular.svg?raw";
import ChatEmptyRegular from "@fluentui/svg-icons/icons/chat_empty_24_regular.svg?raw";
import ChartMultipleRegular from "@fluentui/svg-icons/icons/chart_multiple_24_regular.svg?raw";
import TableSimpleRegular from "@fluentui/svg-icons/icons/table_simple_24_regular.svg?raw";
import TableSimpleMultipleRegular from "@fluentui/svg-icons/icons/table_simple_multiple_24_regular.svg?raw";
import BoxRegular from "@fluentui/svg-icons/icons/box_24_regular.svg?raw";
import OpenRegular from "@fluentui/svg-icons/icons/open_24_regular.svg?raw";
import Space3dRegular from "@fluentui/svg-icons/icons/space_3d_24_regular.svg?raw";
import FlowRegular from "@fluentui/svg-icons/icons/flow_24_regular.svg?raw";
import ServerRegular from "@fluentui/svg-icons/icons/server_24_regular.svg?raw";
import ServiceBellRegular from "@fluentui/svg-icons/icons/service_bell_24_regular.svg?raw";
import MegaphoneRegular from "@fluentui/svg-icons/icons/megaphone_24_regular.svg?raw";
// Reaction icons
import ThumbLikeRegular from "@fluentui/svg-icons/icons/thumb_like_24_regular.svg?raw";
import ThumbLikeFilled from "@fluentui/svg-icons/icons/thumb_like_24_filled.svg?raw";
import ThumbDislikeRegular from "@fluentui/svg-icons/icons/thumb_dislike_24_regular.svg?raw";
import ThumbDislikeFilled from "@fluentui/svg-icons/icons/thumb_dislike_24_filled.svg?raw";
import HeartRegular from "@fluentui/svg-icons/icons/heart_24_regular.svg?raw";
import HeartFilled from "@fluentui/svg-icons/icons/heart_24_filled.svg?raw";
import HeartColor from "@fluentui/svg-icons/icons/heart_24_color.svg?raw";
import EmojiLaughRegular from "@fluentui/svg-icons/icons/emoji_laugh_24_regular.svg?raw";
import EmojiLaughFilled from "@fluentui/svg-icons/icons/emoji_laugh_24_filled.svg?raw";
import EmojiSurpriseRegular from "@fluentui/svg-icons/icons/emoji_surprise_24_regular.svg?raw";
import EmojiSurpriseFilled from "@fluentui/svg-icons/icons/emoji_surprise_24_filled.svg?raw";
import EmojiSadRegular from "@fluentui/svg-icons/icons/emoji_sad_24_regular.svg?raw";
import EmojiSadFilled from "@fluentui/svg-icons/icons/emoji_sad_24_filled.svg?raw";
import EmojiAngryRegular from "@fluentui/svg-icons/icons/emoji_angry_24_regular.svg?raw";
import EmojiAngryFilled from "@fluentui/svg-icons/icons/emoji_angry_24_filled.svg?raw";
import EmojiSparkleRegular from "@fluentui/svg-icons/icons/emoji_sparkle_24_regular.svg?raw";
import EmojiSparkleFilled from "@fluentui/svg-icons/icons/emoji_sparkle_24_filled.svg?raw";
import EmojiRegular from "@fluentui/svg-icons/icons/emoji_24_regular.svg?raw";
import EmojiFilled from "@fluentui/svg-icons/icons/emoji_24_filled.svg?raw";

export const interfaceIcons = {
  settings: {
    svg: SettingsIcon,
    metadata: {
      name: "settings",
      tags: ["interface", "configuration", "preferences"],
      description: "Settings icon",
      keywords: ["settings", "configuration", "preferences", "gear"],
    },
  },
  search: {
    svg: SearchIcon,
    metadata: {
      name: "search",
      tags: ["interface", "search", "find"],
      description: "Search icon",
      keywords: ["search", "find", "magnifying glass", "lookup"],
    },
  },
  filter: {
    svg: FilterIcon,
    metadata: {
      name: "filter",
      tags: ["interface", "filter", "sort"],
      description: "Filter icon",
      keywords: ["filter", "sort", "funnel", "refine"],
    },
  },
  grid: {
    svg: GridRegular,
    metadata: {
      name: "grid",
      tags: ["interface", "layout", "view"],
      description: "Grid icon",
      keywords: ["grid", "layout", "view", "squares"],
    },
  },
  list: {
    svg: ListRegular,
    metadata: {
      name: "list",
      tags: ["interface", "layout", "view"],
      description: "List icon",
      keywords: ["list", "layout", "view", "lines"],
    },
  },
  eye: {
    svg: EyeIcon,
    metadata: {
      name: "eye",
      tags: ["interface", "visibility", "view"],
      description: "Eye icon",
      keywords: ["eye", "view", "visibility", "see"],
    },
  },
  "eye-off": {
    svg: EyeOffIcon,
    metadata: {
      name: "eye-off",
      tags: ["interface", "visibility", "hide"],
      description: "Eye off icon",
      keywords: ["eye", "off", "hide", "invisible"],
    },
  },
  "bounding-box": {
    svg: BoundingBoxIcon,
    metadata: {
      name: "bounding-box",
      tags: ["interface", "selection", "box"],
      description: "Bounding box icon",
      keywords: ["bounding", "box", "selection", "rectangle"],
    },
  },
  layer: {
    svg: LayerRegular,
    metadata: {
      name: "layer",
      tags: ["interface", "layers", "stack"],
      description: "Layer icon",
      keywords: ["layer", "layers", "stack", "overlay"],
    },
  },
  "window-brush": {
    svg: WindowBrushRegular,
    metadata: {
      name: "window-brush",
      tags: ["interface", "window", "brush"],
      description: "Window brush icon",
      keywords: ["window", "brush", "paint", "tool"],
    },
  },
  dashboard: {
    svg: DashboardRegular,
    metadata: {
      name: "dashboard",
      tags: ["interface", "dashboard", "overview"],
      description: "Dashboard icon",
      keywords: ["dashboard", "overview", "grid", "dots"],
    },
  },
  chat: {
    svg: ChatEmptyRegular,
    metadata: {
      name: "chat",
      tags: ["interface", "chat", "communication"],
      description: "Chat icon",
      keywords: ["chat", "message", "communication", "bubble"],
    },
  },
  chart: {
    svg: ChartMultipleRegular,
    metadata: {
      name: "chart",
      tags: ["interface", "chart", "data"],
      description: "Chart icon",
      keywords: ["chart", "graph", "data", "multiple"],
    },
  },
  table: {
    svg: TableSimpleRegular,
    metadata: {
      name: "table",
      tags: ["interface", "table", "data"],
      description: "Table icon",
      keywords: ["table", "data", "grid", "rows"],
    },
  },
  model: {
    svg: TableSimpleMultipleRegular,
    metadata: {
      name: "model",
      tags: ["interface", "model", "data"],
      description: "Model icon",
      keywords: ["model", "data", "table", "multiple"],
    },
  },
  box: {
    svg: BoxRegular,
    metadata: {
      name: "box",
      tags: ["interface", "container", "box"],
      description: "Box icon",
      keywords: ["box", "container", "package", "cube"],
    },
  },
  open: {
    svg: OpenRegular,
    metadata: {
      name: "open",
      tags: ["interface", "open", "external"],
      description: "Open icon",
      keywords: ["open", "external", "link", "arrow"],
    },
  },
  "3d": {
    svg: Space3dRegular,
    metadata: {
      name: "3d",
      tags: ["interface", "3d", "space"],
      description: "3D space icon",
      keywords: ["3d", "space", "dimension", "cube"],
    },
  },
  flow: {
    svg: FlowRegular,
    metadata: {
      name: "flow",
      tags: ["interface", "flow", "process"],
      description: "Flow icon",
      keywords: ["flow", "process", "workflow", "diagram"],
    },
  },
  server: {
    svg: ServerRegular,
    metadata: {
      name: "server",
      tags: ["interface", "server", "backend"],
      description: "Server icon",
      keywords: ["server", "backend", "computer", "host"],
    },
  },
  "service-bell": {
    svg: ServiceBellRegular,
    metadata: {
      name: "service-bell",
      tags: ["interface", "notification", "bell"],
      description: "Service bell icon",
      keywords: ["service", "bell", "notification", "alert"],
    },
  },
  megaphone: {
    svg: MegaphoneRegular,
    metadata: {
      name: "megaphone",
      tags: ["interface", "announcement", "speaker"],
      description: "Megaphone icon",
      keywords: ["megaphone", "announcement", "speaker", "broadcast"],
    },
  },
  // Reaction icons
  "thumbs-up": {
    svg: ThumbLikeRegular,
    metadata: {
      name: "thumbs-up",
      tags: ["interface", "reaction", "like", "positive"],
      description: "Thumbs up icon",
      keywords: ["thumbs", "up", "like", "positive", "approve", "good"],
    },
  },
  "thumbs-up-filled": {
    svg: ThumbLikeFilled,
    metadata: {
      name: "thumbs-up-filled",
      tags: ["interface", "reaction", "like", "positive"],
      description: "Thumbs up filled icon",
      keywords: [
        "thumbs",
        "up",
        "like",
        "positive",
        "approve",
        "good",
        "filled",
      ],
    },
  },
  "thumbs-down": {
    svg: ThumbDislikeRegular,
    metadata: {
      name: "thumbs-down",
      tags: ["interface", "reaction", "dislike", "negative"],
      description: "Thumbs down icon",
      keywords: ["thumbs", "down", "dislike", "negative", "disapprove", "bad"],
    },
  },
  "thumbs-down-filled": {
    svg: ThumbDislikeFilled,
    metadata: {
      name: "thumbs-down-filled",
      tags: ["interface", "reaction", "dislike", "negative"],
      description: "Thumbs down filled icon",
      keywords: [
        "thumbs",
        "down",
        "dislike",
        "negative",
        "disapprove",
        "bad",
        "filled",
      ],
    },
  },
  heart: {
    svg: HeartRegular,
    metadata: {
      name: "heart",
      tags: ["interface", "reaction", "love", "favorite"],
      description: "Heart icon",
      keywords: ["heart", "love", "favorite", "like", "emotion"],
    },
  },
  "heart-filled": {
    svg: HeartFilled,
    metadata: {
      name: "heart-filled",
      tags: ["interface", "reaction", "love", "favorite"],
      description: "Heart filled icon",
      keywords: ["heart", "love", "favorite", "like", "emotion", "filled"],
    },
  },
  "heart-color": {
    svg: HeartColor,
    metadata: {
      name: "heart-color",
      tags: ["interface", "reaction", "love", "favorite"],
      description: "Heart color icon",
      keywords: ["heart", "love", "favorite", "like", "emotion", "color"],
    },
  },
  "emoji-laugh": {
    svg: EmojiLaughRegular,
    metadata: {
      name: "emoji-laugh",
      tags: ["interface", "reaction", "emoji", "laugh", "happy"],
      description: "Laughing emoji icon",
      keywords: ["emoji", "laugh", "laughing", "happy", "joy", "funny"],
    },
  },
  "emoji-laugh-filled": {
    svg: EmojiLaughFilled,
    metadata: {
      name: "emoji-laugh-filled",
      tags: ["interface", "reaction", "emoji", "laugh", "happy"],
      description: "Laughing emoji filled icon",
      keywords: [
        "emoji",
        "laugh",
        "laughing",
        "happy",
        "joy",
        "funny",
        "filled",
      ],
    },
  },
  "emoji-surprised": {
    svg: EmojiSurpriseRegular,
    metadata: {
      name: "emoji-surprised",
      tags: ["interface", "reaction", "emoji", "surprised", "shock"],
      description: "Surprised emoji icon",
      keywords: ["emoji", "surprised", "shock", "wow", "amazed", "astonished"],
    },
  },
  "emoji-surprised-filled": {
    svg: EmojiSurpriseFilled,
    metadata: {
      name: "emoji-surprised-filled",
      tags: ["interface", "reaction", "emoji", "surprised", "shock"],
      description: "Surprised emoji filled icon",
      keywords: [
        "emoji",
        "surprised",
        "shock",
        "wow",
        "amazed",
        "astonished",
        "filled",
      ],
    },
  },
  "emoji-sad": {
    svg: EmojiSadRegular,
    metadata: {
      name: "emoji-sad",
      tags: ["interface", "reaction", "emoji", "sad", "unhappy"],
      description: "Sad emoji icon",
      keywords: ["emoji", "sad", "unhappy", "cry", "depressed", "down"],
    },
  },
  "emoji-sad-filled": {
    svg: EmojiSadFilled,
    metadata: {
      name: "emoji-sad-filled",
      tags: ["interface", "reaction", "emoji", "sad", "unhappy"],
      description: "Sad emoji filled icon",
      keywords: [
        "emoji",
        "sad",
        "unhappy",
        "cry",
        "depressed",
        "down",
        "filled",
      ],
    },
  },
  "emoji-angry": {
    svg: EmojiAngryRegular,
    metadata: {
      name: "emoji-angry",
      tags: ["interface", "reaction", "emoji", "angry", "mad"],
      description: "Angry emoji icon",
      keywords: ["emoji", "angry", "mad", "furious", "rage", "upset"],
    },
  },
  "emoji-angry-filled": {
    svg: EmojiAngryFilled,
    metadata: {
      name: "emoji-angry-filled",
      tags: ["interface", "reaction", "emoji", "angry", "mad"],
      description: "Angry emoji filled icon",
      keywords: ["emoji", "angry", "mad", "furious", "rage", "upset", "filled"],
    },
  },
  "party-popper": {
    svg: EmojiSparkleRegular,
    metadata: {
      name: "party-popper",
      tags: ["interface", "reaction", "emoji", "celebration", "party"],
      description: "Party popper emoji icon",
      keywords: [
        "emoji",
        "party",
        "popper",
        "celebration",
        "sparkle",
        "confetti",
        "fun",
      ],
    },
  },
  "party-popper-filled": {
    svg: EmojiSparkleFilled,
    metadata: {
      name: "party-popper-filled",
      tags: ["interface", "reaction", "emoji", "celebration", "party"],
      description: "Party popper emoji filled icon",
      keywords: [
        "emoji",
        "party",
        "popper",
        "celebration",
        "sparkle",
        "confetti",
        "fun",
        "filled",
      ],
    },
  },
  emoji: {
    svg: EmojiRegular,
    metadata: {
      name: "emoji",
      tags: ["interface", "reaction", "emoji", "general"],
      description: "Generic emoji icon",
      keywords: ["emoji", "emoticon", "expression", "face", "general"],
    },
  },
  "emoji-filled": {
    svg: EmojiFilled,
    metadata: {
      name: "emoji-filled",
      tags: ["interface", "reaction", "emoji", "general"],
      description: "Generic emoji filled icon",
      keywords: [
        "emoji",
        "emoticon",
        "expression",
        "face",
        "general",
        "filled",
      ],
    },
  },
} as const;
