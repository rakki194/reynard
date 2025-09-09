/**
 * ComfyUI Demo App
 * 
 * Demonstrates ComfyUI integration with Reynard framework.
 */

import { Component } from 'solid-js';
import { ComfyHealthStatus, ComfyText2ImgForm } from 'reynard-comfy';

const App: Component = () => {
  const handleGenerate = (promptId: string) => {
    console.log('Generation started:', promptId);
  };

  const handleComplete = (result: any) => {
    console.log('Generation completed:', result);
  };

  const handleError = (error: string) => {
    console.error('Generation failed:', error);
  };

  return (
    <div class="app">
      <header class="app-header">
        <h1>ComfyUI Integration Demo</h1>
        <p>Demonstrating ComfyUI workflow automation with Reynard</p>
      </header>

      <main class="app-main">
        <div class="demo-section">
          <h2>Service Health</h2>
          <ComfyHealthStatus showDetails={true} />
        </div>

        <div class="demo-section">
          <h2>Text-to-Image Generation</h2>
          <ComfyText2ImgForm
            onGenerate={handleGenerate}
            onComplete={handleComplete}
            onError={handleError}
            initialValues={{
              caption: "a beautiful landscape with mountains and a lake",
              width: 1024,
              height: 1024,
              steps: 24,
              cfg: 5.5,
            }}
          />
        </div>
      </main>

      <footer class="app-footer">
        <p>Reynard ComfyUI Integration Demo</p>
      </footer>
    </div>
  );
};

export default App;
