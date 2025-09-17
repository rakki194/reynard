/**
 * Category Statistics Component
 * Shows statistics about icon categories
 */

import { Component, createMemo } from "solid-js";
import { iconCategories, allIcons } from "reynard-fluent-icons";

export const CategoryStats: Component = () => {
  const stats = createMemo(() => {
    const totalIcons = Object.keys(allIcons).length;
    const categoryStats = Object.entries(iconCategories).map(([, category]) => ({
      name: category.name,
      count: Object.keys(category.icons).length,
      percentage: Math.round((Object.keys(category.icons).length / totalIcons) * 100),
    }));

    return {
      totalIcons,
      categoryStats: categoryStats.sort((a, b) => b.count - a.count),
    };
  });

  return (
    <div class="stats-view">
      <h2>Icon Statistics</h2>

      <div class="stats-overview">
        <div class="stat-card">
          <div class="stat-number">{stats().totalIcons}</div>
          <div class="stat-label">Total Icons</div>
        </div>

        <div class="stat-card">
          <div class="stat-number">{Object.keys(iconCategories).length}</div>
          <div class="stat-label">Categories</div>
        </div>
      </div>

      <div class="category-stats">
        <h3>Icons by Category</h3>
        <div class="stats-list">
          {stats().categoryStats.map(stat => (
            <div class="stat-row">
              <div class="stat-info">
                <span class="stat-name">{stat.name}</span>
                <span class="stat-count">{stat.count} icons</span>
              </div>
              <div class="stat-bar">
                <div class="stat-bar-fill" style={`width: ${stat.percentage}%`}></div>
              </div>
              <div class="stat-percentage">{stat.percentage}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
