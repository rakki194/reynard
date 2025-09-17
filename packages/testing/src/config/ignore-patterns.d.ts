/**
 * Shared Ignore Patterns for i18n Testing
 * Common patterns to ignore when scanning for hardcoded strings
 */
export declare const BASE_IGNORE_PATTERNS: string[];
export declare const DOMAIN_SPECIFIC_PATTERNS: {
    readonly auth: readonly ["token", "jwt", "oauth", "saml", "ldap"];
    readonly chat: readonly ["message", "chat", "conversation", "thread"];
    readonly gallery: readonly ["image", "photo", "gallery", "album"];
    readonly settings: readonly ["setting", "config", "preference"];
    readonly themes: readonly ["theme", "color", "palette", "dark", "light"];
    readonly charts: readonly ["chart", "graph", "plot", "axis", "series", "data"];
    readonly floatingPanel: readonly ["panel", "modal", "dialog", "popup"];
    readonly caption: readonly ["caption", "annotation", "label"];
    readonly boundingBox: readonly ["bbox", "bounding", "box", "rectangle"];
    readonly audio: readonly ["audio", "sound", "music", "play", "pause", "stop", "volume"];
    readonly video: readonly ["video", "movie", "film", "play", "pause", "stop", "volume"];
    readonly image: readonly ["image", "photo", "picture", "img"];
    readonly multimodal: readonly ["multimodal", "media", "content"];
    readonly rag: readonly ["rag", "retrieval", "augmented", "generation", "search", "query"];
    readonly monaco: readonly ["monaco", "editor", "code", "syntax", "highlight"];
    readonly threeD: readonly ["3d", "three", "webgl", "mesh", "model", "scene", "camera", "light"];
    readonly games: readonly ["game", "play", "score", "level", "player", "enemy"];
    readonly i18n: readonly ["locale", "translation", "i18n", "plural", "rtl", "ltr"];
    readonly core: readonly ["core", "base", "foundation", "utility", "util", "common", "shared", "base", "client", "composable", "module", "executor", "security", "validation", "crypto", "storage", "cache", "lazy", "export", "registry"];
};
/**
 * Create ignore patterns for a specific domain
 */
export declare function createIgnorePatterns(domain?: keyof typeof DOMAIN_SPECIFIC_PATTERNS): string[];
