export interface IconProps {
    name: string;
    packageId?: string;
    size?: "sm" | "md" | "lg" | "xl" | number;
    variant?: "filled" | "regular";
    class?: string;
    style?: any;
    role?: "img" | "button" | "presentation";
    "aria-label"?: string;
    "aria-hidden"?: boolean;
    title?: string;
    active?: boolean;
    loading?: boolean;
    progress?: number;
    glow?: boolean;
    glowColor?: string;
    tooltip?: string;
    interactive?: boolean;
    onClick?: (event: MouseEvent) => void;
}
/**
 * Enhanced Icon component for displaying SVG icons with advanced features
 */
export declare const Icon: (props: IconProps) => any;
export declare const Search: (props: Omit<IconProps, "name">) => any;
export declare const Upload: (props: Omit<IconProps, "name">) => any;
export declare const FileText: (props: Omit<IconProps, "name">) => any;
export declare const Code: (props: Omit<IconProps, "name">) => any;
export declare const Database: (props: Omit<IconProps, "name">) => any;
export declare const Settings: (props: Omit<IconProps, "name">) => any;
export declare const Download: (props: Omit<IconProps, "name">) => any;
export declare const Trash2: (props: Omit<IconProps, "name">) => any;
export declare const Eye: (props: Omit<IconProps, "name">) => any;
export declare const Clock: (props: Omit<IconProps, "name">) => any;
export declare const Zap: (props: Omit<IconProps, "name">) => any;
export declare const Brain: (props: Omit<IconProps, "name">) => any;
