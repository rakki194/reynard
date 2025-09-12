import { createSignal } from "solid-js";
import { CodeEditor } from "../src/components/CodeEditor";
import { useI18n } from "reynard-i18n";
import "./basic-usage.css";

export function BasicUsageExample() {
  const { t } = useI18n();
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
      <h1>{t("monaco.reynardMonacoEditorBasicUsage")}</h1>

      <div class="example-controls">
        <label>
          {t("monaco.theme")}:
          <select value={theme()} onChange={(e) => setTheme(e.target.value)}>
            <option value="light">{t("monaco.light")}</option>
            <option value="dark">{t("monaco.dark")}</option>
            <option value="gray">{t("monaco.gray")}</option>
          </select>
        </label>

        <label>
          {t("monaco.language")}:
          <select
            value={language()}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="javascript">{t("monaco.javascript")}</option>
            <option value="typescript">{t("monaco.typescript")}</option>
            <option value="python">{t("monaco.python")}</option>
            <option value="java">{t("monaco.java")}</option>
            <option value="cpp">{t("monaco.cpp")}</option>
            <option value="html">{t("monaco.html")}</option>
            <option value="css">{t("monaco.css")}</option>
            <option value="json">{t("monaco.json")}</option>
            <option value="markdown">{t("monaco.markdown")}</option>
          </select>
        </label>

        <label>
          <input
            type="checkbox"
            checked={readOnly()}
            onChange={(e) => setReadOnly(e.target.checked)}
          />
          {t("monaco.readOnly")}
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
