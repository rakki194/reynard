/**
 * Gamification Panel - Shows achievements, progress, and leaderboards
 */

import { Component, For, createSignal } from "solid-js";
import { Card, Tabs, TabPanel } from "reynard-components";
import "./GamificationPanel.css";

interface Achievement {
  id: string;
  type: string;
  name: string;
  description: string;
  icon: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  unlockedAt?: Date;
}

interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  level: number;
  experiencePoints: number;
  achievements: Achievement[];
}

interface GamificationPanelProps {
  user: User | null;
}

const GamificationPanel: Component<GamificationPanelProps> = props => {
  const [activeTab, setActiveTab] = createSignal("achievements");

  // Mock achievements data
  const mockAchievements: Achievement[] = [
    {
      id: "1",
      type: "first_note",
      name: "First Note",
      description: "Created your first note",
      unlockedAt: new Date("2024-01-15"),
      icon: "📝",
      rarity: "common",
    },
    {
      id: "2",
      type: "collaborator",
      name: "Collaborator",
      description: "Shared 5 notes with others",
      unlockedAt: new Date("2024-01-18"),
      icon: "🤝",
      rarity: "rare",
    },
    {
      id: "3",
      type: "ai_explorer",
      name: "AI Explorer",
      description: "Used AI features 20 times",
      unlockedAt: new Date("2024-01-20"),
      icon: "🤖",
      rarity: "epic",
    },
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "#6B7280";
      case "rare":
        return "#3B82F6";
      case "epic":
        return "#8B5CF6";
      case "legendary":
        return "#F59E0B";
      default:
        return "#6B7280";
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  return (
    <div class="gamification-panel">
      <Tabs
        activeTab={activeTab()}
        onTabChange={setActiveTab}
        items={[
          { id: "achievements", label: "🏆 Achievements" },
          { id: "progress", label: "📈 Progress" },
          { id: "leaderboard", label: "🥇 Leaderboard" },
        ]}
      >
        <TabPanel tabId="achievements" activeTab={activeTab()}>
          <div class="achievements-section">
            <h3>Your Achievements</h3>
            <div class="achievements-grid">
              <For each={mockAchievements}>
                {achievement => (
                  <Card
                    class="achievement-card"
                    style={{
                      "border-color": getRarityColor(achievement.rarity),
                    }}
                    padding="md"
                  >
                    <div class="achievement-header">
                      <span class="achievement-icon">{achievement.icon}</span>
                      <div class="achievement-info">
                        <h4 class="achievement-name">{achievement.name}</h4>
                        <span class="achievement-rarity" style={{ color: getRarityColor(achievement.rarity) }}>
                          {achievement.rarity.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <p class="achievement-description">{achievement.description}</p>
                    <div class="achievement-date">
                      Earned {achievement.unlockedAt ? formatDate(achievement.unlockedAt) : "Not earned yet"}
                    </div>
                  </Card>
                )}
              </For>
            </div>
          </div>
        </TabPanel>

        <TabPanel tabId="progress" activeTab={activeTab()}>
          <div class="progress-section">
            <h3>Your Progress</h3>
            <div class="progress-stats">
              <div class="progress-item">
                <span class="progress-label">Notes Created</span>
                <div class="progress-bar">
                  <div class="progress-fill" style={{ width: "75%" }} />
                </div>
                <span class="progress-value">47 / 50</span>
              </div>
              <div class="progress-item">
                <span class="progress-label">Collaboration Score</span>
                <div class="progress-bar">
                  <div class="progress-fill" style={{ width: "60%" }} />
                </div>
                <span class="progress-value">12 / 20</span>
              </div>
              <div class="progress-item">
                <span class="progress-label">AI Features Used</span>
                <div class="progress-bar">
                  <div class="progress-fill" style={{ width: "90%" }} />
                </div>
                <span class="progress-value">23 / 25</span>
              </div>
            </div>
          </div>
        </TabPanel>

        <TabPanel tabId="leaderboard" activeTab={activeTab()}>
          <div class="leaderboard-section">
            <h3>Weekly Leaderboard</h3>
            <div class="leaderboard-list">
              <div class="leaderboard-item rank-1">
                <span class="rank">1</span>
                <span class="username">Alice Johnson</span>
                <span class="score">2,450 XP</span>
              </div>
              <div class="leaderboard-item rank-2">
                <span class="rank">2</span>
                <span class="username">Bob Smith</span>
                <span class="score">2,100 XP</span>
              </div>
              <div class="leaderboard-item rank-3">
                <span class="rank">3</span>
                <span class="username">Carol Davis</span>
                <span class="score">1,850 XP</span>
              </div>
              <div class="leaderboard-item current-user">
                <span class="rank">5</span>
                <span class="username">You</span>
                <span class="score">1,250 XP</span>
              </div>
            </div>
          </div>
        </TabPanel>
      </Tabs>
    </div>
  );
};

export { GamificationPanel };
