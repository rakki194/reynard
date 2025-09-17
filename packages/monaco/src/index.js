/**
 * reynard-monaco - Monaco code editor and text editing components for Reynard
 */
// Solid-Monaco Components (Forked and Updated)
export { MonacoEditor, MonacoDiffEditor } from "./solid-monaco";
export { loader } from "./solid-monaco";
// Reynard Components
export { CodeEditor } from "./components/CodeEditor";
// Composables
export { useShiki } from "./composables/useShiki";
export { useMonacoShiki } from "./composables/useMonacoShiki";
export { useReynardMonaco } from "./composables/useReynardMonaco";
export { useLanguageDetection } from "./composables/useLanguageDetection";
// Services
export { LanguageDetectionService, languageDetectionService, } from "./services/LanguageDetectionService";
// Utils
export { getMonacoLanguage, getLanguageDisplayName, isCodeFile, getLanguageInfo, getMonacoLanguageFromName, getDisplayNameFromLanguage, } from "./utils/languageUtils";
// Theme utilities
export { getMonacoThemeFromReynard, getShikiThemeFromReynard, isReynardThemeDark, getAvailableMonacoThemes, getAvailableShikiThemes, REYNARD_TO_MONACO_THEME_MAP, REYNARD_TO_SHIKI_THEME_MAP, } from "./utils/themeMapping";
// Custom Monaco themes
export { getCustomMonacoTheme, registerCustomMonacoTheme, getMonacoThemeName, } from "./utils/customThemes";
// Styles
import "./components/CodeEditor.css";
