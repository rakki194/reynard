/**
 * Tests for CodebaseAnalyzer
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CodebaseAnalyzer } from '../CodebaseAnalyzer';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

describe('CodebaseAnalyzer', () => {
  let tempDir: string;
  let analyzer: CodebaseAnalyzer;

  const createTestFiles = async (baseDir: string) => {
    await writeFile(join(baseDir, 'index.ts'), `
      import { Component } from './components/Button';
      import { Service } from './services/UserService';
      
      export class App {
        constructor() {
          this.component = new Component();
          this.service = new Service();
        }
      }
    `);
    
    await writeFile(join(baseDir, 'components', 'Button.ts'), `
      export class Button {
        render() {
          return '<button>Click me</button>';
        }
      }
    `);
    
    await writeFile(join(baseDir, 'services', 'UserService.ts'), `
      export class UserService {
        async getUser(id: string) {
          // This is a very long function that exceeds the recommended length
          // and should trigger a code smell detection
          const user = await this.fetchUser(id);
          const profile = await this.fetchProfile(user.id);
          const preferences = await this.fetchPreferences(user.id);
          const settings = await this.fetchSettings(user.id);
          const notifications = await this.fetchNotifications(user.id);
          const history = await this.fetchHistory(user.id);
          const analytics = await this.fetchAnalytics(user.id);
          const recommendations = await this.fetchRecommendations(user.id);
          const social = await this.fetchSocial(user.id);
          const security = await this.fetchSecurity(user.id);
          
          return {
            ...user,
            profile,
            preferences,
            settings,
            notifications,
            history,
            analytics,
            recommendations,
            social,
            security
          };
        }
        
        private async fetchUser(id: string) { return { id, name: 'Test User' }; }
        private async fetchProfile(id: string) { return { id, bio: 'Test Bio' }; }
        private async fetchPreferences(id: string) { return { id, theme: 'dark' }; }
        private async fetchSettings(id: string) { return { id, notifications: true }; }
        private async fetchNotifications(id: string) { return { id, count: 5 }; }
        private async fetchHistory(id: string) { return { id, items: [] }; }
        private async fetchAnalytics(id: string) { return { id, views: 100 }; }
        private async fetchRecommendations(id: string) { return { id, items: [] }; }
        private async fetchSocial(id: string) { return { id, friends: [] }; }
        private async fetchSecurity(id: string) { return { id, level: 'high' }; }
      }
    `);
    
    await writeFile(join(baseDir, 'package.json'), JSON.stringify({
      name: 'test-project',
      dependencies: {
        'react': '^18.0.0',
        'typescript': '^5.0.0'
      }
    }));
  };

  const createTestDirectories = async (baseDir: string) => {
    await mkdir(join(baseDir, 'components'), { recursive: true });
    await mkdir(join(baseDir, 'services'), { recursive: true });
  };

  beforeEach(async () => {
    // Create a temporary directory for testing
    tempDir = join(tmpdir(), `reynard-adr-test-${Date.now()}`);
    await mkdir(tempDir, { recursive: true });
    
    // Create test directories and files
    await createTestDirectories(tempDir);
    await createTestFiles(tempDir);
    
    analyzer = new CodebaseAnalyzer(tempDir);
  });

  it('should analyze codebase and return metrics', async () => {
    const analysis = await analyzer.analyzeCodebase();
    
    expect(analysis.metrics.totalFiles).toBeGreaterThan(0);
    expect(analysis.metrics.totalLines).toBeGreaterThan(0);
    expect(analysis.metrics.fileTypes).toHaveProperty('.ts');
    expect(analysis.metrics.complexityScore).toBeGreaterThan(0);
  });

  it('should detect architecture patterns', async () => {
    const analysis = await analyzer.analyzeCodebase();
    
    expect(analysis.patterns).toBeDefined();
    expect(Array.isArray(analysis.patterns)).toBe(true);
  });

  it('should generate ADR suggestions', async () => {
    const analysis = await analyzer.analyzeCodebase();
    
    expect(analysis.suggestions).toBeDefined();
    expect(Array.isArray(analysis.suggestions)).toBe(true);
    
    // Should suggest performance ADR for large files
    const performanceSuggestions = analysis.suggestions.filter(
      s => s.category === 'performance'
    );
    expect(performanceSuggestions.length).toBeGreaterThan(0);
  });

  it('should assess code quality', async () => {
    const analysis = await analyzer.analyzeCodebase();
    
    expect(analysis.quality.testCoverage).toBeGreaterThanOrEqual(0);
    expect(analysis.quality.documentationCoverage).toBeGreaterThanOrEqual(0);
    expect(analysis.quality.complexityMetrics).toBeDefined();
    expect(Array.isArray(analysis.quality.codeSmells)).toBe(true);
  });

  it('should analyze dependencies', async () => {
    const analysis = await analyzer.analyzeCodebase();
    
    expect(analysis.dependencies.internalDependencies).toBeDefined();
    expect(analysis.dependencies.externalDependencies).toBeDefined();
    expect(Array.isArray(analysis.dependencies.circularDependencies)).toBe(true);
    expect(Array.isArray(analysis.dependencies.criticalDependencies)).toBe(true);
  });
});

