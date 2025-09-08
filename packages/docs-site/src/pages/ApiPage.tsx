/**
 * @fileoverview API documentation page
 */

import { Component, createSignal, onMount } from 'solid-js';
import { useParams } from 'solid-router';
import { 
  DocsPage, 
  DocsSection, 
  DocsBreadcrumbs,
  DocsTabs,
  DocsTabPanel
} from 'reynard-docs-components';
import { ApiDocRenderer } from 'reynard-docs-core';

/**
 * API documentation page component
 */
export const ApiPage: Component = () => {
  const params = useParams();
  const [apiData, setApiData] = createSignal<any>(null);
  const [isLoading, setIsLoading] = createSignal(true);
  const [activeTab, setActiveTab] = createSignal('overview');

  onMount(async () => {
    try {
      const packageName = params.package;
      const response = await fetch(`/docs-generated/pages/${packageName}-api.json`);
      
      if (response.ok) {
        const data = await response.json();
        setApiData(data);
      } else {
        console.error('API documentation not found');
      }
    } catch (error) {
      console.error('Failed to load API data:', error);
    } finally {
      setIsLoading(false);
    }
  });

  const breadcrumbs = () => {
    const packageName = params.package;
    return [
      { label: 'Home', href: '/' },
      { label: 'Packages', href: '/packages' },
      { label: packageName, href: `/packages/${packageName}` },
      { label: 'API', href: `/packages/${packageName}/api` }
    ];
  };

  const tabs = () => [
    { id: 'overview', label: 'Overview' },
    { id: 'functions', label: 'Functions' },
    { id: 'classes', label: 'Classes' },
    { id: 'types', label: 'Types' },
    { id: 'interfaces', label: 'Interfaces' }
  ];

  if (isLoading()) {
    return (
      <DocsPage>
        <div class="docs-loading">
          <div class="docs-loading-spinner" />
          <p>Loading API documentation...</p>
        </div>
      </DocsPage>
    );
  }

  if (!apiData()) {
    return (
      <DocsPage>
        <div class="docs-error">
          <h1>API Documentation Not Found</h1>
          <p>The API documentation for "{params.package}" could not be found.</p>
          <a href={`/packages/${params.package}`} class="docs-error-link">← Back to Package</a>
        </div>
      </DocsPage>
    );
  }

  const apiInfo = apiData();

  return (
    <DocsPage>
      <DocsBreadcrumbs items={breadcrumbs()} />
      
      <DocsSection>
        <h1 class="docs-api-title">{apiInfo.title}</h1>
        <p class="docs-api-description">{apiInfo.metadata.description}</p>
      </DocsSection>

      <DocsSection>
        <DocsTabs
          tabs={tabs()}
          activeTab={activeTab()}
          onTabChange={setActiveTab}
        />

        <DocsTabPanel tabId="overview" activeTab={activeTab()}>
          <div class="docs-api-overview">
            <DocRenderer
              content={apiInfo.content}
              metadata={apiInfo.metadata}
              type={apiInfo.type}
            />
          </div>
        </DocsTabPanel>

        <DocsTabPanel tabId="functions" activeTab={activeTab()}>
          <div class="docs-api-functions">
            <h2>Functions</h2>
            <div class="docs-api-list">
              {/* Render function APIs */}
            </div>
          </div>
        </DocsTabPanel>

        <DocsTabPanel tabId="classes" activeTab={activeTab()}>
          <div class="docs-api-classes">
            <h2>Classes</h2>
            <div class="docs-api-list">
              {/* Render class APIs */}
            </div>
          </div>
        </DocsTabPanel>

        <DocsTabPanel tabId="types" activeTab={activeTab()}>
          <div class="docs-api-types">
            <h2>Types</h2>
            <div class="docs-api-list">
              {/* Render type APIs */}
            </div>
          </div>
        </DocsTabPanel>

        <DocsTabPanel tabId="interfaces" activeTab={activeTab()}>
          <div class="docs-api-interfaces">
            <h2>Interfaces</h2>
            <div class="docs-api-list">
              {/* Render interface APIs */}
            </div>
          </div>
        </DocsTabPanel>
      </DocsSection>
    </DocsPage>
  );
};
