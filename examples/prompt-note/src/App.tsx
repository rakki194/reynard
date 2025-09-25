/**
 * Prompt Note - OneNote-like Note-Taking Application
 * Built with Reynard framework featuring gamification, real-time collaboration, and AI-powered features
 */

import { Component, createSignal, For, createResource, Show, createEffect } from "solid-js";
import { Router, Route, Navigate } from "@solidjs/router";
import { ReynardProvider, useTheme } from "reynard-themes";
import { NotificationsProvider, useNotifications, createNotificationsModule } from "reynard-core";
import { AuthProvider, useAuth } from "reynard-auth";
import { Button, Modal, Tabs, TabPanel, Card } from "reynard-components-core";
import { CodeEditor } from "reynard-monaco";
// import { ChatContainer } from "reynard-chat";
// import { useAuthFetch } from "reynard-composables";
import { ThemeToggle } from "./components/ThemeToggle";
import { LanguageSelector } from "./components/LanguageSelector";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import NotebookPage from "./pages/NotebookPage";
import NoteEditorPage from "./pages/NoteEditorPage";
import ProfilePage from "./pages/ProfilePage";
import { GamificationPanel } from "./components/GamificationPanel";
import "reynard-themes/themes.css";
import "./styles.css";

interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  level: number;
  experiencePoints: number;
  achievements: Achievement[];
}

interface Achievement {
  id: string;
  type: string;
  name: string;
  description: string;
  icon: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  unlockedAt?: Date;
}

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

interface Note {
  id: string;
  notebookId: string;
  title: string;
  content: string;
  contentType: "markdown" | "rich-text" | "code";
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
  collaborators?: User[];
}

// Export types for use in other components
export type { User, Achievement, Notebook, Note };

const App: Component = () => {
  const [user, setUser] = createSignal<User | null>(null);
  const [notebooks, setNotebooks] = createSignal<Notebook[]>([]);
  const [currentNotebook, setCurrentNotebook] = createSignal<Notebook | null>(null);
  const [currentNote, setCurrentNote] = createSignal<Note | null>(null);
  const [showGamification, setShowGamification] = createSignal(false);

  const themeContext = useTheme();
  const { notify } = useNotifications();
  const { isAuthenticated, user: authUser } = useAuth();
  // Simple auth fetch implementation
  const authFetch = async (url: string, options: any = {}) => {
    const token = localStorage.getItem("auth_token");
    const headers = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };
    return fetch(url, { ...options, headers });
  };

  // Load user data when authenticated
  createEffect(() => {
    if (isAuthenticated() && authUser()) {
      loadUserData();
    }
  });

  // Load user data and notebooks
  const loadUserData = async () => {
    try {
      const response = await authFetch("/api/user/profile");
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);

        // Load user's notebooks
        const notebooksResponse = await authFetch("/api/notebooks");
        if (notebooksResponse.ok) {
          const notebooksData = await notebooksResponse.json();
          setNotebooks(notebooksData);
        }
      }
    } catch (error) {
      console.error("Failed to load user data:", error);
      notify("Failed to load user data", "error");
    }
  };

  // Create new notebook
  const createNotebook = async (title: string, description?: string, color = "#0078D4") => {
    try {
      const response = await authFetch("/api/notebooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, color }),
      });

      if (response.ok) {
        const newNotebook = await response.json();
        setNotebooks(prev => [...prev, newNotebook]);
        notify("Notebook created successfully!", "success");
        return newNotebook;
      }
    } catch (error) {
      console.error("Failed to create notebook:", error);
      notify("Failed to create notebook", "error");
    }
  };

  // Create new note
  const createNote = async (notebookId: string, title: string, content = "") => {
    try {
      const response = await authFetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notebookId, title, content }),
      });

      if (response.ok) {
        const newNote = await response.json();
        notify("Note created successfully!", "success");
        return newNote;
      }
    } catch (error) {
      console.error("Failed to create note:", error);
      notify("Failed to create note", "error");
    }
  };

  return (
    <Router>
      <div class="app">
        <Show when={isAuthenticated()}>
          <header class="app-header">
            <div class="header-content">
              <h1>🦊 Prompt Note</h1>
              <p>OneNote-like note-taking with gamification and AI features</p>
              <div class="header-controls">
                <Show when={user()}>
                  <div class="user-info">
                    <span class="user-level">Level {user()!.level}</span>
                    <span class="user-xp">{user()!.experiencePoints} XP</span>
                  </div>
                </Show>
                <Button onClick={() => setShowGamification(!showGamification())} variant="secondary" size="sm">
                  🏆 Achievements
                </Button>
                <ThemeToggle />
                <LanguageSelector />
              </div>
            </div>
          </header>

          <main class="app-main">
            <Route path="/" component={() => <Navigate href="/dashboard" />} />
            <Route path="/dashboard" component={DashboardPage} />
            <Route path="/notebook/:id" component={NotebookPage} />
            <Route path="/note/:id" component={NoteEditorPage} />
            <Route path="/profile" component={ProfilePage} />
          </main>

          {/* Gamification Panel */}
          <Show when={showGamification()}>
            <Modal
              open={showGamification()}
              onClose={() => setShowGamification(false)}
              title="🏆 Achievements & Progress"
              size="lg"
            >
              <GamificationPanel user={user()} />
            </Modal>
          </Show>
        </Show>

        <Show when={!isAuthenticated()}>
          <LoginPage />
        </Show>
      </div>
    </Router>
  );
};

const AppWithProviders: Component = () => {
  const notificationsModule = createNotificationsModule();

  return (
    <ReynardProvider defaultTheme="light" defaultLocale="en">
      <NotificationsProvider value={notificationsModule}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </NotificationsProvider>
    </ReynardProvider>
  );
};

export default AppWithProviders;
