/**
 * @fileoverview Package documentation page
 */
import { createSignal, onMount, For } from "solid-js";
import { useParams } from "solid-router";
import { DocsPage, DocsSection, DocsBreadcrumbs, DocsCodeBlock } from "reynard-docs-components";
import { DocRenderer } from "reynard-docs-core";
/**
 * Package documentation page component
 */
export const PackagePage = () => {
    const params = useParams();
    const [packageData, setPackageData] = createSignal(null);
    const [isLoading, setIsLoading] = createSignal(true);
    onMount(async () => {
        try {
            const packageName = params.package;
            const response = await fetch(`/docs-generated/pages/${packageName}.json`);
            if (response.ok) {
                const data = await response.json();
                setPackageData(data);
            }
            else {
                console.error("Package not found");
            }
        }
        catch (error) {
            console.error("Failed to load package data:", error);
        }
        finally {
            setIsLoading(false);
        }
    });
    const breadcrumbs = () => {
        const packageName = params.package;
        return [
            { label: "Home", href: "/" },
            { label: "Packages", href: "/packages" },
            { label: packageName, href: `/packages/${packageName}` },
        ];
    };
    if (isLoading()) {
        return (<DocsPage>
        <div class="docs-loading">
          <div class="docs-loading-spinner"/>
          <p>Loading package documentation...</p>
        </div>
      </DocsPage>);
    }
    if (!packageData()) {
        return (<DocsPage>
        <div class="docs-error">
          <h1>Package Not Found</h1>
          <p>The package "{params.package}" could not be found.</p>
          <a href="/" class="docs-error-link">
            ← Back to Home
          </a>
        </div>
      </DocsPage>);
    }
    const packageInfo = packageData();
    return (<DocsPage>
      <DocsBreadcrumbs items={breadcrumbs()}/>

      <DocsSection>
        <div class="docs-package-header">
          <h1 class="docs-package-title">{packageInfo.title}</h1>
          <div class="docs-package-meta">
            <span class="docs-package-version">v{packageInfo.metadata.version}</span>
            <span class="docs-package-category">{packageInfo.metadata.category}</span>
          </div>
        </div>

        <div class="docs-package-description">{packageInfo.metadata.description}</div>

        <div class="docs-package-actions">
          <a href={`/packages/${params.package}/api`} class="docs-package-button">
            View API
          </a>
          <a href={`/packages/${params.package}/examples`} class="docs-package-button">
            View Examples
          </a>
        </div>
      </DocsSection>

      <DocsSection title="Installation">
        <DocsCodeBlock code={`npm install ${packageInfo.metadata.name || params.package}`} language="bash" title="Install via npm" copyable={true}/>
      </DocsSection>

      <DocsSection title="Quick Start">
        <div class="docs-package-content">
          <DocRenderer content={packageInfo.content} metadata={packageInfo.metadata} type={packageInfo.type}/>
        </div>
      </DocsSection>

      <DocsSection title="Features">
        <div class="docs-package-features">
          {<For each={packageInfo.metadata.tags}>
              {(tag) => <span class="docs-package-feature">{tag}</span>}
            </For>}
        </div>
      </DocsSection>

      <DocsSection title="Links">
        <div class="docs-package-links">
          {packageInfo.metadata.homepage && (<a href={packageInfo.metadata.homepage} class="docs-package-link">
              Homepage
            </a>)}
          {packageInfo.metadata.repository?.url && (<a href={packageInfo.metadata.repository.url} class="docs-package-link">
              Repository
            </a>)}
          {packageInfo.metadata.bugs?.url && (<a href={packageInfo.metadata.bugs.url} class="docs-package-link">
              Report Issues
            </a>)}
        </div>
      </DocsSection>
    </DocsPage>);
};
