/**
 * @fileoverview Code display and interactive components for documentation
 */
import { createSignal, Show, For } from "solid-js";
import { Button, Card } from "reynard-primitives";
/**
 * Code block component with syntax highlighting
 */
export const DocsCodeBlock = (props: any) => {
  const [copied, setCopied] = createSignal(false);
  const [isExpanded, setIsExpanded] = createSignal(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(props.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };
  const handleRun = () => {
    props.onRun?.(props.code);
  };
  return (
    <div class={`docs-code-block ${props.class || ""}`}>
      <Show when={props.title}>
        <div class="docs-code-block-header">
          <h4 class="docs-code-block-title">{props.title}</h4>
          <div class="docs-code-block-actions">
            <Show when={props.copyable !== false}>
              <Button size="sm" variant="secondary" onClick={handleCopy} class="docs-code-block-copy">
                {copied() ? "Copied!" : "Copy"}
              </Button>
            </Show>
            <Show when={props.runnable}>
              <Button size="sm" variant="primary" onClick={handleRun} class="docs-code-block-run">
                Run
              </Button>
            </Show>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setIsExpanded(!isExpanded())}
              class="docs-code-block-expand"
            >
              {isExpanded() ? "Collapse" : "Expand"}
            </Button>
          </div>
        </div>
      </Show>

      <div class={`docs-code-block-content ${isExpanded() ? "expanded" : ""}`}>
        <pre class="docs-code-block-pre">
          <code class={`language-${props.language}`}>{props.code}</code>
        </pre>
      </div>
    </div>
  );
};
/**
 * Interactive code editor component
 */
export const DocsCodeEditor = (props: any) => {
  const [code, setCode] = createSignal(props.code);
  const [output, setOutput] = createSignal("");
  const handleCodeChange = (newCode: any) => {
    setCode(newCode);
    props.onChange?.(newCode);
  };
  const handleRun = () => {
    const result = props.onRun?.(code());
    setOutput(result || "");
  };
  return (
    <div class={`docs-code-editor ${props.class || ""}`}>
      <div class="docs-code-editor-header">
        <span class="docs-code-editor-language">{props.language}</span>
        <Button size="sm" variant="primary" onClick={handleRun} class="docs-code-editor-run">
          Run Code
        </Button>
      </div>

      <div class="docs-code-editor-content">
        <textarea
          value={code()}
          onInput={e => handleCodeChange(e.currentTarget.value)}
          readOnly={props.readOnly}
          class="docs-code-editor-textarea"
          spellcheck={false}
        />
      </div>

      <Show when={output()}>
        <div class="docs-code-editor-output">
          <h5>Output:</h5>
          <pre class="docs-code-editor-output-pre">{output()}</pre>
        </div>
      </Show>
    </div>
  );
};
/**
 * Code example component with live preview
 */
export const DocsCodeExample = (props: any) => {
  const [activeTab, setActiveTab] = createSignal("preview");
  const [output, setOutput] = createSignal("");
  const handleRun = () => {
    const result = props.onRun?.(props.code);
    setOutput(result || "");
  };
  return (
    <Card class={`docs-code-example ${props.class || ""}`}>
      <div class="docs-code-example-header">
        <h4 class="docs-code-example-title">{props.title}</h4>
        <Show when={props.description}>
          <p class="docs-code-example-description">{props.description}</p>
        </Show>
      </div>

      <div class="docs-code-example-tabs">
        <button
          class={`docs-code-example-tab ${activeTab() === "preview" ? "active" : ""}`}
          onClick={() => setActiveTab("preview")}
        >
          Preview
        </button>
        <button
          class={`docs-code-example-tab ${activeTab() === "code" ? "active" : ""}`}
          onClick={() => setActiveTab("code")}
        >
          Code
        </button>
      </div>

      <div class="docs-code-example-content">
        <Show when={activeTab() === "preview"}>
          <div class="docs-code-example-preview">
            <Show when={props.preview}>
              <div innerHTML={props.preview} />
            </Show>
            <Show when={!props.preview}>
              <div class="docs-code-example-placeholder">
                <p>Click "Run Code" to see the preview</p>
                <Button onClick={handleRun}>Run Code</Button>
              </div>
            </Show>
          </div>
        </Show>

        <Show when={activeTab() === "code"}>
          <DocsCodeBlock code={props.code} language={props.language} runnable={!!props.onRun} onRun={handleRun} />
        </Show>
      </div>

      <Show when={output()}>
        <div class="docs-code-example-output">
          <h5>Output:</h5>
          <pre>{output()}</pre>
        </div>
      </Show>
    </Card>
  );
};
/**
 * Code comparison component
 */
export const DocsCodeComparison = (props: any) => {
  return (
    <div class={`docs-code-comparison ${props.className || ""}`}>
      <div class="docs-code-comparison-header">
        <h4>Code Comparison</h4>
      </div>

      <div class="docs-code-comparison-content">
        <div class="docs-code-comparison-left">
          <h5 class="docs-code-comparison-title">{props.left.title}</h5>
          <DocsCodeBlock code={props.left.code} language={props.left.language} copyable={true} />
        </div>

        <div class="docs-code-comparison-separator">
          <span>vs</span>
        </div>

        <div class="docs-code-comparison-right">
          <h5 class="docs-code-comparison-title">{props.right.title}</h5>
          <DocsCodeBlock code={props.right.code} language={props.right.language} copyable={true} />
        </div>
      </div>
    </div>
  );
};
interface DocsCodeSnippetProps {
  code: string;
  language?: string;
  copyable?: boolean;
  class?: string;
}

/**
 * Code snippet component for inline code
 */
export const DocsCodeSnippet = (props: DocsCodeSnippetProps) => {
  const [copied, setCopied] = createSignal(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(props.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };
  return (
    <code class={`docs-code-snippet ${props.class || ""}`}>
      {props.code}
      <Show when={props.copyable}>
        <button class="docs-code-snippet-copy" onClick={handleCopy} title="Copy code">
          {copied() ? "✓" : "📋"}
        </button>
      </Show>
    </code>
  );
};
interface DocsTerminalProps {
  commands: Array<{
    command: string;
    output?: string;
    error?: string;
  }>;
  prompt?: string;
  class?: string;
}

/**
 * Terminal/console component
 */
export const DocsTerminal = (props: DocsTerminalProps) => {
  const prompt = () => props.prompt || "$";
  return (
    <div class={`docs-terminal ${props.class || ""}`}>
      <div class="docs-terminal-header">
        <div class="docs-terminal-controls">
          <span class="docs-terminal-control"></span>
          <span class="docs-terminal-control"></span>
          <span class="docs-terminal-control"></span>
        </div>
        <span class="docs-terminal-title">Terminal</span>
      </div>

      <div class="docs-terminal-content">
        <For each={props.commands}>
          {cmd => (
            <div class="docs-terminal-line">
              <span class="docs-terminal-prompt">{prompt()}</span>
              <span class="docs-terminal-command">{cmd.command}</span>
              <Show when={cmd.output}>
                <div class="docs-terminal-output">{cmd.output}</div>
              </Show>
              <Show when={cmd.error}>
                <div class="docs-terminal-error">{cmd.error}</div>
              </Show>
            </div>
          )}
        </For>
      </div>
    </div>
  );
};
