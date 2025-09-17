/**
 * @fileoverview Documentation renderer components for Reynard
 */
import { createSignal, createEffect, For, Show } from "solid-js";
import { Button, Card } from "reynard-components";
/**
 * Main documentation renderer component
 */
export const DocRenderer = (props) => {
    // const [isCodeExpanded, setIsCodeExpanded] = createSignal(false);
    // const [activeTab, setActiveTab] = createSignal(0);
    return (<div class={`doc-renderer ${props.className || ""}`}>
      <DocHeader metadata={props.metadata}/>
      <DocContent content={props.content} type={props.type} onNavigate={props.onNavigate} onCodeRun={props.onCodeRun}/>
      <DocFooter metadata={props.metadata}/>
    </div>);
};
/**
 * Documentation header component
 */
const DocHeader = (props) => {
    return (<header class="doc-header">
      <div class="doc-meta">
        <h1 class="doc-title">{props.metadata.title}</h1>
        {props.metadata.description && (<p class="doc-description">{props.metadata.description}</p>)}
        <div class="doc-tags">
          <For each={props.metadata.tags || []}>
            {(tag) => <span class="doc-tag">{tag}</span>}
          </For>
        </div>
      </div>
    </header>);
};
/**
 * Documentation content component
 */
const DocContent = (props) => {
    return (<main class="doc-content">
      <div class="doc-content-body" innerHTML={props.content} onClick={(e) => handleContentClick(e, props.onNavigate, props.onCodeRun)}/>
    </main>);
};
/**
 * Documentation footer component
 */
const DocFooter = (props) => {
    return (<footer class="doc-footer">
      <div class="doc-footer-content">
        {props.metadata.lastModified && (<p class="doc-last-modified">
            Last updated:{" "}
            {new Date(props.metadata.lastModified).toLocaleDateString()}
          </p>)}
        {props.metadata.author && (<p class="doc-author">By {props.metadata.author}</p>)}
      </div>
    </footer>);
};
/**
 * Code example renderer component
 */
export const CodeExampleRenderer = (props) => {
    const [isExpanded, setIsExpanded] = createSignal(false);
    const [output, setOutput] = createSignal("");
    const handleRun = () => {
        if (props.onRun) {
            props.onRun(props.example.code);
            setOutput("Code executed successfully");
        }
    };
    return (<Card class="code-example">
      <div class="code-example-header">
        <h4 class="code-example-title">{props.example.title}</h4>
        <div class="code-example-actions">
          <Button size="sm" variant="secondary" onClick={() => setIsExpanded(!isExpanded())}>
            {isExpanded() ? "Collapse" : "Expand"}
          </Button>
          {props.example.live && (<Button size="sm" variant="primary" onClick={handleRun}>
              Run
            </Button>)}
        </div>
      </div>

      {props.example.description && (<p class="code-example-description">{props.example.description}</p>)}

      <div class="code-example-content">
        <pre class="code-block">
          <code class={`language-${props.example.language}`}>
            {props.example.code}
          </code>
        </pre>
      </div>

      <Show when={output()}>
        <div class="code-example-output">
          <h5>Output:</h5>
          <pre>{output()}</pre>
        </div>
      </Show>
    </Card>);
};
/**
 * API documentation renderer
 */
export const ApiDocRenderer = (props) => {
    return (<Card class="api-doc">
      <div class="api-doc-header">
        <h3 class="api-doc-name">{props.api.name}</h3>
        <span class={`api-doc-type api-doc-type--${props.api.type}`}>
          {props.api.type}
        </span>
      </div>

      <p class="api-doc-description">{props.api.description}</p>

      <Show when={props.api.parameters && props.api.parameters.length > 0}>
        <div class="api-doc-parameters">
          <h4>Parameters</h4>
          <div class="api-params-table">
            <For each={props.api.parameters}>
              {(param) => (<div class="api-param">
                  <div class="api-param-name">
                    {param.name}
                    {param.required && <span class="required">*</span>}
                  </div>
                  <div class="api-param-type">{param.type}</div>
                  <div class="api-param-description">{param.description}</div>
                  {param.default && (<div class="api-param-default">
                      Default: {param.default}
                    </div>)}
                </div>)}
            </For>
          </div>
        </div>
      </Show>

      <Show when={props.api.returns}>
        <div class="api-doc-returns">
          <h4>Returns</h4>
          <div class="api-return">
            <span class="api-return-type">{props.api.returns.type}</span>
            <p class="api-return-description">
              {props.api.returns.description}
            </p>
          </div>
        </div>
      </Show>

      <Show when={props.api.examples && props.api.examples.length > 0}>
        <div class="api-doc-examples">
          <h4>Examples</h4>
          <For each={props.api.examples}>
            {(example) => <CodeExampleRenderer example={example}/>}
          </For>
        </div>
      </Show>
    </Card>);
};
/**
 * Table of contents renderer
 */
export const TableOfContents = (props) => {
    const [headings, setHeadings] = createSignal([]);
    createEffect(() => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(props.content, "text/html");
        const headingElements = doc.querySelectorAll("h1, h2, h3, h4, h5, h6");
        const headingList = Array.from(headingElements).map((heading, index) => ({
            id: heading.id || `heading-${index}`,
            text: heading.textContent || "",
            level: parseInt(heading.tagName.charAt(1)),
            element: heading,
        }));
        setHeadings(headingList);
    });
    return (<nav class="table-of-contents">
      <h3>Table of Contents</h3>
      <ul class="toc-list">
        <For each={headings()}>
          {(heading) => (<li class={`toc-item toc-item--${heading.level}`}>
              <a href={`#${heading.id}`} onClick={(e) => {
                e.preventDefault();
                props.onNavigate?.(heading.id);
            }} class="toc-link">
                {heading.text}
              </a>
            </li>)}
        </For>
      </ul>
    </nav>);
};
/**
 * Handle clicks within documentation content
 */
function handleContentClick(event, onNavigate, onCodeRun) {
    const target = event.target;
    // Handle copy code button clicks
    if (target.classList.contains("copy-button")) {
        const codeBlock = target.closest(".code-block");
        const code = codeBlock?.querySelector("code")?.textContent;
        if (code) {
            navigator.clipboard.writeText(code);
            target.textContent = "Copied!";
            setTimeout(() => {
                target.textContent = "Copy";
            }, 2000);
        }
        return;
    }
    // Handle internal link clicks
    if (target.tagName === "A" && target.classList.contains("doc-link")) {
        const href = target.getAttribute("href");
        if (href && !href.startsWith("http") && !href.startsWith("#")) {
            event.preventDefault();
            onNavigate?.(href);
        }
    }
    // Handle code run buttons
    if (target.classList.contains("run-code-button")) {
        const codeBlock = target.closest(".code-block");
        const code = codeBlock?.querySelector("code")?.textContent;
        if (code && onCodeRun) {
            onCodeRun(code);
        }
    }
}
