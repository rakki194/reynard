/**
 * OKLCH Theme Tag Colors
 * Generates theme-specific tag colors using the themes package
 */
import { type Accessor } from "solid-js";
import { type ThemeName } from "reynard-themes";
export interface ThemeTagsState {
    tagIntensity: Accessor<number>;
}
export declare const createThemeTags: (state: ThemeTagsState) => {
    sampleTags: string[];
    availableThemes: ThemeName[];
    themeTagColors: Accessor<{
        tag: string;
        colors: {
            theme: ThemeName;
            color: import("reynard-colors").OKLCHColor;
        }[];
    }[]>;
};
