/**
 * reynard-monaco - Monaco code editor and text editing components for Reynard
 */
export { MonacoEditor, MonacoDiffEditor } from "./solid-monaco";
export type { MonacoEditorProps } from "./solid-monaco/MonacoEditor";
export { loader } from "./solid-monaco";
export { CodeEditor } from "./components/CodeEditor";
export { useShiki } from "./composables/useShiki";
export { useMonacoShiki } from "./composables/useMonacoShiki";
export { useReynardMonaco } from "./composables/useReynardMonaco";
export { useLanguageDetection } from "./composables/useLanguageDetection";
export { LanguageDetectionService, languageDetectionService, } from "./services/LanguageDetectionService";
export { getMonacoLanguage, getLanguageDisplayName, isCodeFile, getLanguageInfo, getMonacoLanguageFromName, getDisplayNameFromLanguage, } from "./utils/languageUtils";
export { getMonacoThemeFromReynard, getShikiThemeFromReynard, isReynardThemeDark, getAvailableMonacoThemes, getAvailableShikiThemes, REYNARD_TO_MONACO_THEME_MAP, REYNARD_TO_SHIKI_THEME_MAP, } from "./utils/themeMapping";
export { getCustomMonacoTheme, registerCustomMonacoTheme, getMonacoThemeName, } from "./utils/customThemes";
export type { LanguageInfo, AnalysisIssue, AnalysisResult, ExecutionOutput, ExecutionResult, BuildCommand, MonacoShikiOptions, MonacoShikiState, ShikiOptions, ShikiState, NaturalLanguageDetectionResult, UseLanguageDetectionReturn, } from "./types";
export type { ReynardMonacoOptions, ReynardMonacoState, } from "./composables/useReynardMonaco";
import "./components/CodeEditor.css";
