/**
 * @fileoverview Examples page
 */

import { Component, createSignal, onMount } from "solid-js";
import { useParams } from "solid-router";
import {
  DocsPage,
  DocsSection,
  DocsBreadcrumbs,
} from "reynard-docs-components";
import { CodeExampleRenderer } from "reynard-docs-core";

/**
 * Examples page component
 */
export const ExamplePage: Component = () => {
  const params = useParams();
  const [exampleData, setExampleData] = createSignal<any>(null);
  const [isLoading, setIsLoading] = createSignal(true);

  onMount(async () => {
    try {
      const packageName = params.package;
      const response = await fetch(
        `/docs-generated/pages/${packageName}-examples.json`,
      );

      if (response.ok) {
        const data = await response.json();
        setExampleData(data);
      } else {
        console.error("Examples not found");
      }
    } catch (error) {
      console.error("Failed to load examples data:", error);
    } finally {
      setIsLoading(false);
    }
  });

  const breadcrumbs = () => {
    const packageName = params.package;
    return [
      { label: "Home", href: "/" },
      { label: "Packages", href: "/packages" },
      { label: packageName, href: `/packages/${packageName}` },
      { label: "Examples", href: `/packages/${packageName}/examples` },
    ];
  };

  if (isLoading()) {
    return (
      <DocsPage>
        <div class="docs-loading">
          <div class="docs-loading-spinner" />
          <p>Loading examples...</p>
        </div>
      </DocsPage>
    );
  }

  if (!exampleData()) {
    return (
      <DocsPage>
        <div class="docs-error">
          <h1>Examples Not Found</h1>
          <p>No examples found for "{params.package}".</p>
          <a href={`/packages/${params.package}`} class="docs-error-link">
            ← Back to Package
          </a>
        </div>
      </DocsPage>
    );
  }

  const examples = exampleData();

  return (
    <DocsPage>
      <DocsBreadcrumbs items={breadcrumbs()} />

      <DocsSection>
        <h1 class="docs-examples-title">{examples.title}</h1>
        <p class="docs-examples-description">{examples.metadata.description}</p>
      </DocsSection>

      <DocsSection>
        <div class="docs-examples-content">
          <CodeExampleRenderer
            example={{
              id: "basic-usage",
              title: "Basic Usage",
              description: "A simple example showing basic usage",
              code: `import { Button } from 'reynard-components';

function App() {
  return (
    <Button variant="primary">
      Hello World!
    </Button>
  );
}`,
              language: "tsx",
              live: true,
              editable: true,
            }}
            onRun={(code) => {
              console.log("Running code:", code);
            }}
          />
        </div>
      </DocsSection>
    </DocsPage>
  );
};
