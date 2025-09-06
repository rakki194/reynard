import { ThemeProvider, createTheme, NotificationsProvider, createNotifications } from "reynard-core";
import { Tabs, TabPanel } from "reynard-components";
import { getIcon } from "reynard-fluent-icons";
import { createSignal } from "solid-js";
import { ThemeDemo } from "./components/ThemeDemo";
import { ComponentsDemo } from "./components/ComponentsDemo";
import { CoreDemo } from "./components/CoreDemo";
import { ChatDemo } from "./components/ChatDemo";
import { NotificationsDemo } from "./components/NotificationsDemo";
import { NotificationToast } from "./components/NotificationToast";
import { UnusedVariablesDemo } from "./components/UnusedVariablesDemo";
import { AlgorithmsDemo } from "./components/AlgorithmsDemo";
import { MonacoEditorDemo } from "./components/MonacoEditorDemo";
import ReynardTutorial from "./components/ReynardAdventure";
import "./App.css";
import "./styles/streaming-demo.css";
// Import Reynard component styles
import "reynard-components/styles";
// Import Reynard games styles
import "reynard-games/dist/index.css";

function App() {
  console.log("App: Creating modules");
  const themeModule = createTheme();
  const notificationsModule = createNotifications();
  console.log("App: Notifications module created", notificationsModule);
  const [activeTab, setActiveTab] = createSignal("tutorial");

  const tabs = [
    { id: "tutorial", label: "Reynard Tutorial", icon: getIcon("yipyap") },
    { id: "monaco", label: "Monaco Editor", icon: getIcon("code") },
    { id: "themes", label: "Themes", icon: getIcon("sparkle") },
    { id: "components", label: "Components", icon: getIcon("grid") },
    { id: "core", label: "Core", icon: getIcon("rocket") },
    { id: "notifications", label: "Notifications", icon: getIcon("service-bell") },
    { id: "chat", label: "Chat", icon: getIcon("chat") },
    { id: "algorithms", label: "Algorithms", icon: getIcon("calculator") },
    { id: "unused-vars", label: "Unused Variables", icon: getIcon("palette") },
  ];

  return (
    <>
      <ThemeProvider value={themeModule}>
        <NotificationsProvider value={notificationsModule}>
          <NotificationToast />
          <div class="app-container">
            <div class="app-content">
              <header class="app-header">
                <h1 class="app-title">Reynard Test Application</h1>
                <p class="app-description">
                  Comprehensive demonstration of Reynard framework features, components, and utilities.
                </p>
              </header>

              <main class="app-main">
                <Tabs
                  items={tabs}
                  activeTab={activeTab()}
                  onTabChange={setActiveTab}
                  variant="pills"
                  fullWidth
                  class="demo-tabs"
                >
                  <TabPanel tabId="tutorial" activeTab={activeTab()}>
                    <ReynardTutorial />
                  </TabPanel>
                  
                  <TabPanel tabId="monaco" activeTab={activeTab()}>
                    <MonacoEditorDemo />
                  </TabPanel>
                  
                  <TabPanel tabId="themes" activeTab={activeTab()}>
                    <ThemeDemo />
                  </TabPanel>
                  
                  <TabPanel tabId="components" activeTab={activeTab()}>
                    <ComponentsDemo />
                  </TabPanel>
                  
                  <TabPanel tabId="core" activeTab={activeTab()}>
                    <CoreDemo />
                  </TabPanel>
                  
                  <TabPanel tabId="notifications" activeTab={activeTab()}>
                    <NotificationsDemo />
                  </TabPanel>
                  
                  <TabPanel tabId="chat" activeTab={activeTab()}>
                    <ChatDemo />
                  </TabPanel>
                  
                  <TabPanel tabId="algorithms" activeTab={activeTab()}>
                    <AlgorithmsDemo />
                  </TabPanel>
                  
                  <TabPanel tabId="unused-vars" activeTab={activeTab()}>
                    <UnusedVariablesDemo />
                  </TabPanel>
                </Tabs>
              </main>
            </div>
          </div>
        </NotificationsProvider>
      </ThemeProvider>
    </>
  );
}

export default App;
