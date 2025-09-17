/**
 * Stats Panel - Shows user statistics and progress
 */

import { Component } from "solid-js";
import { Card } from "reynard-components";
import "./StatsPanel.css";

interface UserStats {
  level: number;
  experiencePoints: number;
  notesCreated: number;
  notesShared: number;
  aiFeaturesUsed: number;
  loginStreak: number;
}

const StatsPanel: Component = () => {
  // Mock user stats
  const stats: UserStats = {
    level: 5,
    experiencePoints: 1250,
    notesCreated: 47,
    notesShared: 12,
    aiFeaturesUsed: 23,
    loginStreak: 7,
  };

  const getProgressToNextLevel = () => {
    const currentLevelXP = stats.level * 200;
    const nextLevelXP = (stats.level + 1) * 200;
    const progress = ((stats.experiencePoints - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
    return Math.min(100, Math.max(0, progress));
  };

  return (
    <Card class="stats-panel" padding="lg">
      <h3>📊 Your Stats</h3>

      <div class="level-section">
        <div class="level-info">
          <span class="level-number">Level {stats.level}</span>
          <span class="xp-count">{stats.experiencePoints} XP</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style={{ width: `${getProgressToNextLevel()}%` }} />
        </div>
        <div class="next-level">
          {Math.round(getProgressToNextLevel())}% to Level {stats.level + 1}
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-icon">📝</span>
          <div class="stat-content">
            <span class="stat-value">{stats.notesCreated}</span>
            <span class="stat-label">Notes Created</span>
          </div>
        </div>

        <div class="stat-item">
          <span class="stat-icon">🤝</span>
          <div class="stat-content">
            <span class="stat-value">{stats.notesShared}</span>
            <span class="stat-label">Notes Shared</span>
          </div>
        </div>

        <div class="stat-item">
          <span class="stat-icon">🤖</span>
          <div class="stat-content">
            <span class="stat-value">{stats.aiFeaturesUsed}</span>
            <span class="stat-label">AI Features Used</span>
          </div>
        </div>

        <div class="stat-item">
          <span class="stat-icon">🔥</span>
          <div class="stat-content">
            <span class="stat-value">{stats.loginStreak}</span>
            <span class="stat-label">Day Streak</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export { StatsPanel };
