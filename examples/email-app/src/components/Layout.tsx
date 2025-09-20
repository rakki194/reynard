import { Outlet, Link, useLocation } from "@solidjs/router";
import { For } from "solid-js";

export function Layout(props: { children?: any }) {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard", icon: "📊" },
    { path: "/compose", label: "Compose", icon: "✏️" },
    { path: "/inbox", label: "Inbox", icon: "📥" },
    { path: "/imap-inbox", label: "IMAP Inbox", icon: "📨" },
    { path: "/templates", label: "Templates", icon: "📝" },
    { path: "/agents", label: "Agent Center", icon: "🤖" },
  ];

  return (
    <div class="email-app">
      <header class="email-header">
        <div class="email-header-left">
          <h1>🦊 Reynard Email System</h1>
        </div>
        <nav class="email-nav">
          <For each={navItems}>
            {item => (
              <Link href={item.path} class={location.pathname === item.path ? "active" : ""}>
                <span class="nav-icon">{item.icon}</span>
                {item.label}
              </Link>
            )}
          </For>
        </nav>
      </header>

      <main class="email-main">
        <div class="email-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
