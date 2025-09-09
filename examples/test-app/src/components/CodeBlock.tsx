import { Component, Show } from "solid-js";
import { CodeEditor } from "reynard-monaco";
import { useTheme } from "reynard-themes";
import "./CodeBlock.css";

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
  explanation?: string;
  showLineNumbers?: boolean;
  maxHeight?: string;
}

export const CodeBlock: Component<CodeBlockProps> = (props) => {
  const { theme: currentTheme } = useTheme();

  // Calculate height based on content or use maxHeight
  const getHeight = () => {
    console.log("CodeBlock: maxHeight prop:", props.maxHeight);
    if (props.maxHeight) {
      console.log("CodeBlock: Using maxHeight:", props.maxHeight);
      return props.maxHeight;
    }

    // Calculate height based on number of lines (approximately 25px per line for better visibility)
    const lineCount = props.code.split("\n").length;
    const calculatedHeight = Math.max(lineCount * 25, 200); // Minimum 200px, 25px per line
    const finalHeight = `${Math.min(calculatedHeight, 600)}px`; // Maximum 600px
    console.log(
      "CodeBlock: Calculated height:",
      finalHeight,
      "for",
      lineCount,
      "lines",
    );
    return finalHeight;
  };

  return (
    <div class="code-block-container">
      <Show when={props.title}>
        <h4 class="code-title">{props.title}</h4>
      </Show>

      <div class="code-block-wrapper">
        <div
          class="code-block"
          classList={{
            "with-line-numbers": props.showLineNumbers !== false,
            scrollable: !!props.maxHeight,
          }}
        >
          <CodeEditor
            value={props.code}
            language={props.language || "text"}
            theme={currentTheme}
            readOnly={true}
            showLineNumbers={props.showLineNumbers !== false}
            height={(() => {
              const height = getHeight();
              console.log("CodeBlock: Passing height to CodeEditor:", height);
              return height;
            })()}
          />
        </div>
      </div>

      <Show when={props.explanation}>
        <div class="code-explanation">{props.explanation}</div>
      </Show>
    </div>
  );
};
