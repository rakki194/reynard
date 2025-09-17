/**
 * Custom Monaco Editor themes that match Reynard theme colors
 * These themes provide better integration with Reynard's design system
 */

import type { editor } from "monaco-editor";

/**
 * Get custom Monaco theme definition for a Reynard theme
 * @param reynardTheme - The Reynard theme name
 * @returns Monaco theme definition or null if no custom theme exists
 */
export const getCustomMonacoTheme = (reynardTheme: string): editor.IStandaloneThemeData | null => {
  switch (reynardTheme) {
    case "strawberry":
      return getStrawberryTheme();
    case "banana":
      return getBananaTheme();
    case "peanut":
      return getPeanutTheme();
    case "gray":
      return getGrayTheme();
    default:
      return null;
  }
};

/**
 * Strawberry theme - Pink/rose colored theme
 */
const getStrawberryTheme = (): editor.IStandaloneThemeData => ({
  base: "vs", // Light base
  inherit: true,
  rules: [
    { token: "comment", foreground: "#6a6a6a", fontStyle: "italic" },
    { token: "keyword", foreground: "#e91e63", fontStyle: "bold" },
    { token: "string", foreground: "#c2185b" },
    { token: "number", foreground: "#ad1457" },
    { token: "regexp", foreground: "#880e4f" },
    { token: "operator", foreground: "#e91e63" },
    { token: "namespace", foreground: "#c2185b" },
    { token: "type", foreground: "#ad1457", fontStyle: "bold" },
    { token: "struct", foreground: "#ad1457" },
    { token: "class", foreground: "#ad1457", fontStyle: "bold" },
    { token: "interface", foreground: "#ad1457", fontStyle: "bold" },
    { token: "parameter", foreground: "#e91e63" },
    { token: "variable", foreground: "#e91e63" },
    { token: "function", foreground: "#c2185b", fontStyle: "bold" },
    { token: "method", foreground: "#c2185b", fontStyle: "bold" },
    { token: "property", foreground: "#e91e63" },
    { token: "constant", foreground: "#880e4f", fontStyle: "bold" },
    { token: "enum", foreground: "#ad1457" },
    { token: "enumMember", foreground: "#ad1457" },
    { token: "decorator", foreground: "#e91e63" },
    { token: "tag", foreground: "#c2185b" },
    { token: "attribute.name", foreground: "#e91e63" },
    { token: "attribute.value", foreground: "#c2185b" },
    { token: "delimiter", foreground: "#6a6a6a" },
    { token: "delimiter.bracket", foreground: "#6a6a6a" },
    { token: "delimiter.parenthesis", foreground: "#6a6a6a" },
    { token: "delimiter.square", foreground: "#6a6a6a" },
    { token: "delimiter.angle", foreground: "#6a6a6a" },
    { token: "delimiter.curly", foreground: "#6a6a6a" },
  ],
  colors: {
    "editor.background": "#fce4ec",
    "editor.foreground": "#2c2c2c",
    "editorLineNumber.foreground": "#e91e63",
    "editorLineNumber.activeForeground": "#c2185b",
    "editor.selectionBackground": "#f8bbd9",
    "editor.selectionHighlightBackground": "#f8bbd9",
    "editor.lineHighlightBackground": "#f8bbd9",
    "editorCursor.foreground": "#e91e63",
    "editorWhitespace.foreground": "#f48fb1",
    "editorIndentGuide.background": "#f48fb1",
    "editorIndentGuide.activeBackground": "#e91e63",
    "editorBracketMatch.background": "#f8bbd9",
    "editorBracketMatch.border": "#e91e63",
    "editor.findMatchBackground": "#f8bbd9",
    "editor.findMatchHighlightBackground": "#f8bbd9",
    "editor.hoverHighlightBackground": "#f8bbd9",
    "editor.wordHighlightBackground": "#f8bbd9",
    "editor.wordHighlightStrongBackground": "#f8bbd9",
    "editorLink.activeForeground": "#c2185b",
    "editorWidget.background": "#ffffff",
    "editorWidget.border": "#e91e63",
    "editorSuggestWidget.background": "#ffffff",
    "editorSuggestWidget.border": "#e91e63",
    "editorSuggestWidget.foreground": "#2c2c2c",
    "editorSuggestWidget.highlightForeground": "#c2185b",
    "editorSuggestWidget.selectedBackground": "#f8bbd9",
    "editorHoverWidget.background": "#ffffff",
    "editorHoverWidget.border": "#e91e63",
    "editorHoverWidget.foreground": "#2c2c2c",
    "editorMarkerNavigation.background": "#ffffff",
    "editorMarkerNavigationError.background": "#ffebee",
    "editorMarkerNavigationWarning.background": "#fff3e0",
    "editorMarkerNavigationInfo.background": "#e3f2fd",
    "editorError.foreground": "#d32f2f",
    "editorWarning.foreground": "#f57c00",
    "editorInfo.foreground": "#1976d2",
    "editorGutter.background": "#fce4ec",
    "editorGutter.modifiedBackground": "#e91e63",
    "editorGutter.addedBackground": "#4caf50",
    "editorGutter.deletedBackground": "#f44336",
    "editorOverviewRuler.border": "#e91e63",
    "editorOverviewRuler.findMatchForeground": "#f8bbd9",
    "editorOverviewRuler.rangeHighlightForeground": "#f8bbd9",
    "editorOverviewRuler.selectionHighlightForeground": "#f8bbd9",
    "editorOverviewRuler.wordHighlightForeground": "#f8bbd9",
    "editorOverviewRuler.bracketMatchForeground": "#e91e63",
    "editorOverviewRuler.errorForeground": "#d32f2f",
    "editorOverviewRuler.warningForeground": "#f57c00",
    "editorOverviewRuler.infoForeground": "#1976d2",
    "editorBracketHighlight.foreground1": "#e91e63",
    "editorBracketHighlight.foreground2": "#c2185b",
    "editorBracketHighlight.foreground3": "#ad1457",
    "editorBracketHighlight.foreground4": "#880e4f",
    "editorBracketHighlight.foreground5": "#e91e63",
    "editorBracketHighlight.foreground6": "#c2185b",
    "editorUnnecessaryCode.opacity": "#00000080",
    "editorGhostText.foreground": "#6a6a6a",
    "editorStickyScroll.background": "#fce4ec",
    "editorStickyScrollHover.background": "#f8bbd9",
  },
});

/**
 * Banana theme - Yellow/golden colored theme
 */
const getBananaTheme = (): editor.IStandaloneThemeData => ({
  base: "vs", // Light base
  inherit: true,
  rules: [
    { token: "comment", foreground: "#6a6a6a", fontStyle: "italic" },
    { token: "keyword", foreground: "#f57f17", fontStyle: "bold" },
    { token: "string", foreground: "#f9a825" },
    { token: "number", foreground: "#f57f17" },
    { token: "regexp", foreground: "#e65100" },
    { token: "operator", foreground: "#f57f17" },
    { token: "namespace", foreground: "#f9a825" },
    { token: "type", foreground: "#f57f17", fontStyle: "bold" },
    { token: "struct", foreground: "#f57f17" },
    { token: "class", foreground: "#f57f17", fontStyle: "bold" },
    { token: "interface", foreground: "#f57f17", fontStyle: "bold" },
    { token: "parameter", foreground: "#f57f17" },
    { token: "variable", foreground: "#f57f17" },
    { token: "function", foreground: "#f9a825", fontStyle: "bold" },
    { token: "method", foreground: "#f9a825", fontStyle: "bold" },
    { token: "property", foreground: "#f57f17" },
    { token: "constant", foreground: "#e65100", fontStyle: "bold" },
    { token: "enum", foreground: "#f57f17" },
    { token: "enumMember", foreground: "#f57f17" },
    { token: "decorator", foreground: "#f57f17" },
    { token: "tag", foreground: "#f9a825" },
    { token: "attribute.name", foreground: "#f57f17" },
    { token: "attribute.value", foreground: "#f9a825" },
    { token: "delimiter", foreground: "#6a6a6a" },
    { token: "delimiter.bracket", foreground: "#6a6a6a" },
    { token: "delimiter.parenthesis", foreground: "#6a6a6a" },
    { token: "delimiter.square", foreground: "#6a6a6a" },
    { token: "delimiter.angle", foreground: "#6a6a6a" },
    { token: "delimiter.curly", foreground: "#6a6a6a" },
  ],
  colors: {
    "editor.background": "#fffde7",
    "editor.foreground": "#2c2c2c",
    "editorLineNumber.foreground": "#f57f17",
    "editorLineNumber.activeForeground": "#f9a825",
    "editor.selectionBackground": "#fff9c4",
    "editor.selectionHighlightBackground": "#fff9c4",
    "editor.lineHighlightBackground": "#fff9c4",
    "editorCursor.foreground": "#f57f17",
    "editorWhitespace.foreground": "#fdd835",
    "editorIndentGuide.background": "#fdd835",
    "editorIndentGuide.activeBackground": "#f57f17",
    "editorBracketMatch.background": "#fff9c4",
    "editorBracketMatch.border": "#f57f17",
    "editor.findMatchBackground": "#fff9c4",
    "editor.findMatchHighlightBackground": "#fff9c4",
    "editor.hoverHighlightBackground": "#fff9c4",
    "editor.wordHighlightBackground": "#fff9c4",
    "editor.wordHighlightStrongBackground": "#fff9c4",
    "editorLink.activeForeground": "#f9a825",
    "editorWidget.background": "#ffffff",
    "editorWidget.border": "#f57f17",
    "editorSuggestWidget.background": "#ffffff",
    "editorSuggestWidget.border": "#f57f17",
    "editorSuggestWidget.foreground": "#2c2c2c",
    "editorSuggestWidget.highlightForeground": "#f9a825",
    "editorSuggestWidget.selectedBackground": "#fff9c4",
    "editorHoverWidget.background": "#ffffff",
    "editorHoverWidget.border": "#f57f17",
    "editorHoverWidget.foreground": "#2c2c2c",
    "editorGutter.background": "#fffde7",
    "editorGutter.modifiedBackground": "#f57f17",
    "editorGutter.addedBackground": "#4caf50",
    "editorGutter.deletedBackground": "#f44336",
    "editorOverviewRuler.border": "#f57f17",
    "editorOverviewRuler.findMatchForeground": "#fff9c4",
    "editorOverviewRuler.rangeHighlightForeground": "#fff9c4",
    "editorOverviewRuler.selectionHighlightForeground": "#fff9c4",
    "editorOverviewRuler.wordHighlightForeground": "#fff9c4",
    "editorOverviewRuler.bracketMatchForeground": "#f57f17",
    "editorOverviewRuler.errorForeground": "#d32f2f",
    "editorOverviewRuler.warningForeground": "#f57c00",
    "editorOverviewRuler.infoForeground": "#1976d2",
    "editorBracketHighlight.foreground1": "#f57f17",
    "editorBracketHighlight.foreground2": "#f9a825",
    "editorBracketHighlight.foreground3": "#f57f17",
    "editorBracketHighlight.foreground4": "#e65100",
    "editorBracketHighlight.foreground5": "#f57f17",
    "editorBracketHighlight.foreground6": "#f9a825",
    "editorUnnecessaryCode.opacity": "#00000080",
    "editorGhostText.foreground": "#6a6a6a",
    "editorStickyScroll.background": "#fffde7",
    "editorStickyScrollHover.background": "#fff9c4",
  },
});

/**
 * Peanut theme - Brown/earth colored theme
 */
const getPeanutTheme = (): editor.IStandaloneThemeData => ({
  base: "vs", // Light base
  inherit: true,
  rules: [
    { token: "comment", foreground: "#6a6a6a", fontStyle: "italic" },
    { token: "keyword", foreground: "#8d6e63", fontStyle: "bold" },
    { token: "string", foreground: "#a1887f" },
    { token: "number", foreground: "#8d6e63" },
    { token: "regexp", foreground: "#6d4c41" },
    { token: "operator", foreground: "#8d6e63" },
    { token: "namespace", foreground: "#a1887f" },
    { token: "type", foreground: "#8d6e63", fontStyle: "bold" },
    { token: "struct", foreground: "#8d6e63" },
    { token: "class", foreground: "#8d6e63", fontStyle: "bold" },
    { token: "interface", foreground: "#8d6e63", fontStyle: "bold" },
    { token: "parameter", foreground: "#8d6e63" },
    { token: "variable", foreground: "#8d6e63" },
    { token: "function", foreground: "#a1887f", fontStyle: "bold" },
    { token: "method", foreground: "#a1887f", fontStyle: "bold" },
    { token: "property", foreground: "#8d6e63" },
    { token: "constant", foreground: "#6d4c41", fontStyle: "bold" },
    { token: "enum", foreground: "#8d6e63" },
    { token: "enumMember", foreground: "#8d6e63" },
    { token: "decorator", foreground: "#8d6e63" },
    { token: "tag", foreground: "#a1887f" },
    { token: "attribute.name", foreground: "#8d6e63" },
    { token: "attribute.value", foreground: "#a1887f" },
    { token: "delimiter", foreground: "#6a6a6a" },
    { token: "delimiter.bracket", foreground: "#6a6a6a" },
    { token: "delimiter.parenthesis", foreground: "#6a6a6a" },
    { token: "delimiter.square", foreground: "#6a6a6a" },
    { token: "delimiter.angle", foreground: "#6a6a6a" },
    { token: "delimiter.curly", foreground: "#6a6a6a" },
  ],
  colors: {
    "editor.background": "#f3e5f5",
    "editor.foreground": "#2c2c2c",
    "editorLineNumber.foreground": "#8d6e63",
    "editorLineNumber.activeForeground": "#a1887f",
    "editor.selectionBackground": "#e1bee7",
    "editor.selectionHighlightBackground": "#e1bee7",
    "editor.lineHighlightBackground": "#e1bee7",
    "editorCursor.foreground": "#8d6e63",
    "editorWhitespace.foreground": "#ce93d8",
    "editorIndentGuide.background": "#ce93d8",
    "editorIndentGuide.activeBackground": "#8d6e63",
    "editorBracketMatch.background": "#e1bee7",
    "editorBracketMatch.border": "#8d6e63",
    "editor.findMatchBackground": "#e1bee7",
    "editor.findMatchHighlightBackground": "#e1bee7",
    "editor.hoverHighlightBackground": "#e1bee7",
    "editor.wordHighlightBackground": "#e1bee7",
    "editor.wordHighlightStrongBackground": "#e1bee7",
    "editorLink.activeForeground": "#a1887f",
    "editorWidget.background": "#ffffff",
    "editorWidget.border": "#8d6e63",
    "editorSuggestWidget.background": "#ffffff",
    "editorSuggestWidget.border": "#8d6e63",
    "editorSuggestWidget.foreground": "#2c2c2c",
    "editorSuggestWidget.highlightForeground": "#a1887f",
    "editorSuggestWidget.selectedBackground": "#e1bee7",
    "editorHoverWidget.background": "#ffffff",
    "editorHoverWidget.border": "#8d6e63",
    "editorHoverWidget.foreground": "#2c2c2c",
    "editorGutter.background": "#f3e5f5",
    "editorGutter.modifiedBackground": "#8d6e63",
    "editorGutter.addedBackground": "#4caf50",
    "editorGutter.deletedBackground": "#f44336",
    "editorOverviewRuler.border": "#8d6e63",
    "editorOverviewRuler.findMatchForeground": "#e1bee7",
    "editorOverviewRuler.rangeHighlightForeground": "#e1bee7",
    "editorOverviewRuler.selectionHighlightForeground": "#e1bee7",
    "editorOverviewRuler.wordHighlightForeground": "#e1bee7",
    "editorOverviewRuler.bracketMatchForeground": "#8d6e63",
    "editorOverviewRuler.errorForeground": "#d32f2f",
    "editorOverviewRuler.warningForeground": "#f57c00",
    "editorOverviewRuler.infoForeground": "#1976d2",
    "editorBracketHighlight.foreground1": "#8d6e63",
    "editorBracketHighlight.foreground2": "#a1887f",
    "editorBracketHighlight.foreground3": "#8d6e63",
    "editorBracketHighlight.foreground4": "#6d4c41",
    "editorBracketHighlight.foreground5": "#8d6e63",
    "editorBracketHighlight.foreground6": "#a1887f",
    "editorUnnecessaryCode.opacity": "#00000080",
    "editorGhostText.foreground": "#6a6a6a",
    "editorStickyScroll.background": "#f3e5f5",
    "editorStickyScrollHover.background": "#e1bee7",
  },
});

/**
 * Gray theme - Neutral gray colored theme
 */
const getGrayTheme = (): editor.IStandaloneThemeData => ({
  base: "vs-dark", // Dark base
  inherit: true,
  rules: [
    { token: "comment", foreground: "#9e9e9e", fontStyle: "italic" },
    { token: "keyword", foreground: "#bdbdbd", fontStyle: "bold" },
    { token: "string", foreground: "#e0e0e0" },
    { token: "number", foreground: "#bdbdbd" },
    { token: "regexp", foreground: "#9e9e9e" },
    { token: "operator", foreground: "#bdbdbd" },
    { token: "namespace", foreground: "#e0e0e0" },
    { token: "type", foreground: "#bdbdbd", fontStyle: "bold" },
    { token: "struct", foreground: "#bdbdbd" },
    { token: "class", foreground: "#bdbdbd", fontStyle: "bold" },
    { token: "interface", foreground: "#bdbdbd", fontStyle: "bold" },
    { token: "parameter", foreground: "#bdbdbd" },
    { token: "variable", foreground: "#bdbdbd" },
    { token: "function", foreground: "#e0e0e0", fontStyle: "bold" },
    { token: "method", foreground: "#e0e0e0", fontStyle: "bold" },
    { token: "property", foreground: "#bdbdbd" },
    { token: "constant", foreground: "#9e9e9e", fontStyle: "bold" },
    { token: "enum", foreground: "#bdbdbd" },
    { token: "enumMember", foreground: "#bdbdbd" },
    { token: "decorator", foreground: "#bdbdbd" },
    { token: "tag", foreground: "#e0e0e0" },
    { token: "attribute.name", foreground: "#bdbdbd" },
    { token: "attribute.value", foreground: "#e0e0e0" },
    { token: "delimiter", foreground: "#9e9e9e" },
    { token: "delimiter.bracket", foreground: "#9e9e9e" },
    { token: "delimiter.parenthesis", foreground: "#9e9e9e" },
    { token: "delimiter.square", foreground: "#9e9e9e" },
    { token: "delimiter.angle", foreground: "#9e9e9e" },
    { token: "delimiter.curly", foreground: "#9e9e9e" },
  ],
  colors: {
    "editor.background": "#424242",
    "editor.foreground": "#e0e0e0",
    "editorLineNumber.foreground": "#9e9e9e",
    "editorLineNumber.activeForeground": "#bdbdbd",
    "editor.selectionBackground": "#616161",
    "editor.selectionHighlightBackground": "#616161",
    "editor.lineHighlightBackground": "#616161",
    "editorCursor.foreground": "#bdbdbd",
    "editorWhitespace.foreground": "#757575",
    "editorIndentGuide.background": "#757575",
    "editorIndentGuide.activeBackground": "#bdbdbd",
    "editorBracketMatch.background": "#616161",
    "editorBracketMatch.border": "#bdbdbd",
    "editor.findMatchBackground": "#616161",
    "editor.findMatchHighlightBackground": "#616161",
    "editor.hoverHighlightBackground": "#616161",
    "editor.wordHighlightBackground": "#616161",
    "editor.wordHighlightStrongBackground": "#616161",
    "editorLink.activeForeground": "#e0e0e0",
    "editorWidget.background": "#424242",
    "editorWidget.border": "#bdbdbd",
    "editorSuggestWidget.background": "#424242",
    "editorSuggestWidget.border": "#bdbdbd",
    "editorSuggestWidget.foreground": "#e0e0e0",
    "editorSuggestWidget.highlightForeground": "#bdbdbd",
    "editorSuggestWidget.selectedBackground": "#616161",
    "editorHoverWidget.background": "#424242",
    "editorHoverWidget.border": "#bdbdbd",
    "editorHoverWidget.foreground": "#e0e0e0",
    "editorGutter.background": "#424242",
    "editorGutter.modifiedBackground": "#bdbdbd",
    "editorGutter.addedBackground": "#4caf50",
    "editorGutter.deletedBackground": "#f44336",
    "editorOverviewRuler.border": "#bdbdbd",
    "editorOverviewRuler.findMatchForeground": "#616161",
    "editorOverviewRuler.rangeHighlightForeground": "#616161",
    "editorOverviewRuler.selectionHighlightForeground": "#616161",
    "editorOverviewRuler.wordHighlightForeground": "#616161",
    "editorOverviewRuler.bracketMatchForeground": "#bdbdbd",
    "editorOverviewRuler.errorForeground": "#d32f2f",
    "editorOverviewRuler.warningForeground": "#f57c00",
    "editorOverviewRuler.infoForeground": "#1976d2",
    "editorBracketHighlight.foreground1": "#bdbdbd",
    "editorBracketHighlight.foreground2": "#e0e0e0",
    "editorBracketHighlight.foreground3": "#bdbdbd",
    "editorBracketHighlight.foreground4": "#9e9e9e",
    "editorBracketHighlight.foreground5": "#bdbdbd",
    "editorBracketHighlight.foreground6": "#e0e0e0",
    "editorUnnecessaryCode.opacity": "#00000080",
    "editorGhostText.foreground": "#9e9e9e",
    "editorStickyScroll.background": "#424242",
    "editorStickyScrollHover.background": "#616161",
  },
});

/**
 * Register custom Monaco themes
 * @param monaco - Monaco editor instance
 * @param reynardTheme - Current Reynard theme
 */
export const registerCustomMonacoTheme = (monaco: typeof import("monaco-editor"), reynardTheme: string): void => {
  const customTheme = getCustomMonacoTheme(reynardTheme);
  console.log("registerCustomMonacoTheme:", {
    reynardTheme,
    customTheme,
    monaco: !!monaco,
  });
  if (customTheme && monaco && monaco.editor) {
    const themeName = `reynard-${reynardTheme}`;
    console.log("Defining Monaco theme:", themeName);
    monaco.editor.defineTheme(themeName, customTheme);
    console.log("Theme defined successfully");
  } else {
    console.log("Cannot register theme:", {
      hasCustomTheme: !!customTheme,
      hasMonaco: !!monaco,
      hasEditor: !!(monaco && monaco.editor),
    });
  }
};

/**
 * Get the appropriate Monaco theme name for a Reynard theme
 * @param reynardTheme - The Reynard theme name
 * @returns Monaco theme name (custom or fallback)
 */
export const getMonacoThemeName = (reynardTheme: string): string => {
  const customTheme = getCustomMonacoTheme(reynardTheme);
  if (customTheme) {
    return `reynard-${reynardTheme}`;
  }

  // Fallback to standard themes
  switch (reynardTheme) {
    case "light":
      return "vs";
    case "dark":
      return "vs-dark";
    case "high-contrast-black":
    case "high-contrast-inverse":
      return "hc-black";
    default:
      return "vs";
  }
};
