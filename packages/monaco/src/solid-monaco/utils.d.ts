import { Monaco } from "@monaco-editor/loader";
export declare const getModel: (monaco: Monaco, path: string) => import("monaco-editor").editor.ITextModel | null;
export declare const createModel: (monaco: Monaco, value: string, language?: string, path?: string) => import("monaco-editor").editor.ITextModel;
export declare const getOrCreateModel: (monaco: Monaco, value: string, language?: string, path?: string) => import("monaco-editor").editor.ITextModel;
