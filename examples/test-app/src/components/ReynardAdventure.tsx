import { Button, Card, TabPanel, Tabs } from "reynard-components";
import { createSignal, For, Show } from "solid-js";
import { CodeBlock } from "./CodeBlock";
import "./ReynardAdventure.css";

interface TutorialSection {
  id: string;
  title: string;
  description: string;
  content: TutorialContent[];
  prerequisites?: string[];
  estimatedTime: string;
  difficulty: "beginner" | "intermediate" | "advanced";
}

interface TutorialContent {
  type: "text" | "code" | "example" | "exercise";
  title?: string;
  content: string;
  language?: string;
  explanation?: string;
}

interface TutorialState {
  currentSection: string;
  completedSections: string[];
  currentTab: number;
}

export const tutorialData: TutorialSection[] = [
  {
    id: "introduction",
    title: "Introduction to Reynard",
    description: "Learn what Reynard is and why it exists",
    estimatedTime: "10 minutes",
    difficulty: "beginner",
    content: [
      {
        type: "text",
        content: `# What is Reynard?

Reynard is a comprehensive SolidJS framework designed for building modern, performant, and accessible web applications. It provides a complete toolkit with modular architecture, elegant theming, and exceptional developer experience.

## Key Features

- **Modular Architecture**: Each package is designed to be slim with minimal dependencies
- **Comprehensive Theming**: 8 built-in themes with full custom theme support
- **Production Ready**: Battle-tested components with 95%+ test coverage
- **Accessibility First**: WCAG 2.1 compliance and robust a11y features
- **Performance Optimized**: Bundle splitting, lazy loading, and fine-grained reactivity
- **TypeScript Native**: Complete type safety with excellent IntelliSense`,
      },
      {
        type: "code",
        title: "Quick Installation",
        language: "bash",
        content: `# Install core package
npm install reynard-core solid-js

# Install additional packages as needed
npm install reynard-components reynard-auth reynard-charts`,
      },
    ],
  },
  {
    id: "core-concepts",
    title: "Core Concepts",
    description: "Understanding Reynard's architecture and design principles",
    estimatedTime: "20 minutes",
    difficulty: "beginner",
    prerequisites: ["introduction"],
    content: [
      {
        type: "text",
        content: `# Core Architecture

Reynard follows a modular architecture where each package has a specific responsibility:

## Package Structure

- **reynard-core**: Core utilities, composables, and modules
- **reynard-components**: UI component library
- **reynard-auth**: Authentication and user management
- **reynard-charts**: Data visualization components
- **reynard-gallery**: File and media management
- **reynard-settings**: Configuration management
- **reynard-file-processing**: Advanced file processing pipeline
- **reynard-colors**: Color and media utilities
- **reynard-ui**: Additional UI components
- **reynard-themes**: Theme system and built-in themes`,
      },
      {
        type: "code",
        title: "Basic App Structure",
        language: "tsx",
        content: `import { createSignal } from "solid-js";
import { useNotifications } from "reynard-core";
import { useTheme } from "reynard-themes";
import { Button, Card } from "reynard-components";

function App() {
  const { theme, setTheme } = useTheme();
  const { addNotification } = useNotifications();

  const handleClick = () => {
    addNotification({
      type: 'success',
      message: 'Hello from Reynard!',
      duration: 3000
    });
  };

  return (
    <Card padding="lg">
      <h1>Welcome to Reynard</h1>
      <p>Current theme: {theme()}</p>
      <Button variant="primary" onClick={handleClick}>
        Show Notification
      </Button>
    </Card>
  );
}`,
      },
    ],
  },
];

function formatMarkdown(text: string): string {
  return (
    text
      // Escape HTML characters to prevent XSS
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      // Convert markdown headers
      .replace(/^### (.*$)/gim, "<h3>$1</h3>")
      .replace(/^## (.*$)/gim, "<h2>$1</h2>")
      .replace(/^# (.*$)/gim, "<h1>$1</h1>")
      // Convert bold text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      // Convert italic text
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      // Convert code blocks
      .replace(/```([\s\S]*?)```/g, "<pre><code>$1</code></pre>")
      // Convert inline code
      .replace(/`(.*?)`/g, "<code>$1</code>")
      // Convert line breaks
      .replace(/\n/g, "<br>")
  );
}

export default function ReynardTutorial() {
  const [tutorialState, setTutorialState] = createSignal<TutorialState>({
    currentSection: "introduction",
    completedSections: [],
    currentTab: 0,
  });

  const currentSection = () => tutorialData.find(s => s.id === tutorialState().currentSection);
  const currentContent = () => currentSection()?.content[tutorialState().currentTab] || null;

  const nextSection = () => {
    const currentIndex = tutorialData.findIndex(s => s.id === tutorialState().currentSection);
    if (currentIndex < tutorialData.length - 1) {
      const nextId = tutorialData[currentIndex + 1].id;
      setTutorialState(prev => ({
        ...prev,
        currentSection: nextId,
        currentTab: 0,
      }));
    }
  };

  const prevSection = () => {
    const currentIndex = tutorialData.findIndex(s => s.id === tutorialState().currentSection);
    if (currentIndex > 0) {
      const prevId = tutorialData[currentIndex - 1].id;
      setTutorialState(prev => ({
        ...prev,
        currentSection: prevId,
        currentTab: 0,
      }));
    }
  };

  const completeSection = () => {
    setTutorialState(prev => ({
      ...prev,
      completedSections: [...prev.completedSections, prev.currentSection],
    }));
  };

  return (
    <div class="reynard-tutorial">
      <div class="tutorial-sidebar">
        <h3>Reynard Tutorial</h3>
        <div class="tutorial-progress">
          <div class="progress-bar">
            <div
              class="progress-fill"
              classList={{
                "progress-fill": true,
                [`progress-${Math.round((tutorialState().completedSections.length / tutorialData.length) * 100)}`]: true,
              }}
            ></div>
          </div>
          <span class="progress-text">
            {tutorialState().completedSections.length} / {tutorialData.length} sections completed
          </span>
        </div>

        <div class="tutorial-sections">
          <For each={tutorialData}>
            {(section, index) => (
              <div
                class={`tutorial-section-item ${section.id === tutorialState().currentSection ? "active" : ""} ${
                  tutorialState().completedSections.includes(section.id) ? "completed" : ""
                }`}
                onClick={() =>
                  setTutorialState(prev => ({
                    ...prev,
                    currentSection: section.id,
                    currentTab: 0,
                  }))
                }
              >
                <div class="section-number">{index() + 1}</div>
                <div class="section-info">
                  <div class="section-title">{section.title}</div>
                  <div class="section-meta">
                    <span class="section-time">{section.estimatedTime}</span>
                    <span class={`section-difficulty ${section.difficulty}`}>{section.difficulty}</span>
                  </div>
                </div>
              </div>
            )}
          </For>
        </div>
      </div>

      <div class="tutorial-content">
        <Show when={currentSection()}>
          <Card class="tutorial-main-card">
            <div class="tutorial-header">
              <h1 class="tutorial-title">{currentSection()?.title}</h1>
              <div class="tutorial-meta">
                <span class="tutorial-time">{currentSection()?.estimatedTime}</span>
                <span class={`tutorial-difficulty ${currentSection()?.difficulty}`}>
                  {currentSection()?.difficulty}
                </span>
              </div>
            </div>

            <div class="tutorial-description">{currentSection()?.description}</div>

            <Show when={currentSection()?.content && currentSection()!.content.length > 1}>
              <Tabs
                items={currentSection()!.content.map((content, index) => ({
                  id: `step-${index}`,
                  label: content.title || `Step ${index + 1}`,
                  disabled: false,
                }))}
                activeTab={`step-${tutorialState().currentTab}`}
                onTabChange={tabId => {
                  const index = parseInt(tabId.replace("step-", ""));
                  setTutorialState(prev => ({ ...prev, currentTab: index }));
                }}
              >
                <For each={currentSection()?.content}>
                  {(content, index) => (
                    <TabPanel tabId={`step-${index()}`} activeTab={`step-${tutorialState().currentTab}`}>
                      <div class="tutorial-step">
                        <Show when={content.type === "text"}>
                          <div class="tutorial-text" innerHTML={formatMarkdown(content.content)}></div>
                        </Show>

                        <Show when={content.type === "code"}>
                          <CodeBlock
                            code={content.content}
                            language={content.language}
                            title={content.title}
                            explanation={content.explanation}
                            showLineNumbers={true}
                            maxHeight="400px"
                          />
                        </Show>
                      </div>
                    </TabPanel>
                  )}
                </For>
              </Tabs>
            </Show>

            <Show when={currentSection()?.content && currentSection()!.content.length === 1}>
              <div class="tutorial-step">
                <Show when={currentContent()?.type === "text"}>
                  <div class="tutorial-text" innerHTML={formatMarkdown(currentContent()?.content || "")}></div>
                </Show>

                <Show when={currentContent()?.type === "code"}>
                  <div class="tutorial-code">
                    <Show when={currentContent()?.title}>
                      <h4 class="code-title">{currentContent()?.title}</h4>
                    </Show>
                    <pre class="code-block">
                      <code class={`language-${currentContent()?.language || "text"}`}>
                        {currentContent()?.content}
                      </code>
                    </pre>
                    <Show when={currentContent()?.explanation}>
                      <div class="code-explanation">{currentContent()?.explanation}</div>
                    </Show>
                  </div>
                </Show>
              </div>
            </Show>

            <div class="tutorial-navigation">
              <div class="nav-buttons">
                <Button
                  variant="secondary"
                  onClick={prevSection}
                  disabled={tutorialData.findIndex(s => s.id === tutorialState().currentSection) === 0}
                >
                  Previous Section
                </Button>

                <Button
                  variant="primary"
                  onClick={nextSection}
                  disabled={
                    tutorialData.findIndex(s => s.id === tutorialState().currentSection) === tutorialData.length - 1
                  }
                >
                  Next Section
                </Button>
              </div>

              <div class="section-actions">
                <Button
                  variant="ghost"
                  onClick={completeSection}
                  disabled={tutorialState().completedSections.includes(tutorialState().currentSection)}
                >
                  Mark Complete
                </Button>
              </div>
            </div>
          </Card>
        </Show>
      </div>
    </div>
  );
}
