import { Component, type JSX } from "solid-js";
import type * as monaco from "monaco-editor";
import "./MonacoEditor.css";
export interface MonacoEditorProps {
    value?: string;
    language?: string;
    theme?: string;
    options?: monaco.editor.IStandaloneEditorConstructionOptions;
    onChange?: (value: string | undefined) => void;
    onMount?: (editor: monaco.editor.IStandaloneCodeEditor, monaco: typeof import("monaco-editor")) => void;
    onValidate?: (markers: monaco.editor.IMarker[]) => void;
    width?: string | number;
    height?: string | number;
    className?: string;
    style?: JSX.CSSProperties;
}
export declare const MonacoEditor: Component<MonacoEditorProps>;
