/**
 * @fileoverview Main documentation site application
 */

import { Component, createSignal, createEffect, onMount } from "solid-js";
import { Router, Route, Routes } from "solid-router";
import { useTheme } from "reynard-themes";
import {
  DocsLayout,
  DocsHeader,
  DocsSidebar,
  DocsContent,
  DocsFooter,
  DocsNav,
  DocsSearch,
  DocsSearchModal,
} from "reynard-docs-components";
import { createDocEngine, DocEngineConfig } from "reynard-docs-core";

// Import pages
import { HomePage } from "./pages/HomePage";
import { PackagePage } from "./pages/PackagePage";
import { ApiPage } from "./pages/ApiPage";
import { ExamplePage } from "./pages/ExamplePage";
import { SearchPage } from "./pages/SearchPage";
import { NotFoundPage } from "./pages/NotFoundPage";

// Import styles
import "reynard-docs-components/styles";
import "./App.css";

/**
 * Main application component
 */
const App: Component = () => {
  const { theme, setTheme } = useTheme();
  const [docEngine, setDocEngine] = createSignal<any>(null);
  const [searchQuery, setSearchQuery] = createSignal("");
  const [searchResults, setSearchResults] = createSignal<any[]>([]);
  const [isSearchModalOpen, setIsSearchModalOpen] = createSignal(false);
  const [isLoading, setIsLoading] = createSignal(true);

  // Load documentation configuration
  onMount(async () => {
    try {
      const config = await loadDocConfig();
      const engine = createDocEngine(config);
      setDocEngine(engine);
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to load documentation:", error);
      setIsLoading(false);
    }
  });

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (docEngine()) {
      const results = docEngine().search(query);
      setSearchResults(results);
    }
  };

  // Handle search result click
  const handleSearchResultClick = (result: any) => {
    // Navigate to the result
    window.location.href = `/${result.slug}`;
  };

  // Navigation items
  const navigationItems = () => {
    if (!docEngine()) return [];

    const config = docEngine().config;
    return config.site.navigation.main || [];
  };

  // Sidebar content
  const sidebarContent = () => {
    if (!docEngine()) return null;

    const config = docEngine().config;
    const sections = config.sections || [];

    return (
      <div class="docs-sidebar-content">
        <DocsNav
          items={sections.map(section => ({
            label: section.title,
            children: section.pages.map(page => ({
              label: page.title,
              href: `/${page.slug}`,
            })),
          }))}
          orientation="vertical"
        />
      </div>
    );
  };

  // Header actions
  const headerActions = () => (
    <div class="docs-header-actions">
      <DocsSearch
        onSearch={handleSearch}
        onClear={() => handleSearch("")}
        placeholder="Search documentation..."
        class="docs-header-search"
      />
      <button
        class="docs-theme-toggle"
        onClick={() => setTheme(theme() === "light" ? "dark" : "light")}
        aria-label="Toggle theme"
      >
        {theme() === "light" ? "🌙" : "☀️"}
      </button>
    </div>
  );

  if (isLoading()) {
    return (
      <div class="docs-loading">
        <div class="docs-loading-spinner" />
        <p>Loading documentation...</p>
      </div>
    );
  }

  return (
    <Router>
      <DocsLayout
        header={
          <DocsHeader
            title="Reynard Documentation"
            logo="/logo.svg"
            navigation={<DocsNav items={navigationItems()} />}
            actions={headerActions()}
          />
        }
        sidebar={<DocsSidebar title="Documentation">{sidebarContent()}</DocsSidebar>}
        footer={
          <DocsFooter>
            <div class="docs-footer-content">
              <p>&copy; 2024 Reynard Framework. Built with ❤️ using SolidJS.</p>
              <div class="docs-footer-links">
                <a href="https://github.com/rakki194/reynard">GitHub</a>
                <a href="https://discord.gg/reynard">Discord</a>
                <a href="https://twitter.com/reynard_framework">Twitter</a>
              </div>
            </div>
          </DocsFooter>
        }
      >
        <Routes>
          <Route path="/" component={HomePage} />
          <Route path="/packages/:package" component={PackagePage} />
          <Route path="/packages/:package/api" component={ApiPage} />
          <Route path="/packages/:package/examples" component={ExamplePage} />
          <Route path="/search" component={SearchPage} />
          <Route path="*" component={NotFoundPage} />
        </Routes>
      </DocsLayout>

      <DocsSearchModal
        isOpen={isSearchModalOpen()}
        onClose={() => setIsSearchModalOpen(false)}
        onSearch={handleSearch}
        results={searchResults()}
        onResultClick={handleSearchResultClick}
        suggestions={["Getting Started", "API Reference", "Components", "Themes", "Examples"]}
      />
    </Router>
  );
};

/**
 * Load documentation configuration
 */
async function loadDocConfig(): Promise<DocEngineConfig> {
  try {
    // Try to load from generated docs
    const response = await fetch("/docs-generated/docs-config.json");
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn("Failed to load generated docs, using default config");
  }

  // Fallback to default configuration
  return {
    site: {
      title: "Reynard Documentation",
      description: "Beautiful documentation powered by Reynard framework",
      baseUrl: "/",
      theme: {
        name: "reynard-default",
        primaryColor: "#6366f1",
        secondaryColor: "#8b5cf6",
        backgroundColor: "#ffffff",
        textColor: "#1f2937",
        accentColor: "#f59e0b",
      },
      navigation: {
        main: [
          { label: "Getting Started", href: "/getting-started" },
          { label: "Packages", href: "/packages" },
          { label: "API Reference", href: "/api" },
        ],
        breadcrumbs: true,
        sidebar: true,
      },
    },
    pages: [],
    sections: [],
    examples: [],
    api: [],
    customComponents: {},
    plugins: [],
  };
}

export default App;
