import { Component } from "solid-js";
import "./CodeEditor.css";
interface CodeEditorProps {
    value?: string;
    language?: string;
    theme?: string;
    readOnly?: boolean;
    onChange?: (value: string | undefined) => void;
    onSave?: () => void;
    height?: string;
    width?: string;
    showLineNumbers?: boolean;
    showSearch?: boolean;
    className?: string;
}
export declare const CodeEditor: Component<CodeEditorProps>;
export {};
