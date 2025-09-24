/**
 * Dashboard Page - Main overview of notebooks and recent activity
 */

import { Component, createSignal, For, Show } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { Button, Card, Tabs, TabPanel } from "reynard-components-core";
import { useAuth } from "reynard-auth";
import { useNotifications } from "reynard-core";
import { NotebookCard } from "../components/NotebookCard";
import { RecentNotes } from "../components/RecentNotes";
import { QuickActions } from "../components/QuickActions";
import { StatsPanel } from "../components/StatsPanel";
import "./DashboardPage.css";

interface Notebook {
  id: string;
  title: string;
  description?: string;
  color: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  pageCount: number;
}

const DashboardPage: Component = () => {
  const navigate = useNavigate();
  const { notify } = useNotifications();
  const [activeTab, setActiveTab] = createSignal("notebooks");
  const [notebooks, setNotebooks] = createSignal<Notebook[]>([]);
  const [isCreatingNotebook, setIsCreatingNotebook] = createSignal(false);

  // Mock data for demonstration
  const mockNotebooks: Notebook[] = [
    {
      id: "1",
      title: "Personal Notes",
      description: "My personal thoughts and ideas",
      color: "#0078D4",
      isPublic: false,
      createdAt: new Date("2024-01-15"),
      updatedAt: new Date("2024-01-20"),
      pageCount: 12,
    },
    {
      id: "2",
      title: "Work Projects",
      description: "Project documentation and meeting notes",
      color: "#107C10",
      isPublic: false,
      createdAt: new Date("2024-01-10"),
      updatedAt: new Date("2024-01-19"),
      pageCount: 8,
    },
    {
      id: "3",
      title: "Learning Resources",
      description: "Study materials and tutorials",
      color: "#D83B01",
      isPublic: true,
      createdAt: new Date("2024-01-05"),
      updatedAt: new Date("2024-01-18"),
      pageCount: 15,
    },
  ];

  // Initialize with mock data
  setNotebooks(mockNotebooks);

  const handleCreateNotebook = async () => {
    setIsCreatingNotebook(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newNotebook: Notebook = {
        id: Date.now().toString(),
        title: "New Notebook",
        description: "A new notebook for your ideas",
        color: "#0078D4",
        isPublic: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        pageCount: 0,
      };

      setNotebooks(prev => [newNotebook, ...prev]);
      notify("Notebook created successfully!", "success");
    } catch (error) {
      notify("Failed to create notebook", "error");
    } finally {
      setIsCreatingNotebook(false);
    }
  };

  const handleNotebookClick = (notebookId: string) => {
    navigate(`/notebook/${notebookId}`);
  };

  return (
    <div class="dashboard-page">
      <div class="dashboard-header">
        <div class="header-content">
          <h1>📚 My Notebooks</h1>
          <p>Organize your thoughts and collaborate with others</p>
        </div>
        <div class="header-actions">
          <Button onClick={handleCreateNotebook} loading={isCreatingNotebook()} variant="primary">
            ➕ New Notebook
          </Button>
        </div>
      </div>

      <div class="dashboard-content">
        <div class="main-content">
          <Tabs
            activeTab={activeTab()}
            onTabChange={setActiveTab}
            items={[
              { id: "notebooks", label: "📚 Notebooks" },
              { id: "recent", label: "🕒 Recent" },
              { id: "favorites", label: "⭐ Favorites" },
            ]}
          >
            <TabPanel tabId="notebooks" activeTab={activeTab()}>
              <div class="notebooks-grid">
                <For each={notebooks()}>
                  {notebook => <NotebookCard notebook={notebook} onClick={() => handleNotebookClick(notebook.id)} />}
                </For>
              </div>
            </TabPanel>

            <TabPanel tabId="recent" activeTab={activeTab()}>
              <RecentNotes />
            </TabPanel>

            <TabPanel tabId="favorites" activeTab={activeTab()}>
              <div class="favorites-content">
                <p>Your favorite notes will appear here</p>
              </div>
            </TabPanel>
          </Tabs>
        </div>

        <div class="sidebar">
          <QuickActions />
          <StatsPanel />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
