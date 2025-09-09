import { createSignal } from "solid-js";
import { CodeEditor } from "../src/components/CodeEditor";
import "./basic-usage.css";

export function BasicUsageExample() {
  const [code, setCode] = createSignal(`// Welcome to Reynard Monaco Editor!
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10)); // 55`);

  const [theme, setTheme] = createSignal("dark");
  const [language, setLanguage] = createSignal("javascript");
  const [readOnly, setReadOnly] = createSignal(false);

  return (
    <div class="example-container">
      <h1>Reynard Monaco Editor - Basic Usage</h1>

      <div class="example-controls">
        <label>
          Theme:
          <select value={theme()} onChange={(e) => setTheme(e.target.value)}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="gray">Gray</option>
          </select>
        </label>

        <label>
          Language:
          <select
            value={language()}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="json">JSON</option>
            <option value="markdown">Markdown</option>
          </select>
        </label>

        <label>
          <input
            type="checkbox"
            checked={readOnly()}
            onChange={(e) => setReadOnly(e.target.checked)}
          />
          Read Only
        </label>
      </div>

      <CodeEditor
        value={code()}
        language={language()}
        theme={theme()}
        readOnly={readOnly()}
        onChange={setCode}
        height="500px"
        showLineNumbers={true}
      />

      <div class="code-preview">
        <h3>Current Code:</h3>
        <pre>{code()}</pre>
      </div>
    </div>
  );
}
