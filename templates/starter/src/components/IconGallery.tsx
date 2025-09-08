/**
 * Icon Gallery Component
 * Showcases Reynard's comprehensive fluent-icons collection
 */

import { Component, createSignal, createMemo, For } from "solid-js";
import { fluentIconsPackage } from "reynard-fluent-icons";
import { useNotifications } from "reynard-core";

export const IconGallery: Component = () => {
  const { notify } = useNotifications();
  const [searchTerm, setSearchTerm] = createSignal("");
  const [selectedCategory, setSelectedCategory] = createSignal("all");
  const [viewMode, setViewMode] = createSignal<"grid" | "list">("grid");

  // Icon categories for filtering
  const categories = [
    { id: "all", name: "All Icons", icon: "grid" },
    { id: "actions", name: "Actions", icon: "add" },
    { id: "interface", name: "Interface", icon: "settings" },
    { id: "navigation", name: "Navigation", icon: "home" },
    { id: "files", name: "Files", icon: "file" },
    { id: "status", name: "Status", icon: "checkmark" },
    { id: "media", name: "Media", icon: "play" },
    { id: "development", name: "Development", icon: "code" },
    { id: "theme", name: "Theme", icon: "palette" },
    { id: "animals", name: "Animals", icon: "fox" },
    { id: "security", name: "Security", icon: "lock" },
    { id: "custom", name: "Custom", icon: "yipyap" }
  ];

  // Get all available icons
  const allIcons = createMemo(() => {
    const icons: Array<{ name: string; svg: string; category: string; metadata?: any }> = [];
    
    // This is a simplified approach - in a real implementation, you'd iterate through all icon packages
    const iconNames = [
      // Actions
      "add", "delete", "edit", "save", "copy", "undo", "refresh", "checkmark",
      // Interface
      "settings", "search", "filter", "grid", "list", "eye", "dashboard", "chart",
      // Navigation
      "home", "back", "forward", "menu", "breadcrumb",
      // Files
      "file", "folder", "upload", "download", "link",
      // Status
      "success", "error", "warning", "info", "loading",
      // Media
      "play", "pause", "stop", "volume", "camera",
      // Development
      "code", "debug", "build", "git", "terminal",
      // Theme
      "light", "dark", "color", "palette", "contrast",
      // Animals
      "fox", "cat", "dog", "bird",
      // Security
      "lock", "unlock", "shield", "key",
      // Custom
      "yipyap", "favicon", "reynard-logo"
    ];

    iconNames.forEach(name => {
      const svgElement = fluentIconsPackage.getIcon(name);
      const metadata = fluentIconsPackage.getIconMetadata?.(name);
      if (svgElement) {
        icons.push({
          name,
          svg: svgElement.outerHTML, // Convert SVGElement to HTML string
          category: metadata?.category || "interface",
          metadata
        });
      }
    });

    return icons;
  });

  // Filter icons based on search and category
  const filteredIcons = createMemo(() => {
    let filtered = allIcons();
    
    if (selectedCategory() !== "all") {
      filtered = filtered.filter(icon => icon.category === selectedCategory());
    }
    
    if (searchTerm()) {
      const term = searchTerm().toLowerCase();
      filtered = filtered.filter(icon => 
        icon.name.toLowerCase().includes(term) ||
        icon.metadata?.description?.toLowerCase().includes(term) ||
        icon.metadata?.keywords?.some((keyword: string) => keyword.toLowerCase().includes(term))
      );
    }
    
    return filtered;
  });

  const handleIconClick = (iconName: string) => {
    notify(`Icon "${iconName}" clicked!`, "info");
  };

  const handleCopyIcon = (iconName: string, event: MouseEvent) => {
    event.stopPropagation();
    const iconSvgElement = fluentIconsPackage.getIcon(iconName);
    if (iconSvgElement) {
      navigator.clipboard.writeText(iconSvgElement.outerHTML);
      notify(`Icon "${iconName}" copied to clipboard!`, "success");
    }
  };

  return (
    <section class="icon-gallery-section">
      <div class="section-header">
        <h2>
          {fluentIconsPackage.getIcon("grid") && (
            <span class="section-icon">
              <div
                // eslint-disable-next-line solid/no-innerhtml
                innerHTML={fluentIconsPackage.getIcon("grid")?.outerHTML}
              />
            </span>
          )}
          Icon Gallery
        </h2>
        <p>Explore Reynard's comprehensive collection of Fluent UI icons</p>
      </div>

      <div class="gallery-controls">
        <div class="search-group">
          <div class="search-input-wrapper">
            {fluentIconsPackage.getIcon("search") && (
              <span class="search-icon">
                <div
                  // eslint-disable-next-line solid/no-innerhtml
                  innerHTML={fluentIconsPackage.getIcon("search")?.outerHTML}
                />
              </span>
            )}
            <input
              type="text"
              placeholder="Search icons..."
              value={searchTerm()}
              onInput={(e) => setSearchTerm(e.target.value)}
              class="search-input"
            />
          </div>
        </div>

        <div class="view-controls">
          <div class="category-filter">
            <select
              value={selectedCategory()}
              onChange={(e) => setSelectedCategory(e.target.value)}
              class="category-select"
              title="Filter icons by category"
            >
              <For each={categories}>{category => (
                <option value={category.id}>{category.name}</option>
              )}</For>
            </select>
          </div>

          <div class="view-toggle">
            <button
              class={`view-button ${viewMode() === "grid" ? "active" : ""}`}
              onClick={() => setViewMode("grid")}
              title="Grid View"
            >
              {fluentIconsPackage.getIcon("grid") && (
                <span
                  // eslint-disable-next-line solid/no-innerhtml
                  innerHTML={fluentIconsPackage.getIcon("grid")?.outerHTML}
                />
              )}
            </button>
            <button
              class={`view-button ${viewMode() === "list" ? "active" : ""}`}
              onClick={() => setViewMode("list")}
              title="List View"
            >
              {fluentIconsPackage.getIcon("list") && (
                <span
                  // eslint-disable-next-line solid/no-innerhtml
                  innerHTML={fluentIconsPackage.getIcon("list")?.outerHTML}
                />
              )}
            </button>
          </div>
        </div>
      </div>

      <div class="gallery-stats">
        <p>Showing {filteredIcons().length} of {allIcons().length} icons</p>
      </div>

      <div class={`icon-gallery ${viewMode()}`}>
        <For each={filteredIcons()}>{icon => (
          <div 
            class="icon-item"
            onClick={() => handleIconClick(icon.name)}
            title={icon.metadata?.description || icon.name}
          >
            <div class="icon-preview">
              <div
                class="icon-svg"
                // eslint-disable-next-line solid/no-innerhtml
                innerHTML={icon.svg}
              />
            </div>
            <div class="icon-info">
              <span class="icon-name">{icon.name}</span>
              {viewMode() === "list" && icon.metadata?.description && (
                <span class="icon-description">{icon.metadata.description}</span>
              )}
            </div>
            <button
              class="icon-copy"
              onClick={(e) => handleCopyIcon(icon.name, e)}
              title="Copy SVG"
            >
              {fluentIconsPackage.getIcon("copy") && (
                <span
                  // eslint-disable-next-line solid/no-innerhtml
                  innerHTML={fluentIconsPackage.getIcon("copy")?.outerHTML}
                />
              )}
            </button>
          </div>
        )}</For>
      </div>

      {filteredIcons().length === 0 && (
        <div class="no-results">
          <div class="no-results-icon">
            {fluentIconsPackage.getIcon("search") && (
              <div
                // eslint-disable-next-line solid/no-innerhtml
                innerHTML={fluentIconsPackage.getIcon("search")?.outerHTML}
              />
            )}
          </div>
          <h3>No icons found</h3>
          <p>Try adjusting your search terms or category filter</p>
        </div>
      )}
    </section>
  );
};
