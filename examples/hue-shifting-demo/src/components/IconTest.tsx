import { Component, createEffect } from "solid-js";
import { allIcons } from "reynard-fluent-icons";

export const IconTest: Component = () => {
  // Debug logging
  createEffect(() => {
    console.log("=== ICON DEBUG INFO ===");
    console.log("allIcons object:", allIcons);
    console.log("Available icon keys:", Object.keys(allIcons));
    console.log("Settings icon exists:", "settings" in allIcons);
    console.log("User icon exists:", "user" in allIcons);
    console.log("Tag icon exists:", "tag" in allIcons);
    console.log("Box icon exists:", "box" in allIcons);

    if ("settings" in allIcons) {
      console.log("Settings icon structure:", allIcons.settings);
      console.log("Settings SVG content:", allIcons.settings.svg);
      console.log("Settings SVG length:", allIcons.settings.svg?.length);
    }

    if ("user" in allIcons) {
      console.log("User icon structure:", allIcons.user);
      console.log("User SVG content:", allIcons.user.svg);
    }
  });

  return (
    <div style="padding: 20px; border: 2px solid red; margin: 20px; background: #fff;">
      <h3>🔍 Icon Debug Test</h3>

      <div style="margin-bottom: 20px;">
        <h4>Icon Availability Check:</h4>
        <ul>
          <li>Settings: {"settings" in allIcons ? "✅" : "❌"}</li>
          <li>User: {"user" in allIcons ? "✅" : "❌"}</li>
          <li>Tag: {"tag" in allIcons ? "✅" : "❌"}</li>
          <li>Box: {"box" in allIcons ? "✅" : "❌"}</li>
        </ul>
      </div>

      <div style="display: flex; gap: 20px; align-items: center; flex-wrap: wrap;">
        <div style="border: 2px solid blue; padding: 10px;">
          <h4>Settings Icon:</h4>
          <div
            style="width: 48px; height: 48px; border: 2px solid green; background: #f0f0f0;"
            innerHTML={allIcons.settings?.svg || "MISSING"}
          ></div>
          <p style="font-size: 12px; margin: 5px 0;">
            Length: {allIcons.settings?.svg?.length || 0}
          </p>
        </div>

        <div style="border: 2px solid blue; padding: 10px;">
          <h4>User Icon:</h4>
          <div
            style="width: 48px; height: 48px; border: 2px solid green; background: #f0f0f0;"
            innerHTML={allIcons.user?.svg || "MISSING"}
          ></div>
          <p style="font-size: 12px; margin: 5px 0;">
            Length: {allIcons.user?.svg?.length || 0}
          </p>
        </div>

        <div style="border: 2px solid blue; padding: 10px;">
          <h4>Tag Icon:</h4>
          <div
            style="width: 48px; height: 48px; border: 2px solid green; background: #f0f0f0;"
            innerHTML={allIcons.tag?.svg || "MISSING"}
          ></div>
          <p style="font-size: 12px; margin: 5px 0;">
            Length: {allIcons.tag?.svg?.length || 0}
          </p>
        </div>

        <div style="border: 2px solid blue; padding: 10px;">
          <h4>Box Icon:</h4>
          <div
            style="width: 48px; height: 48px; border: 2px solid green; background: #f0f0f0;"
            innerHTML={allIcons.box?.svg || "MISSING"}
          ></div>
          <p style="font-size: 12px; margin: 5px 0;">
            Length: {allIcons.box?.svg?.length || 0}
          </p>
        </div>
      </div>

      <div style="margin-top: 20px;">
        <h4>Raw SVG Content (Settings):</h4>
        <pre style="background: #f0f0f0; padding: 10px; font-size: 10px; overflow: auto; max-height: 200px; border: 1px solid #ccc;">
          {allIcons.settings?.svg || "NO SVG CONTENT"}
        </pre>
      </div>

      <div style="margin-top: 20px;">
        <h4>All Available Icons:</h4>
        <p style="font-size: 12px; word-break: break-all;">
          {Object.keys(allIcons).slice(0, 20).join(", ")}...
        </p>
      </div>
    </div>
  );
};
