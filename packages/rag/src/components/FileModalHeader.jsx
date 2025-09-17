/**
 * File Modal Header Component
 *
 * Header section with file info and controls for the RAG file modal.
 */
import { FileControls } from "./FileControls";
export const FileModalHeader = (props) => {
    return (<div class="rag-file-header">
      <div class="file-info">
        <div class="file-path">{props.filePath}</div>
        <div class="file-stats">
          {props.fileContent.split("\n").length} lines •{" "}
          {props.fileContent.length} characters
        </div>
      </div>

      <FileControls showLineNumbers={props.showLineNumbers} onToggleLineNumbers={props.onToggleLineNumbers} wrapLines={props.wrapLines} onToggleWrapLines={props.onToggleWrapLines} fontSize={props.fontSize} onFontSizeChange={props.onFontSizeChange} onCopy={props.onCopy} onDownload={props.onDownload}/>
    </div>);
};
