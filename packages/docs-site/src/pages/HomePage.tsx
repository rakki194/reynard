/**
 * @fileoverview Home page for the documentation site
 */

import { Component, createSignal, onMount } from 'solid-js';
import { 
  DocsHero, 
  DocsCardGrid, 
  DocsSection,
  DocsPage
} from 'reynard-docs-components';

/**
 * Home page component
 */
export const HomePage: Component = () => {
  const [stats, setStats] = createSignal({
    packages: 0,
    examples: 0,
    apiDocs: 0
  });

  onMount(async () => {
    try {
      // Load stats from generated docs
      const response = await fetch('/docs-generated/docs-config.json');
      if (response.ok) {
        const config = await response.json();
        setStats({
          packages: config.sections?.length || 0,
          examples: config.examples?.length || 0,
          apiDocs: config.api?.length || 0
        });
      }
    } catch (error) {
      console.warn('Failed to load stats');
    }
  });

  const features = [
    {
      title: 'Core Framework',
      description: 'Essential utilities and composables for building modern web applications',
      icon: '⚡',
      href: '/packages/core',
      badge: 'Essential'
    },
    {
      title: 'UI Components',
      description: 'Beautiful, accessible components built with SolidJS and modern web standards',
      icon: '🎨',
      href: '/packages/components',
      badge: 'Popular'
    },
    {
      title: 'Themes',
      description: 'Flexible theming system with dark mode support and custom CSS variables',
      icon: '🌙',
      href: '/packages/themes',
      badge: 'New'
    },
    {
      title: 'Charts',
      description: 'Interactive charts and data visualization components',
      icon: '📊',
      href: '/packages/charts',
      badge: 'Beta'
    },
    {
      title: 'Authentication',
      description: 'Complete authentication system with multiple providers',
      icon: '🔐',
      href: '/packages/auth',
      badge: 'Secure'
    },
    {
      title: 'Testing',
      description: 'Comprehensive testing utilities and helpers',
      icon: '🧪',
      href: '/packages/testing',
      badge: 'Reliable'
    }
  ];

  const quickStartSteps = [
    {
      step: 1,
      title: 'Install Reynard',
      description: 'Add Reynard to your project',
      code: 'npm install reynard-core reynard-components'
    },
    {
      step: 2,
      title: 'Import Components',
      description: 'Start using Reynard components',
      code: `import { Button, Card } from 'reynard-components';
import { useTheme } from 'reynard-themes';`
    },
    {
      step: 3,
      title: 'Build Your App',
      description: 'Create beautiful applications with Reynard',
      code: `function App() {
  const { theme } = useTheme();
  
  return (
    <Card>
      <Button variant="primary">
        Hello Reynard!
      </Button>
    </Card>
  );
}`
    }
  ];

  return (
    <DocsPage>
      <DocsHero
        title="Reynard Framework"
        subtitle="Build beautiful web applications with SolidJS"
        description="A modern, modular framework for building fast, accessible, and maintainable web applications. Built with SolidJS and TypeScript."
        actions={
          <div class="docs-hero-actions">
            <a href="/packages/core" class="docs-hero-button docs-hero-button--primary">
              Get Started
            </a>
            <a href="/packages/components" class="docs-hero-button docs-hero-button--secondary">
              View Components
            </a>
          </div>
        }
        image="/reynard-hero.png"
      />

      <DocsSection title="Why Choose Reynard?">
        <div class="docs-stats">
          <div class="docs-stat">
            <div class="docs-stat-number">{stats().packages}</div>
            <div class="docs-stat-label">Packages</div>
          </div>
          <div class="docs-stat">
            <div class="docs-stat-number">{stats().examples}</div>
            <div class="docs-stat-label">Examples</div>
          </div>
          <div class="docs-stat">
            <div class="docs-stat-number">{stats().apiDocs}</div>
            <div class="docs-stat-label">API Docs</div>
          </div>
        </div>
      </DocsSection>

      <DocsSection title="Core Packages">
        <DocsCardGrid items={features} columns={3} />
      </DocsSection>

      <DocsSection title="Quick Start">
        <div class="docs-quick-start">
          {quickStartSteps.map(step => (
            <div class="docs-quick-start-step">
              <div class="docs-quick-start-step-number">{step.step}</div>
              <div class="docs-quick-start-step-content">
                <h3>{step.title}</h3>
                <p>{step.description}</p>
                <pre class="docs-quick-start-code">
                  <code>{step.code}</code>
                </pre>
              </div>
            </div>
          ))}
        </div>
      </DocsSection>

      <DocsSection title="Community">
        <div class="docs-community">
          <div class="docs-community-item">
            <h3>GitHub</h3>
            <p>Contribute to Reynard and help make it better</p>
            <a href="https://github.com/rakki194/reynard" class="docs-community-link">
              View on GitHub →
            </a>
          </div>
          <div class="docs-community-item">
            <h3>Discord</h3>
            <p>Join our community and get help from other developers</p>
            <a href="https://discord.gg/reynard" class="docs-community-link">
              Join Discord →
            </a>
          </div>
          <div class="docs-community-item">
            <h3>Twitter</h3>
            <p>Follow us for updates and announcements</p>
            <a href="https://twitter.com/reynard_framework" class="docs-community-link">
              Follow on Twitter →
            </a>
          </div>
        </div>
      </DocsSection>
    </DocsPage>
  );
};
