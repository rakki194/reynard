/**
 * Monaco package translations
 * Code editor and development environment translations
 */

export interface MonacoTranslations {
  editor: {
    save: string;
    format: string;
    find: string;
    replace: string;
    undo: string;
    redo: string;
    cut: string;
    copy: string;
    paste: string;
    selectAll: string;
  };
  language: {
    select: string;
    detect: string;
  };
  theme: {
    select: string;
    light: string;
    dark: string;
  };
  settings: {
    title: string;
    fontSize: string;
    tabSize: string;
    wordWrap: string;
    minimap: string;
    lineNumbers: string;
  };
}
