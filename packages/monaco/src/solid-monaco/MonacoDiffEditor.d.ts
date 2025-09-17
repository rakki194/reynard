import { JSX } from "solid-js";
import * as monacoEditor from "monaco-editor";
import { Monaco } from "@monaco-editor/loader";
import { LoaderParams } from "./types";
import "./MonacoDiffEditor.css";
export interface MonacoDiffEditorProps {
    original?: string;
    modified?: string;
    originalLanguage?: string;
    modifiedLanguage?: string;
    originalPath?: string;
    modifiedPath?: string;
    loadingState?: JSX.Element | string;
    class?: string;
    theme?: monacoEditor.editor.BuiltinTheme | string;
    overrideServices?: monacoEditor.editor.IEditorOverrideServices;
    width?: string;
    height?: string;
    options?: monacoEditor.editor.IStandaloneEditorConstructionOptions;
    saveViewState?: boolean;
    loaderParams?: LoaderParams;
    onChange?: (value: string) => void;
    onMount?: (monaco: Monaco, editor: monacoEditor.editor.IStandaloneDiffEditor) => void;
    onBeforeUnmount?: (monaco: Monaco, editor: monacoEditor.editor.IStandaloneDiffEditor) => void;
}
export declare const MonacoDiffEditor: (inputProps: MonacoDiffEditorProps) => any;
