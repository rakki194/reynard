/**
 * Hero Section Component
 * Main hero section with animated color orb
 */
import { Component } from "solid-js";
interface HeroSectionProps {
    colorVariations: {
        base: string;
        complementary: string;
    };
    animationFrame: number;
}
export declare const HeroSection: Component<HeroSectionProps>;
export {};
