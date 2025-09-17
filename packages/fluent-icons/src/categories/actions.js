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
            caption: "A filled circular plus sign icon used to add or create new items",
            keywords: ["add", "create", "new", "plus", "circle", "filled"],
        },
    },
    "add-circle": {
        svg: AddCircleRegular,
        metadata: {
            name: "add-circle",
            tags: ["action", "add", "create"],
            description: "Add circle icon",
            caption: "An outlined circular plus sign icon for adding or creating new items",
            keywords: ["add", "create", "new", "plus", "circle"],
        },
    },
    add: {
        svg: AddRegular,
        metadata: {
            name: "add",
            tags: ["action", "add", "create"],
            description: "Add icon",
            caption: "A simple plus sign icon for adding new items or content",
            keywords: ["add", "create", "new", "plus"],
        },
    },
    subtract: {
        svg: SubtractRegular,
        metadata: {
            name: "subtract",
            tags: ["action", "remove", "subtract"],
            description: "Subtract icon",
            caption: "A minus sign icon for removing or subtracting items",
            keywords: ["subtract", "remove", "minus", "delete"],
        },
    },
    delete: {
        svg: DeleteIcon,
        metadata: {
            name: "delete",
            tags: ["action", "destructive", "remove"],
            description: "Delete icon",
            caption: "A trash can icon for deleting or removing items permanently",
            keywords: ["delete", "remove", "trash", "destroy"],
        },
    },
    edit: {
        svg: EditIcon,
        metadata: {
            name: "edit",
            tags: ["action", "modify", "update"],
            description: "Edit icon",
            caption: "A pencil icon for editing, modifying, or updating content",
            keywords: ["edit", "modify", "update", "change", "pencil"],
        },
    },
    download: {
        svg: DownloadIcon,
        metadata: {
            name: "download",
            tags: ["action", "file", "transfer"],
            description: "Download icon",
            caption: "A downward arrow icon for downloading files or content from the internet",
            keywords: ["download", "save", "get", "arrow down"],
        },
    },
    upload: {
        svg: UploadIcon,
        metadata: {
            name: "upload",
            tags: ["action", "file", "transfer"],
            description: "Upload icon",
            caption: "A folder with upward arrow icon for uploading files to a server or cloud",
            keywords: ["upload", "send", "put", "arrow up"],
        },
    },
    save: {
        svg: SaveRegular,
        metadata: {
            name: "save",
            tags: ["action", "file", "persist"],
            description: "Save icon",
            caption: "A floppy disk icon for saving documents or data to storage",
            keywords: ["save", "store", "persist", "disk"],
        },
    },
    copy: {
        svg: CopyRegular,
        metadata: {
            name: "copy",
            tags: ["action", "duplicate", "clipboard"],
            description: "Copy icon",
            caption: "A document copy icon for duplicating content to the clipboard",
            keywords: ["copy", "duplicate", "clone", "clipboard"],
        },
    },
    undo: {
        svg: ArrowUndoIcon,
        metadata: {
            name: "undo",
            tags: ["action", "navigation", "history"],
            description: "Undo icon",
            caption: "A curved arrow icon for undoing the last action or going back",
            keywords: ["undo", "back", "reverse", "arrow"],
        },
    },
    refresh: {
        svg: ArrowClockwiseRegular,
        metadata: {
            name: "refresh",
            tags: ["action", "update", "reload"],
            description: "Refresh icon",
            caption: "A clockwise circular arrow icon for refreshing or reloading content",
            keywords: ["refresh", "reload", "update", "arrow clockwise"],
        },
    },
    shuffle: {
        svg: ArrowShuffleRegular,
        metadata: {
            name: "shuffle",
            tags: ["action", "random", "mix"],
            description: "Shuffle icon",
            caption: "A crossed arrow icon for shuffling or randomizing content order",
            keywords: ["shuffle", "random", "mix", "arrow"],
        },
    },
    repeat: {
        svg: ArrowRepeatAllRegular,
        metadata: {
            name: "repeat",
            tags: ["action", "loop", "cycle"],
            description: "Repeat icon",
            caption: "A circular arrow icon for repeating or looping content",
            keywords: ["repeat", "loop", "cycle", "arrow"],
        },
    },
    dismiss: {
        svg: DismissIcon,
        metadata: {
            name: "dismiss",
            tags: ["action", "close", "cancel"],
            description: "Dismiss icon",
            caption: "An X mark icon for dismissing, closing, or canceling dialogs",
            keywords: ["dismiss", "close", "cancel", "x"],
        },
    },
    check: {
        svg: CheckIcon,
        metadata: {
            name: "check",
            tags: ["action", "confirm", "success"],
            description: "Check icon",
            caption: "A checkmark in a circle icon for confirming or marking success",
            keywords: ["check", "confirm", "success", "checkmark"],
        },
    },
    "check-all": {
        svg: CheckAllIcon,
        metadata: {
            name: "check-all",
            tags: ["action", "select", "multiple"],
            description: "Check all icon",
            caption: "A checkmark icon for selecting or confirming all items at once",
            keywords: ["check all", "select all", "multiple", "checkmark"],
        },
    },
    checkmark: {
        svg: SuccessIcon,
        metadata: {
            name: "checkmark",
            tags: ["action", "confirm", "success"],
            description: "Checkmark icon",
            caption: "A simple checkmark icon for indicating completion or success",
            keywords: ["checkmark", "success", "confirm", "done"],
        },
    },
    clean: {
        svg: BroomSparkleRegular,
        metadata: {
            name: "clean",
            tags: ["action", "cleanup", "sparkle"],
            description: "Clean icon",
            caption: "A broom with sparkles icon for cleaning up or organizing content",
            keywords: ["clean", "broom", "sparkle", "cleanup"],
        },
    },
    "clear-formatting": {
        svg: ClearFormattingRegular,
        metadata: {
            name: "clear-formatting",
            tags: ["action", "text", "format"],
            description: "Clear formatting icon",
            caption: "A text formatting icon with strikethrough for removing text formatting",
            keywords: ["clear", "formatting", "text", "remove"],
        },
    },
};
