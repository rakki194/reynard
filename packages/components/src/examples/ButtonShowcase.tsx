/**
 * Button Showcase Component
 * Demonstrates all the enhanced button components and their features
 */

import { Component, createSignal } from "solid-js";
import { Button, IconButton, SidebarButton } from "../primitives";
import { BreadcrumbButton, BreadcrumbActionButton } from "../navigation";
import { Icon } from "../icons";

export const ButtonShowcase: Component = () => {
  const [progress, setProgress] = createSignal(0);
  const [activeButton, setActiveButton] = createSignal<string | null>(null);

  // Simulate progress
  const startProgress = () => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  return (
    <div style={{ padding: "2rem", "max-width": "1200px", margin: "0 auto" }}>
      <h1>🦊 Reynard Button System Showcase</h1>
      <p>
        Enhanced button components with advanced features inspired by Yipyap
      </p>

      {/* Enhanced Icon Component */}
      <section style={{ margin: "2rem 0" }}>
        <h2>Enhanced Icon Component</h2>
        <div
          style={{
            display: "flex",
            gap: "1rem",
            "flex-wrap": "wrap",
            "align-items": "center",
          }}
        >
          <Icon name="settings" size="sm" />
          <Icon name="settings" size="md" />
          <Icon name="settings" size="lg" />
          <Icon name="settings" variant="primary" />
          <Icon name="settings" variant="error" />
          <Icon name="settings" variant="success" />
          <Icon
            name="settings"
            interactive
            tooltip="Click me!"
            onClick={() => alert("Icon clicked!")}
          />
          <Icon name="settings" active />
          <Icon name="settings" loading />
          <Icon name="settings" glow glowColor="var(--accent)" />
          <Icon name="settings" progress={progress()} />
        </div>
        <button onClick={startProgress} style={{ margin: "1rem 0" }}>
          Start Progress Demo
        </button>
      </section>

      {/* Button Variants */}
      <section style={{ margin: "2rem 0" }}>
        <h2>Button Variants</h2>
        <div style={{ display: "flex", gap: "1rem", "flex-wrap": "wrap" }}>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="tertiary">Tertiary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="icon">Icon</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="success">Success</Button>
          <Button variant="warning">Warning</Button>
        </div>
      </section>

      {/* IconButton Component */}
      <section style={{ margin: "2rem 0" }}>
        <h2>IconButton Component</h2>
        <div style={{ display: "flex", gap: "1rem", "flex-wrap": "wrap" }}>
          <IconButton icon="save" variant="primary">
            Save
          </IconButton>
          <IconButton
            icon="delete"
            variant="danger"
            iconOnly
            tooltip="Delete item"
          />
          <IconButton icon="upload" variant="success" iconPosition="right">
            Upload
          </IconButton>
          <IconButton icon="settings" variant="secondary" iconOnly />
          <IconButton icon="download" variant="primary" loading />
          <IconButton icon="refresh" variant="default" progress={progress()} />
          <IconButton icon="star" variant="warning" glow />
          <IconButton
            icon="heart"
            variant="error"
            active={activeButton() === "heart"}
            onClick={() =>
              setActiveButton(activeButton() === "heart" ? null : "heart")
            }
          />
        </div>
      </section>

      {/* SidebarButton Component */}
      <section style={{ margin: "2rem 0" }}>
        <h2>SidebarButton Component</h2>
        <div
          style={{
            display: "flex",
            "flex-direction": "column",
            gap: "1rem",
            "max-width": "300px",
          }}
        >
          <SidebarButton
            icon="home"
            label="Home"
            active={activeButton() === "home"}
            onClick={() =>
              setActiveButton(activeButton() === "home" ? null : "home")
            }
          />
          <SidebarButton
            icon="folder"
            label="Documents"
            secondaryIcon="chevron-right"
            showSecondaryActions
            secondaryActions={[
              {
                icon: "add",
                ariaLabel: "Add document",
                tooltip: "Add new document",
                onClick: () => alert("Add document clicked!"),
              },
              {
                icon: "settings",
                ariaLabel: "Folder settings",
                tooltip: "Configure folder",
                onClick: () => alert("Folder settings clicked!"),
              },
            ]}
          />
          <SidebarButton
            icon="settings"
            label="Settings"
            layout="toggle"
            showContent
            content={
              <div style={{ padding: "1rem" }}>Settings content goes here</div>
            }
          />
          <SidebarButton
            icon="upload"
            label="Upload Progress"
            progress={progress()}
            loading={progress() > 0 && progress() < 100}
          />
        </div>
      </section>

      {/* BreadcrumbButton Components */}
      <section style={{ margin: "2rem 0" }}>
        <h2>BreadcrumbButton Components</h2>
        <div
          style={{
            display: "flex",
            gap: "1rem",
            "flex-wrap": "wrap",
            "align-items": "center",
          }}
        >
          <BreadcrumbButton icon="home" tooltip="Go to home" />
          <BreadcrumbButton
            icon="chevron-left"
            isNavigation
            tooltip="Go back"
          />
          <BreadcrumbButton
            icon="chevron-right"
            isNavigation
            tooltip="Go forward"
          />
          <BreadcrumbButton icon="refresh" isNavigation tooltip="Refresh" />
          <BreadcrumbButton icon="settings" tooltip="Settings" />
          <BreadcrumbButton icon="search" tooltip="Search" />
        </div>

        <h3>BreadcrumbActionButton (Predefined Actions)</h3>
        <div
          style={{
            display: "flex",
            gap: "1rem",
            "flex-wrap": "wrap",
            "align-items": "center",
          }}
        >
          <BreadcrumbActionButton action="create" tooltip="Create new item" />
          <BreadcrumbActionButton action="delete" tooltip="Delete item" />
          <BreadcrumbActionButton action="edit" tooltip="Edit item" />
          <BreadcrumbActionButton action="settings" tooltip="Settings" />
          <BreadcrumbActionButton action="refresh" tooltip="Refresh" />
          <BreadcrumbActionButton action="upload" tooltip="Upload file" />
          <BreadcrumbActionButton action="download" tooltip="Download file" />
          <BreadcrumbActionButton action="search" tooltip="Search" />
          <BreadcrumbActionButton action="filter" tooltip="Filter" />
          <BreadcrumbActionButton action="sort" tooltip="Sort" />
        </div>
      </section>

      {/* Advanced Features Demo */}
      <section style={{ margin: "2rem 0" }}>
        <h2>Advanced Features</h2>
        <div style={{ display: "flex", gap: "1rem", "flex-wrap": "wrap" }}>
          <IconButton
            icon="download"
            variant="primary"
            progress={progress()}
            glow={progress() > 50}
            glowColor="var(--success)"
            tooltip={`Download progress: ${progress()}%`}
          >
            Download
          </IconButton>
          <IconButton
            icon="upload"
            variant="success"
            loading={progress() > 0 && progress() < 100}
            disabled={progress() > 0 && progress() < 100}
          >
            Upload
          </IconButton>
          <IconButton
            icon="star"
            variant="warning"
            active={activeButton() === "star"}
            onClick={() =>
              setActiveButton(activeButton() === "star" ? null : "star")
            }
            glow={activeButton() === "star"}
          >
            Favorite
          </IconButton>
        </div>
      </section>

      {/* Size Variations */}
      <section style={{ margin: "2rem 0" }}>
        <h2>Size Variations</h2>
        <div style={{ display: "flex", gap: "1rem", "align-items": "center" }}>
          <IconButton icon="settings" size="sm" variant="primary">
            Small
          </IconButton>
          <IconButton icon="settings" size="md" variant="primary">
            Medium
          </IconButton>
          <IconButton icon="settings" size="lg" variant="primary">
            Large
          </IconButton>
        </div>
        <div
          style={{
            display: "flex",
            gap: "1rem",
            "align-items": "center",
            "margin-top": "1rem",
          }}
        >
          <BreadcrumbButton icon="settings" size="sm" />
          <BreadcrumbButton icon="settings" size="md" />
          <BreadcrumbButton icon="settings" size="lg" />
        </div>
      </section>

      {/* Interactive States */}
      <section style={{ margin: "2rem 0" }}>
        <h2>Interactive States</h2>
        <div style={{ display: "flex", gap: "1rem", "flex-wrap": "wrap" }}>
          <IconButton icon="settings" variant="primary">
            Normal
          </IconButton>
          <IconButton icon="settings" variant="primary" disabled>
            Disabled
          </IconButton>
          <IconButton icon="settings" variant="primary" loading>
            Loading
          </IconButton>
          <IconButton icon="settings" variant="primary" active>
            Active
          </IconButton>
        </div>
      </section>
    </div>
  );
};
