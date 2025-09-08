/**
 * @fileoverview Layout components for documentation sites
 */

import { Component, JSX, createSignal, Show, For } from 'solid-js';
import { Card } from 'reynard-components';
import { useTheme } from 'reynard-themes';

/**
 * Main documentation layout component
 */
export const DocsLayout: Component<{
  children: JSX.Element;
  sidebar?: JSX.Element;
  header?: JSX.Element;
  footer?: JSX.Element;
  className?: string;
}> = (props) => {
  const [sidebarOpen, setSidebarOpen] = createSignal(false);
  const { theme } = useTheme();

  return (
    <div class={`docs-layout docs-layout--${theme} ${props.className || ''}`}>
      <Show when={props.header}>
        <header class="docs-header">
          {props.header}
        </header>
      </Show>

      <div class="docs-main">
        <Show when={props.sidebar}>
          <aside class={`docs-sidebar ${sidebarOpen() ? 'docs-sidebar--open' : ''}`}>
            <div class="docs-sidebar-content">
              {props.sidebar}
            </div>
            <button 
              class="docs-sidebar-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen())}
              aria-label="Toggle sidebar"
            >
              <span class="hamburger"></span>
            </button>
          </aside>
        </Show>

        <main class="docs-content">
          {props.children}
        </main>
      </div>

      <Show when={props.footer}>
        <footer class="docs-footer">
          {props.footer}
        </footer>
      </Show>
    </div>
  );
};

/**
 * Documentation header component
 */
export const DocsHeader: Component<{
  title: string;
  logo?: string;
  navigation?: JSX.Element;
  actions?: JSX.Element;
  className?: string;
}> = (props) => {
  return (
    <header class={`docs-header ${props.className || ''}`}>
      <div class="docs-header-content">
        <div class="docs-header-brand">
          <Show when={props.logo}>
            <img src={props.logo} alt={props.title} class="docs-logo" />
          </Show>
          <h1 class="docs-title">{props.title}</h1>
        </div>

        <Show when={props.navigation}>
          <nav class="docs-header-nav">
            {props.navigation}
          </nav>
        </Show>

        <Show when={props.actions}>
          <div class="docs-header-actions">
            {props.actions}
          </div>
        </Show>
      </div>
    </header>
  );
};

/**
 * Documentation sidebar component
 */
export const DocsSidebar: Component<{
  children: JSX.Element;
  title?: string;
  className?: string;
}> = (props) => {
  return (
    <aside class={`docs-sidebar ${props.className || ''}`}>
      <Show when={props.title}>
        <div class="docs-sidebar-header">
          <h2 class="docs-sidebar-title">{props.title}</h2>
        </div>
      </Show>
      <div class="docs-sidebar-content">
        {props.children}
      </div>
    </aside>
  );
};

/**
 * Documentation content wrapper
 */
export const DocsContent: Component<{
  children: JSX.Element;
  className?: string;
}> = (props) => {
  return (
    <main class={`docs-content ${props.className || ''}`}>
      <div class="docs-content-wrapper">
        {props.children}
      </div>
    </main>
  );
};

/**
 * Documentation footer component
 */
export const DocsFooter: Component<{
  children: JSX.Element;
  className?: string;
}> = (props) => {
  return (
    <footer class={`docs-footer ${props.className || ''}`}>
      <div class="docs-footer-content">
        {props.children}
      </div>
    </footer>
  );
};

/**
 * Page container component
 */
export const DocsPage: Component<{
  children: JSX.Element;
  title?: string;
  description?: string;
  className?: string;
}> = (props) => {
  return (
    <article class={`docs-page ${props.className || ''}`}>
      <Show when={props.title || props.description}>
        <header class="docs-page-header">
          <Show when={props.title}>
            <h1 class="docs-page-title">{props.title}</h1>
          </Show>
          <Show when={props.description}>
            <p class="docs-page-description">{props.description}</p>
          </Show>
        </header>
      </Show>
      
      <div class="docs-page-content">
        {props.children}
      </div>
    </article>
  );
};

/**
 * Section component for organizing content
 */
export const DocsSection: Component<{
  children: JSX.Element;
  title?: string;
  description?: string;
  className?: string;
}> = (props) => {
  return (
    <section class={`docs-section ${props.className || ''}`}>
      <Show when={props.title || props.description}>
        <header class="docs-section-header">
          <Show when={props.title}>
            <h2 class="docs-section-title">{props.title}</h2>
          </Show>
          <Show when={props.description}>
            <p class="docs-section-description">{props.description}</p>
          </Show>
        </header>
      </Show>
      
      <div class="docs-section-content">
        {props.children}
      </div>
    </section>
  );
};

/**
 * Grid layout for documentation content
 */
export const DocsGrid: Component<{
  children: JSX.Element;
  columns?: number;
  gap?: string;
  className?: string;
}> = (props) => {
  const style = () => ({
    'grid-template-columns': `repeat(${props.columns || 1}, 1fr)`,
    gap: props.gap || '1rem'
  });

  return (
    <div 
      class={`docs-grid ${props.className || ''}`}
      style={style()}
    >
      {props.children}
    </div>
  );
};

/**
 * Card grid for feature showcases
 */
export const DocsCardGrid: Component<{
  items: Array<{
    title: string;
    description: string;
    icon?: string;
    href?: string;
    badge?: string;
  }>;
  columns?: number;
  className?: string;
}> = (props) => {
  return (
    <DocsGrid columns={props.columns || 3} className={props.className}>
      <For each={props.items}>
        {(item) => (
          <Card 
            class="docs-feature-card"
            interactive={!!item.href}
            onClick={() => item.href && window.open(item.href, '_blank')}
          >
            <div class="docs-feature-card-content">
              <Show when={item.icon}>
                <div class="docs-feature-icon">
                  <img src={item.icon} alt={item.title} />
                </div>
              </Show>
              
              <div class="docs-feature-text">
                <h3 class="docs-feature-title">
                  {item.title}
                  <Show when={item.badge}>
                    <span class="docs-feature-badge">{item.badge}</span>
                  </Show>
                </h3>
                <p class="docs-feature-description">{item.description}</p>
              </div>
            </div>
          </Card>
        )}
      </For>
    </DocsGrid>
  );
};

/**
 * Hero section component
 */
export const DocsHero: Component<{
  title: string;
  subtitle?: string;
  description?: string;
  actions?: JSX.Element;
  image?: string;
  className?: string;
}> = (props) => {
  return (
    <section class={`docs-hero ${props.className || ''}`}>
      <div class="docs-hero-content">
        <div class="docs-hero-text">
          <h1 class="docs-hero-title">{props.title}</h1>
          <Show when={props.subtitle}>
            <h2 class="docs-hero-subtitle">{props.subtitle}</h2>
          </Show>
          <Show when={props.description}>
            <p class="docs-hero-description">{props.description}</p>
          </Show>
          <Show when={props.actions}>
            <div class="docs-hero-actions">
              {props.actions}
            </div>
          </Show>
        </div>
        
        <Show when={props.image}>
          <div class="docs-hero-image">
            <img src={props.image} alt={props.title} />
          </div>
        </Show>
      </div>
    </section>
  );
};
