/**
 * Git Integration Demo Component
 * Demonstrates feature-aware Git integration capabilities
 */

import { createSignal } from "solid-js";
import { useFeatureAware, useFeatureStatus } from "reynard-features";
import { useLanguage } from "reynard-core";

export default function GitIntegrationDemo() {
  const { t } = useLanguage();
  const { shouldRender, fallback } = useFeatureAware(
    "git-integration",
    <div class="demo-content unavailable">
      <p>{t("demo.gitIntegration.unavailable")}</p>
    </div>
  );
  
  const status = useFeatureStatus("git-integration");
  const [repositoryUrl, setRepositoryUrl] = createSignal("");
  const [gitStatus, setGitStatus] = createSignal<any>(null);
  const [isChecking, setIsChecking] = createSignal(false);

  const checkRepository = () => {
    if (repositoryUrl()) {
      setIsChecking(true);
      // Simulate Git operations
      setTimeout(() => {
        setGitStatus({
          branch: "main",
          lastCommit: "abc1234",
          commitMessage: "Add feature management system",
          author: "Developer",
          date: new Date().toLocaleDateString(),
          status: "clean",
          ahead: 0,
          behind: 0
        });
        setIsChecking(false);
      }, 1500);
    }
  };

  return (
    <div class="feature-demo">
      <h3>🔧 {t("demo.gitIntegration.title")}</h3>
      <p>{t("demo.gitIntegration.description")}</p>
      
      {shouldRender() ? (
        <div class="demo-content">
          <p>{t("demo.gitIntegration.available")}</p>
          
          {status()?.degraded && (
            <div class="status-message warning">
              ⚠️ {status()?.message}
            </div>
          )}
          
          <div style="margin-top: var(--spacing);">
            <input
              type="text"
              placeholder="Enter repository URL (e.g., https://github.com/user/repo)"
              value={repositoryUrl()}
              onInput={(e) => setRepositoryUrl(e.target.value)}
              style="width: 100%; padding: calc(var(--spacing) / 2); border: 1px solid var(--border-color); border-radius: var(--border-radius); background: var(--bg-color); color: var(--text-primary); margin-bottom: calc(var(--spacing) / 2);"
            />
            
            <button 
              class="btn" 
              onClick={checkRepository}
              disabled={!repositoryUrl() || isChecking()}
            >
              {isChecking() ? "Checking Repository..." : "Check Repository Status"}
            </button>
            
            {isChecking() && (
              <div style="margin-top: var(--spacing); text-align: center;">
                <div style="display: inline-block; width: 20px; height: 20px; border: 2px solid var(--accent); border-top: 2px solid transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                <p style="margin-top: calc(var(--spacing) / 2); color: var(--text-secondary);">Fetching repository info...</p>
              </div>
            )}
            
            {gitStatus() && (
              <div style="margin-top: var(--spacing); padding: var(--spacing); background: var(--secondary-bg); border-radius: var(--border-radius); border: 1px solid var(--border-color);">
                <strong>Repository Status:</strong>
                <div style="margin-top: calc(var(--spacing) / 2);">
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: calc(var(--spacing) / 2); font-size: 0.9rem;">
                    <div><strong>Branch:</strong> {gitStatus().branch}</div>
                    <div><strong>Status:</strong> 
                      <span style="color: var(--success);">●</span> {gitStatus().status}
                    </div>
                    <div><strong>Last Commit:</strong> {gitStatus().lastCommit}</div>
                    <div><strong>Author:</strong> {gitStatus().author}</div>
                    <div><strong>Date:</strong> {gitStatus().date}</div>
                    <div><strong>Ahead/Behind:</strong> {gitStatus().ahead}/{gitStatus().behind}</div>
                  </div>
                  <div style="margin-top: calc(var(--spacing) / 2); padding: calc(var(--spacing) / 2); background: var(--bg-color); border-radius: var(--border-radius); border: 1px solid var(--border-color);">
                    <strong>Commit Message:</strong>
                    <p style="margin: calc(var(--spacing) / 4) 0 0 0; font-style: italic;">{gitStatus().commitMessage}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        fallback
      )}
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
