/**
 * OKLCH Gradient Demonstrations
 * Creates gradient demonstrations from color variations
 */
export interface GradientDemosState {
    colorVariations: () => {
        base: string;
        lighter: string;
        darker: string;
        moreSaturated: string;
        lessSaturated: string;
        complementary: string;
        triadic1: string;
        triadic2: string;
    };
}
export declare const createGradientDemos: (state: GradientDemosState) => {
    gradientDemos: import("solid-js").Accessor<{
        name: string;
        gradient: string;
    }[]>;
};
