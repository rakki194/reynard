/**
 * Playground Code Examples
 * Utility functions for generating code examples in the component playground
 */

export interface TabId {
  id: string;
}

export const getCodeExample = (activeTab: string): string => {
  switch (activeTab) {
    case "notifications":
      return `import { useNotifications } from "reynard-core";

const { notify } = useNotifications();

// Send a notification
notify("Hello World!", "success");

// Send with custom duration
notify("This won't auto-dismiss", "error", { duration: 0 });`;
    
    case "icons":
      return `import { fluentIconsPackage } from "reynard-fluent-icons";

// Get an icon
const saveIcon = fluentIconsPackage.getIcon("save");

// Use in JSX
<div innerHTML={saveIcon}></div>

// Get icon metadata
const metadata = fluentIconsPackage.getIconMetadata("save");`;
    
    case "themes":
      return `import { useTheme } from "reynard-themes";

const { theme, setTheme, availableThemes } = useTheme();

// Change theme
setTheme("dark");

// Get current theme
console.log("Current theme:", theme);`;
    
    case "storage":
      return `import { useLocalStorage } from "reynard-core";

const [value, setValue, remove] = useLocalStorage("my-key", {
  defaultValue: "default value"
});

// Update value
setValue("new value");

// Remove from storage
remove();`;
    
    default:
      return "";
  }
};
