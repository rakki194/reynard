/**
 * HTML output utilities for the docs generator
 */
import { promises as fs } from "fs";
import path from "path";
export async function writeOutput(config, docConfig) {
    const outputPath = path.join(config.rootPath, config.outputPath);
    await fs.mkdir(outputPath, { recursive: true });
    const configPath = path.join(outputPath, "docs-config.json");
    await fs.writeFile(configPath, JSON.stringify(docConfig, null, 2));
    if (docConfig.pages) {
        for (const page of docConfig.pages) {
            const htmlContent = await generateHtmlPage(page, docConfig);
            const pagePath = path.join(outputPath, "pages", `${page.slug}.html`);
            await fs.mkdir(path.dirname(pagePath), { recursive: true });
            await fs.writeFile(pagePath, htmlContent);
        }
    }
    if (docConfig.api && docConfig.api.length > 0) {
        const apiHtml = await generateApiHtml(docConfig.api, docConfig);
        const apiPath = path.join(outputPath, "api.html");
        await fs.writeFile(apiPath, apiHtml);
    }
    const indexHtml = await generateIndexHtml(docConfig);
    const indexPath = path.join(outputPath, "index.html");
    await fs.writeFile(indexPath, indexHtml);
    await copyAssets(outputPath);
}
export async function generateHtmlPage(page, config) {
    const { marked } = await import("marked");
    const hljs = await import("highlight.js");
    const renderer = new marked.Renderer();
    renderer.code = function ({ text, lang }) {
        if (lang && hljs.default.getLanguage(lang)) {
            try {
                const highlighted = hljs.default.highlight(text, {
                    language: lang,
                }).value;
                return `<pre><code class="hljs language-${lang}">${highlighted}</code></pre>`;
            }
            catch { }
        }
        const highlighted = hljs.default.highlightAuto(text).value;
        return `<pre><code class="hljs">${highlighted}</code></pre>`;
    };
    marked.setOptions({ renderer, breaks: true, gfm: true });
    const htmlContent = marked(page.content);
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${page.title} - ${config.site.title}</title>
  <link rel="stylesheet" href="../styles.css">
  <link rel="stylesheet" href="../highlight.css">
  <link rel="icon" href="${config.site.favicon || "/favicon.ico"}">
</head>
<body>
  <nav class="docs-nav">
    <div class="nav-brand"><a href="../index.html">${config.site.title}</a></div>
    <div class="nav-links"><a href="../index.html">Home</a><a href="../api.html">API Reference</a></div>
  </nav>
  <main class="docs-main">
    <div class="docs-content">
      <h1>${page.title}</h1>
      <div class="markdown-content">${htmlContent}</div>
    </div>
  </main>
  <footer class="docs-footer"><p>&copy; 2024 ${config.site.title}. Built with ❤️ using SolidJS.</p></footer>
</body>
</html>`;
}
export async function generateApiHtml(apiDocs, config) {
    const apiGroups = new Map();
    for (const api of apiDocs) {
        const packageName = api.source?.file?.split("/")?.[2] || "Unknown";
        if (!apiGroups.has(packageName))
            apiGroups.set(packageName, []);
        apiGroups.get(packageName).push(api);
    }
    let htmlContent = "<h1>API Reference</h1>\n";
    for (const [packageName, apis] of apiGroups) {
        htmlContent += `<h2>${packageName}</h2>\n`;
        const typeGroups = new Map();
        for (const api of apis) {
            if (!typeGroups.has(api.type))
                typeGroups.set(api.type, []);
            typeGroups.get(api.type).push(api);
        }
        for (const [type, typeApis] of typeGroups) {
            htmlContent += `<h3>${type.charAt(0).toUpperCase() + type.slice(1)}s</h3>\n`;
            for (const api of typeApis)
                htmlContent += generateApiItemHtml(api);
        }
    }
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>API Reference - ${config.site.title}</title>
  <link rel="stylesheet" href="styles.css">
  <link rel="stylesheet" href="highlight.css">
  <link rel="icon" href="${config.site.favicon || "/favicon.ico"}">
</head>
<body>
  <nav class="docs-nav">
    <div class="nav-brand"><a href="index.html">${config.site.title}</a></div>
    <div class="nav-links"><a href="index.html">Home</a><a href="api.html">API Reference</a></div>
  </nav>
  <main class="docs-main"><div class="docs-content">${htmlContent}</div></main>
  <footer class="docs-footer"><p>&copy; 2024 ${config.site.title}. Built with ❤️ using SolidJS.</p></footer>
</body>
</html>`;
}
export function generateApiItemHtml(api) {
    let html = `<div class="api-item"><h4 id="${api.name}">${api.name}</h4><div class="api-type">Type: <code>${api.type}</code></div>`;
    if (api.description)
        html += `<div class="api-description">${api.description}</div>`;
    if (api.parameters && api.parameters.length > 0) {
        html += `<div class="api-parameters"><h5>Parameters</h5><table><thead><tr><th>Name</th><th>Type</th><th>Required</th><th>Description</th></tr></thead><tbody>`;
        for (const param of api.parameters) {
            html += `<tr><td><code>${param.name}</code></td><td><code>${param.type}</code></td><td>${param.required ? "Yes" : "No"}</td><td>${param.description}</td></tr>`;
        }
        html += `</tbody></table></div>`;
    }
    if (api.returns)
        html += `<div class="api-returns"><h5>Returns</h5><code>${api.returns.type}</code> - ${api.returns.description}</div>`;
    if (api.examples && api.examples.length > 0) {
        html += `<div class="api-examples"><h5>Examples</h5>`;
        for (const example of api.examples)
            html += `<pre><code class="language-typescript">${example}</code></pre>`;
        html += `</div>`;
    }
    if (api.deprecated)
        html += `<div class="api-deprecated">⚠️ <strong>Deprecated</strong> - This API is deprecated and may be removed in future versions.</div>`;
    html += `</div>`;
    return html;
}
export async function generateIndexHtml(config) {
    let packagesHtml = "";
    if (config.sections && config.sections.length > 0) {
        for (const section of config.sections) {
            packagesHtml += `<h2>${section.title}</h2><ul>`;
            for (const page of section.pages)
                packagesHtml += `<li><a href="pages/${page.slug}.html">${page.title}</a></li>`;
            packagesHtml += `</ul>`;
        }
    }
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${config.site.title}</title>
  <link rel="stylesheet" href="styles.css">
  <link rel="stylesheet" href="highlight.css">
  <link rel="icon" href="${config.site.favicon || "/favicon.ico"}">
</head>
<body>
  <nav class="docs-nav">
    <div class="nav-brand"><a href="index.html">${config.site.title}</a></div>
    <div class="nav-links"><a href="index.html">Home</a><a href="api.html">API Reference</a></div>
  </nav>
  <main class="docs-main">
    <div class="docs-content">
      <h1>${config.site.title}</h1>
      <p class="lead">${config.site.description}</p>
      <div class="quick-links"><a href="api.html" class="quick-link"><h3>📚 API Reference</h3><p>Complete TypeScript API documentation</p></a></div>
      <div class="packages-section"><h2>Packages</h2>${packagesHtml}</div>
    </div>
  </main>
  <footer class="docs-footer"><p>&copy; 2024 ${config.site.title}. Built with ❤️ using SolidJS.</p></footer>
</body>
</html>`;
}
export async function copyAssets(outputPath) {
    const cssContent = `/* Reynard Documentation Styles */\n:root {\n  --primary-color: #6366f1;\n  --secondary-color: #8b5cf6;\n  --text-color: #1f2937;\n  --bg-color: #ffffff;\n  --border-color: #e5e7eb;\n  --code-bg: #f3f4f6;\n}\n* {\n  margin: 0;\n  padding: 0;\n  box-sizing: border-box;\n}\nbody {\n  font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;\n  line-height: 1.6;\n  color: var(--text-color);\n  background-color: var(--bg-color);\n}\n.docs-nav {\n  background: var(--primary-color);\n  color: white;\n  padding: 1rem 2rem;\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}\n.nav-brand a {\n  color: white;\n  text-decoration: none;\n  font-weight: bold;\n  font-size: 1.2rem;\n}\n.nav-links {\n  display: flex;\n  gap: 2rem;\n}\n.nav-links a {\n  color: white;\n  text-decoration: none;\n  opacity: 0.9;\n  transition: opacity 0.2s;\n}\n.nav-links a:hover {\n  opacity: 1;\n}\n.docs-main {\n  max-width: 1200px;\n  margin: 0 auto;\n  padding: 2rem;\n}\n.docs-content h1 {\n  color: var(--primary-color);\n  margin-bottom: 1rem;\n}\n.lead {\n  font-size: 1.2rem;\n  color: #6b7280;\n  margin-bottom: 2rem;\n}\n.quick-links {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));\n  gap: 1.5rem;\n  margin-bottom: 3rem;\n}\n.quick-link {\n  display: block;\n  padding: 1.5rem;\n  border: 1px solid var(--border-color);\n  border-radius: 8px;\n  text-decoration: none;\n  color: inherit;\n  transition: all 0.2s;\n}\n.quick-link:hover {\n  border-color: var(--primary-color);\n  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);\n}\n.quick-link h3 {\n  color: var(--primary-color);\n  margin-bottom: 0.5rem;\n}\n.api-item {\n  border: 1px solid var(--border-color);\n  border-radius: 8px;\n  padding: 1.5rem;\n  margin-bottom: 1.5rem;\n}\n.api-item h4 {\n  color: var(--primary-color);\n  margin-bottom: 0.5rem;\n}\n.api-type {\n  font-size: 0.9rem;\n  color: #6b7280;\n  margin-bottom: 1rem;\n}\n.api-description {\n  margin-bottom: 1rem;\n}\n.api-parameters table {\n  width: 100%;\n  border-collapse: collapse;\n  margin-bottom: 1rem;\n}\n.api-parameters th, .api-parameters td {\n  padding: 0.5rem;\n  text-align: left;\n  border-bottom: 1px solid var(--border-color);\n}\n.api-parameters th {\n  background-color: var(--code-bg);\n  font-weight: 600;\n}\n.api-returns {\n  margin-bottom: 1rem;\n}\n.api-examples pre {\n  background-color: var(--code-bg);\n  padding: 1rem;\n  border-radius: 4px;\n  overflow-x: auto;\n  margin-bottom: 1rem;\n}\n.api-deprecated {\n  background-color: #fef3c7;\n  border: 1px solid #f59e0b;\n  border-radius: 4px;\n  padding: 0.75rem;\n  color: #92400e;\n}\n.markdown-content h1, .markdown-content h2, .markdown-content h3, .markdown-content h4, .markdown-content h5, .markdown-content h6 {\n  color: var(--primary-color);\n  margin-top: 2rem;\n  margin-bottom: 1rem;\n}\n.markdown-content p {\n  margin-bottom: 1rem;\n}\n.markdown-content code {\n  background-color: var(--code-bg);\n  padding: 0.2rem 0.4rem;\n  border-radius: 3px;\n  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;\n}\n.markdown-content pre {\n  background-color: var(--code-bg);\n  padding: 1rem;\n  border-radius: 4px;\n  overflow-x: auto;\n  margin-bottom: 1rem;\n}\n.markdown-content pre code {\n  background: none;\n  padding: 0;\n}\n.markdown-content ul, .markdown-content ol {\n  margin-left: 2rem;\n  margin-bottom: 1rem;\n}\n.markdown-content li {\n  margin-bottom: 0.5rem;\n}\n.docs-footer {\n  background-color: var(--code-bg);\n  padding: 2rem;\n  text-align: center;\n  margin-top: 3rem;\n  color: #6b7280;\n}\n.packages-section ul {\n  list-style: none;\n  margin-left: 0;\n}\n.packages-section li {\n  margin-bottom: 0.5rem;\n}\n.packages-section a {\n  color: var(--primary-color);\n  text-decoration: none;\n}\n.packages-section a:hover {\n  text-decoration: underline;\n}`;
    const cssPath = path.join(outputPath, "styles.css");
    await fs.writeFile(cssPath, cssContent);
    const highlightCssContent = `/* Syntax Highlighting Styles */\n.hljs { display: block; overflow-x: auto; padding: 1rem; background: #f8f9fa; border-radius: 4px; border: 1px solid #e9ecef; font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace; font-size: 0.875rem; line-height: 1.5; color: #24292e; }\n.hljs { color: #24292e !important; }\n.hljs-comment, .hljs-quote { color: #6a737d; font-style: italic; }\n.hljs-keyword, .hljs-selector-tag, .hljs-subst { color: #d73a49; font-weight: bold; }\n.hljs-number, .hljs-literal, .hljs-variable, .hljs-template-variable, .hljs-tag .hljs-attr { color: #005cc5; }\n.hljs-string, .hljs-doctag { color: #032f62; }\n.hljs-title, .hljs-section, .hljs-selector-id { color: #6f42c1; font-weight: bold; }\n.hljs-subst { font-weight: normal; }\n.hljs-type, .hljs-class .hljs-title { color: #d73a49; font-weight: bold; }\n.hljs-tag, .hljs-name, .hljs-attribute { color: #22863a; font-weight: normal; }\n.hljs-regexp, .hljs-link { color: #032f62; }\n.hljs-symbol, .hljs-bullet { color: #e36209; }\n.hljs-built_in, .hljs-builtin-name { color: #005cc5; }\n.hljs-meta { color: #6a737d; }\n.hljs-punctuation, .hljs-operator { color: #24292e; }\n.hljs-bracket, .hljs-brace { color: #24292e; }\n.hljs * { color: inherit; }\n.hljs-deletion { background: #ffeef0; }\n.hljs-addition { background: #f0fff4; }\n.hljs-emphasis { font-style: italic; }\n.hljs-strong { font-weight: bold; }\n.language-typescript .hljs-keyword, .language-tsx .hljs-keyword { color: #d73a49; }\n.language-typescript .hljs-string, .language-tsx .hljs-string { color: #032f62; }\n.language-python .hljs-keyword { color: #d73a49; }\n.language-python .hljs-string { color: #032f62; }\n.language-bash .hljs-comment { color: #6a737d; }\n.language-json .hljs-attr { color: #005cc5; }\n.language-json .hljs-string { color: #032f62; }\n.language-yaml .hljs-attr { color: #005cc5; }\n.language-yaml .hljs-string { color: #032f62; }\n@media (prefers-color-scheme: dark) { .hljs { background: #2d3748; border-color: #4a5568; color: #e2e8f0; } .hljs-comment, .hljs-quote { color: #a0aec0; } .hljs-keyword, .hljs-selector-tag, .hljs-subst { color: #f56565; } .hljs-number, .hljs-literal, .hljs-variable, .hljs-template-variable, .hljs-tag .hljs-attr { color: #63b3ed; } .hljs-string, .hljs-doctag { color: #68d391; } .hljs-title, .hljs-section, .hljs-selector-id { color: #b794f6; } .hljs-type, .hljs-class .hljs-title { color: #f56565; } .hljs-tag, .hljs-name, .hljs-attribute { color: #68d391; } .hljs-regexp, .hljs-link { color: #68d391; } .hljs-symbol, .hljs-bullet { color: #f6ad55; } .hljs-built_in, .hljs-builtin-name { color: #63b3ed; } .hljs-meta { color: #a0aec0; } }`;
    const highlightCssPath = path.join(outputPath, "highlight.css");
    await fs.writeFile(highlightCssPath, highlightCssContent);
}
