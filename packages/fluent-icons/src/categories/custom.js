/**
 * Custom Icons
 * Custom SVG icons from yipyap and other sources
 */
// Import custom SVG icons
import PeanutIcon from "../custom-icons/peanut.svg?raw";
import BananaIcon from "../custom-icons/banana.svg?raw";
import YipYapIcon from "../custom-icons/favicon.svg?raw";
import DeleteDatasetIcon from "../custom-icons/delete_dataset.svg?raw";
import StrawberryIcon from "../custom-icons/strawberry.svg?raw";
import RedStrawberryIcon from "../custom-icons/red-strawberry.svg?raw";
import GhostIcon from "../custom-icons/ghost.svg?raw";
import WdIcon from "../custom-icons/wd.svg?raw";
import GoldenIcon from "../custom-icons/golden.svg?raw";
import BloodSplatterIcon from "../custom-icons/blood-splatter.svg?raw";
export const customIcons = {
    peanut: {
        svg: PeanutIcon,
        metadata: {
            name: "peanut",
            tags: ["custom", "food", "theme"],
            description: "Peanut icon",
            caption: "A peanut icon representing food, nuts, or peanut-themed content",
            keywords: ["peanut", "food", "nut", "theme"],
        },
    },
    banana: {
        svg: BananaIcon,
        metadata: {
            name: "banana",
            tags: ["custom", "food", "theme"],
            description: "Banana icon",
            caption: "A banana icon representing food, fruits, or banana-themed content",
            keywords: ["banana", "food", "fruit", "theme"],
        },
    },
    yipyap: {
        svg: YipYapIcon,
        metadata: {
            name: "yipyap",
            tags: ["custom", "brand", "logo"],
            description: "YipYap favicon/logo",
            caption: "The YipYap brand logo and favicon representing the YipYap project or brand identity",
            keywords: ["yipyap", "logo", "brand", "favicon"],
        },
    },
    "delete-dataset": {
        svg: DeleteDatasetIcon,
        metadata: {
            name: "delete-dataset",
            tags: ["custom", "action", "data"],
            description: "Delete dataset icon",
            caption: "A custom delete dataset icon for removing or deleting data collections",
            keywords: ["delete", "dataset", "data", "remove"],
        },
    },
    trash: {
        svg: DeleteDatasetIcon,
        metadata: {
            name: "trash",
            tags: ["custom", "action", "delete"],
            description: "Trash icon",
            caption: "A custom trash icon for deleting, removing, or discarding items",
            keywords: ["trash", "delete", "remove", "garbage"],
        },
    },
    "delete-folder": {
        svg: DeleteDatasetIcon,
        metadata: {
            name: "delete-folder",
            tags: ["custom", "action", "folder"],
            description: "Delete folder icon",
            caption: "A custom delete folder icon for removing or deleting directories and folders",
            keywords: ["delete", "folder", "remove", "directory"],
        },
    },
    strawberry: {
        svg: StrawberryIcon,
        metadata: {
            name: "strawberry",
            tags: ["custom", "food", "theme"],
            description: "Strawberry icon",
            caption: "A strawberry icon representing food, fruits, or strawberry-themed content",
            keywords: ["strawberry", "food", "fruit", "theme"],
        },
    },
    "red-strawberry": {
        svg: RedStrawberryIcon,
        metadata: {
            name: "red-strawberry",
            tags: ["custom", "food", "theme"],
            description: "Red strawberry icon",
            caption: "A red strawberry icon representing ripe fruit, food, or red-themed content",
            keywords: ["strawberry", "red", "food", "fruit", "theme"],
        },
    },
    ghost: {
        svg: GhostIcon,
        metadata: {
            name: "ghost",
            tags: ["custom", "character", "spooky"],
            description: "Ghost icon",
            caption: "A ghost icon representing spooky characters, Halloween themes, or supernatural content",
            keywords: ["ghost", "spooky", "character", "halloween"],
        },
    },
    wd: {
        svg: WdIcon,
        metadata: {
            name: "wd",
            tags: ["custom", "brand", "model"],
            description: "WD (Waifu Diffusion) icon",
            caption: "A WD (Waifu Diffusion) model icon representing AI art generation or machine learning models",
            keywords: ["wd", "waifu", "diffusion", "model", "ai"],
        },
    },
    golden: {
        svg: GoldenIcon,
        metadata: {
            name: "golden",
            tags: ["custom", "color", "premium"],
            description: "Golden icon",
            caption: "A golden icon representing premium features, luxury, or gold-colored themes",
            keywords: ["golden", "gold", "premium", "color"],
        },
    },
    "blood-splatter": {
        svg: BloodSplatterIcon,
        metadata: {
            name: "blood-splatter",
            tags: ["custom", "effect", "gore"],
            description: "Blood splatter icon",
            caption: "A blood splatter icon representing gore effects, violence, or dramatic visual elements",
            keywords: ["blood", "splatter", "gore", "effect"],
        },
    },
};
