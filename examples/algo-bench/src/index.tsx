import { render } from "solid-js/web";
import App from "./App";
import "reynard-themes/themes.css";
import "./styles.css";

console.log("🦊 Starting Reynard 3D Demo...");
console.log("📦 SolidJS version:", typeof render);
console.log("🎯 Root element:", document.getElementById("root"));

try {
  console.log("🚀 Attempting to render simple app...");

  // Clear the loading indicator first
  const root = document.getElementById("root")!;
  const loadingIndicator = document.getElementById("loading-indicator");
  if (loadingIndicator) {
    console.log("🗑️ Removing loading indicator...");
    loadingIndicator.remove();
  }

  const cleanup = render(() => {
    console.log("🎨 App component rendering...");
    return <App />;
  }, root);

  console.log("✅ Simple app rendered successfully!", cleanup);
} catch (error) {
  console.error("❌ Failed to render simple app:", error);
  document.getElementById("root")!.innerHTML = `
    <div style="padding: 20px; color: red; background: #f0f0f0;">
      <h1>❌ Render Error</h1>
      <p>Failed to render the app:</p>
      <pre>${error}</pre>
    </div>
  `;
}
