/**
 * Action Icons
 * Icons for user actions like add, delete, edit, etc.
 */

// Import Fluent UI action icons
import AddCircleFilled from "@fluentui/svg-icons/icons/add_circle_24_filled.svg?raw";
import AddCircleRegular from "@fluentui/svg-icons/icons/add_circle_24_regular.svg?raw";
import AddRegular from "@fluentui/svg-icons/icons/add_24_regular.svg?raw";
import SubtractRegular from "@fluentui/svg-icons/icons/subtract_24_regular.svg?raw";
import DeleteIcon from "@fluentui/svg-icons/icons/delete_24_regular.svg?raw";
import EditIcon from "@fluentui/svg-icons/icons/edit_24_regular.svg?raw";
import DownloadIcon from "@fluentui/svg-icons/icons/arrow_download_24_regular.svg?raw";
import UploadIcon from "@fluentui/svg-icons/icons/folder_arrow_up_24_regular.svg?raw";
import SaveRegular from "@fluentui/svg-icons/icons/save_16_regular.svg?raw";
import CopyRegular from "@fluentui/svg-icons/icons/copy_24_regular.svg?raw";
import ArrowUndoIcon from "@fluentui/svg-icons/icons/arrow_undo_24_regular.svg?raw";
import ArrowClockwiseRegular from "@fluentui/svg-icons/icons/arrow_clockwise_24_regular.svg?raw";
import ArrowShuffleRegular from "@fluentui/svg-icons/icons/arrow_shuffle_24_regular.svg?raw";
import ArrowRepeatAllRegular from "@fluentui/svg-icons/icons/arrow_repeat_all_24_regular.svg?raw";
import DismissIcon from "@fluentui/svg-icons/icons/dismiss_24_regular.svg?raw";
import CheckIcon from "@fluentui/svg-icons/icons/checkmark_circle_24_regular.svg?raw";
import CheckAllIcon from "@fluentui/svg-icons/icons/multiselect_rtl_24_regular.svg?raw";
import SuccessIcon from "@fluentui/svg-icons/icons/checkmark_24_regular.svg?raw";
import BroomSparkleRegular from "@fluentui/svg-icons/icons/broom_sparkle_20_regular.svg?raw";
import ClearFormattingRegular from "@fluentui/svg-icons/icons/clear_formatting_24_regular.svg?raw";

export const actionIcons = {
  "add-circle-filled": {
    svg: AddCircleFilled,
    metadata: {
      name: "add-circle-filled",
      tags: ["action", "add", "create"],
      description: "Add circle icon (filled)",
      keywords: ["add", "create", "new", "plus", "circle", "filled"],
    },
  },
  "add-circle": {
    svg: AddCircleRegular,
    metadata: {
      name: "add-circle",
      tags: ["action", "add", "create"],
      description: "Add circle icon",
      keywords: ["add", "create", "new", "plus", "circle"],
    },
  },
  add: {
    svg: AddRegular,
    metadata: {
      name: "add",
      tags: ["action", "add", "create"],
      description: "Add icon",
      keywords: ["add", "create", "new", "plus"],
    },
  },
  subtract: {
    svg: SubtractRegular,
    metadata: {
      name: "subtract",
      tags: ["action", "remove", "subtract"],
      description: "Subtract icon",
      keywords: ["subtract", "remove", "minus", "delete"],
    },
  },
  delete: {
    svg: DeleteIcon,
    metadata: {
      name: "delete",
      tags: ["action", "destructive", "remove"],
      description: "Delete icon",
      keywords: ["delete", "remove", "trash", "destroy"],
    },
  },
  edit: {
    svg: EditIcon,
    metadata: {
      name: "edit",
      tags: ["action", "modify", "update"],
      description: "Edit icon",
      keywords: ["edit", "modify", "update", "change", "pencil"],
    },
  },
  download: {
    svg: DownloadIcon,
    metadata: {
      name: "download",
      tags: ["action", "file", "transfer"],
      description: "Download icon",
      keywords: ["download", "save", "get", "arrow down"],
    },
  },
  upload: {
    svg: UploadIcon,
    metadata: {
      name: "upload",
      tags: ["action", "file", "transfer"],
      description: "Upload icon",
      keywords: ["upload", "send", "put", "arrow up"],
    },
  },
  save: {
    svg: SaveRegular,
    metadata: {
      name: "save",
      tags: ["action", "file", "persist"],
      description: "Save icon",
      keywords: ["save", "store", "persist", "disk"],
    },
  },
  copy: {
    svg: CopyRegular,
    metadata: {
      name: "copy",
      tags: ["action", "duplicate", "clipboard"],
      description: "Copy icon",
      keywords: ["copy", "duplicate", "clone", "clipboard"],
    },
  },
  undo: {
    svg: ArrowUndoIcon,
    metadata: {
      name: "undo",
      tags: ["action", "navigation", "history"],
      description: "Undo icon",
      keywords: ["undo", "back", "reverse", "arrow"],
    },
  },
  refresh: {
    svg: ArrowClockwiseRegular,
    metadata: {
      name: "refresh",
      tags: ["action", "update", "reload"],
      description: "Refresh icon",
      keywords: ["refresh", "reload", "update", "arrow clockwise"],
    },
  },
  shuffle: {
    svg: ArrowShuffleRegular,
    metadata: {
      name: "shuffle",
      tags: ["action", "random", "mix"],
      description: "Shuffle icon",
      keywords: ["shuffle", "random", "mix", "arrow"],
    },
  },
  repeat: {
    svg: ArrowRepeatAllRegular,
    metadata: {
      name: "repeat",
      tags: ["action", "loop", "cycle"],
      description: "Repeat icon",
      keywords: ["repeat", "loop", "cycle", "arrow"],
    },
  },
  dismiss: {
    svg: DismissIcon,
    metadata: {
      name: "dismiss",
      tags: ["action", "close", "cancel"],
      description: "Dismiss icon",
      keywords: ["dismiss", "close", "cancel", "x"],
    },
  },
  check: {
    svg: CheckIcon,
    metadata: {
      name: "check",
      tags: ["action", "confirm", "success"],
      description: "Check icon",
      keywords: ["check", "confirm", "success", "checkmark"],
    },
  },
  "check-all": {
    svg: CheckAllIcon,
    metadata: {
      name: "check-all",
      tags: ["action", "select", "multiple"],
      description: "Check all icon",
      keywords: ["check all", "select all", "multiple", "checkmark"],
    },
  },
  checkmark: {
    svg: SuccessIcon,
    metadata: {
      name: "checkmark",
      tags: ["action", "confirm", "success"],
      description: "Checkmark icon",
      keywords: ["checkmark", "success", "confirm", "done"],
    },
  },
  clean: {
    svg: BroomSparkleRegular,
    metadata: {
      name: "clean",
      tags: ["action", "cleanup", "sparkle"],
      description: "Clean icon",
      keywords: ["clean", "broom", "sparkle", "cleanup"],
    },
  },
  "clear-formatting": {
    svg: ClearFormattingRegular,
    metadata: {
      name: "clear-formatting",
      tags: ["action", "text", "format"],
      description: "Clear formatting icon",
      keywords: ["clear", "formatting", "text", "remove"],
    },
  },
} as const;
