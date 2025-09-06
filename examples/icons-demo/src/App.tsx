/**
 * Reynard Icons Demo - Main Application Component
 * A comprehensive icon showcase and demo application
 */

import {
  Component,
  createSignal,
  createMemo,
  Show,
} from "solid-js";
import {
  NotificationsProvider,
  createNotifications,
} from "reynard-core";
import { ReynardProvider, useTheme } from "reynard-themes";
import "reynard-themes/themes.css";
import { IconGrid } from "./components/IconGrid";
import { SearchSection } from "./components/SearchSection";
import { IconModal } from "./components/IconModal";
import { ThemeToggle } from "./components/ThemeToggle";
import { CategoryStats } from "./components/CategoryStats";
import { 
  iconCategories, 
  allIcons,
  getIcon
} from "reynard-fluent-icons";

type TabType = "browse" | "search" | "categories" | "stats";

const IconsDemo: Component = () => {
  const [activeTab, setActiveTab] = createSignal<TabType>("browse");
  const [searchQuery, setSearchQuery] = createSignal("");
  const [selectedCategory, setSelectedCategory] = createSignal<string>("all");
  const [selectedIcon, setSelectedIcon] = createSignal<string | null>(null);
  const { theme } = useTheme();

  const tabs = [
    { id: "browse" as TabType, label: "Browse All", icon: "grid" },
    { id: "search" as TabType, label: "Search", icon: "search" },
    { id: "categories" as TabType, label: "Categories", icon: "folder" },
    { id: "stats" as TabType, label: "Statistics", icon: "chart" },
  ];

  // Filter icons based on search and category
  const filteredIcons = createMemo(() => {
    let icons = Object.entries(allIcons);
    
    // Filter by category
    if (selectedCategory() !== "all") {
      const categoryIcons = Object.keys(iconCategories[selectedCategory() as keyof typeof iconCategories]?.icons || {});
      icons = icons.filter(([name]) => categoryIcons.includes(name));
    }
    
    // Filter by search query
    const query = searchQuery().toLowerCase();
    if (query) {
      icons = icons.filter(([name, iconData]) => {
        const metadata = iconData.metadata;
        return (
          name.toLowerCase().includes(query) ||
          metadata.description?.toLowerCase().includes(query) ||
          metadata.keywords?.some(keyword => keyword.toLowerCase().includes(query)) ||
          metadata.tags?.some(tag => tag.toLowerCase().includes(query))
        );
      });
    }
    
    return icons;
  });

  const renderActiveTab = () => {
    switch (activeTab()) {
      case "browse":
        return (
          <IconGrid 
            icons={filteredIcons()} 
            onIconClick={setSelectedIcon}
          />
        );
      case "search":
        return (
          <>
            <SearchSection 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              resultCount={filteredIcons().length}
            />
            <IconGrid 
              icons={filteredIcons()} 
              onIconClick={setSelectedIcon}
            />
          </>
        );
      case "categories":
        return (
          <div class="categories-view">
            <h2>Icon Categories</h2>
            <div class="category-grid">
              {Object.entries(iconCategories).map(([key, category]) => (
                <div class="category-card">
                  <h3>{category.name}</h3>
                  <p>{category.description}</p>
                  <div class="category-icon-count">
                    {Object.keys(category.icons).length} icons
                  </div>
                  <button 
                    class="view-category-btn"
                    onClick={() => {
                      setSelectedCategory(key);
                      setActiveTab("search");
                    }}
                  >
                    View Icons
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      case "stats":
        return <CategoryStats />;
      default:
        return (
          <IconGrid 
            icons={filteredIcons()} 
            onIconClick={setSelectedIcon}
          />
        );
    }
  };

  return (
    <div class="app">
      <header class="app-header">
        <h1>
          <span class="reynard-logo"></span>
          Reynard Icons Demo
        </h1>
        <p>Comprehensive Fluent UI Icons Collection - Built with Reynard Framework</p>
        <div class="header-controls">
          <div class="theme-info">
            Current theme: {theme()}
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main class="app-main">
        <div class="tab-navigation">
          {tabs.map((tab) => {
            const iconElement = getIcon(tab.icon);
            return (
              <button
                class={`tab-button ${activeTab() === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span class="icon">
                  {iconElement && (
                    <div innerHTML={iconElement} />
                  )}
                </span>
                {tab.label}
              </button>
            );
          })}
        </div>

        <Show when={activeTab()}>
          {renderActiveTab()}
        </Show>
      </main>

      <Show when={selectedIcon()}>
        <IconModal 
          iconName={selectedIcon()!} 
          onClose={() => setSelectedIcon(null)} 
        />
      </Show>
    </div>
  );
};

const App: Component = () => {
  const notificationsModule = createNotifications();

  return (
    <ReynardProvider>
      <NotificationsProvider value={notificationsModule}>
        <IconsDemo />
      </NotificationsProvider>
    </ReynardProvider>
  );
};

export default App;
