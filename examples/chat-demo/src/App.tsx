import { Component, createSignal, onMount, Show } from 'solid-js';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { AssistantChatDemo } from './components/AssistantChatDemo';
import { P2PChatDemo } from './components/P2PChatDemo';
import { DualChatDemo } from './components/DualChatDemo';
import { FeatureShowcase } from './components/FeatureShowcase';
import { mockBackendService } from './services/mockBackend';
import type { ChatUser } from '@reynard/components';

export type DemoView = 'assistant' | 'p2p' | 'dual' | 'features';

const App: Component = () => {
  const [currentView, setCurrentView] = createSignal<DemoView>('assistant');
  const [isBackendReady, setIsBackendReady] = createSignal(false);
  const [currentUser] = createSignal<ChatUser>({
    id: 'demo-user-1',
    name: 'Demo User',
    status: 'online',
    avatar: '👤',
    metadata: {
      timezone: 'UTC',
      language: 'en',
      role: 'user'
    }
  });

  onMount(async () => {
    // Initialize mock backend services
    await mockBackendService.initialize();
    setIsBackendReady(true);
  });

  return (
    <div class="app">
      <Header 
        currentUser={currentUser()}
        onUserStatusChange={(status) => {
          // Update user status in real backend
          console.log('User status changed to:', status);
        }}
      />
      
      <div class="app-content">
        <Navigation 
          currentView={currentView()}
          onViewChange={setCurrentView}
        />
        
        <main class="app-main">
          <Show 
            when={isBackendReady()}
            fallback={
              <div class="loading-screen">
                <div class="loading-spinner"></div>
                <p>Initializing demo backend services...</p>
              </div>
            }
          >
            <Show when={currentView() === 'assistant'}>
              <AssistantChatDemo />
            </Show>
            
            <Show when={currentView() === 'p2p'}>
              <P2PChatDemo currentUser={currentUser()} />
            </Show>
            
            <Show when={currentView() === 'dual'}>
              <DualChatDemo currentUser={currentUser()} />
            </Show>
            
            <Show when={currentView() === 'features'}>
              <FeatureShowcase currentUser={currentUser()} />
            </Show>
          </Show>
        </main>
      </div>
    </div>
  );
};

export default App;
