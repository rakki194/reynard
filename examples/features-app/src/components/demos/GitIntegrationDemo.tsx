/**
 * Git Integration Demo Component
 * Demonstrates feature-aware Git integration capabilities
 */

import { createSignal } from "solid-js";
import { useFeatureAware, useFeatureStatus } from "reynard-features";

export default function GitIntegrationDemo() {
  const { shouldRender, fallback } = useFeatureAware(
    "git-integration",
    <div class="demo-content unavailable">
      <p>Git integration is currently unavailable</p>
    </div>
  );
  
  const status = useFeatureStatus("git-integration");
  const [repositoryUrl, setRepositoryUrl] = createSignal("");
  const [gitStatus, setGitStatus] = createSignal<{
    branch: string;
    lastCommit: string;
    commitMessage: string;
    author: string;
    date: string;
    status: string;
    ahead: number;
    behind: number;
  } | null>(null);
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
      <h3>🔧 Git Integration</h3>
      <p>Check repository status and manage Git operations</p>
      
      {shouldRender() ? (
        <div class="demo-content">
          <p>Git integration is fully available</p>
          
          {status()?.degraded && (
            <div class="status-message warning">
              ⚠️ {status()?.message}
            </div>
          )}
          
          <div class="git-demo-container">
            <input
              type="text"
              class="git-input"
              placeholder="Enter repository URL (e.g., https://github.com/user/repo)"
              value={repositoryUrl()}
              onInput={(e) => setRepositoryUrl(e.target.value)}
            />
            
            <button 
              class="btn" 
              onClick={checkRepository}
              disabled={!repositoryUrl() || isChecking()}
            >
              {isChecking() ? "Checking Repository..." : "Check Repository Status"}
            </button>
            
            {isChecking() && (
              <div class="git-loading">
                <div class="git-spinner" />
                <p class="git-loading-text">Fetching repository info...</p>
              </div>
            )}
            
            {gitStatus() && (
              <div class="git-status-container">
                <strong>Repository Status:</strong>
                <div class="git-status-grid">
                  <div><strong>Branch:</strong> {gitStatus()!.branch}</div>
                  <div><strong>Status:</strong> 
                    <span class="git-status-indicator">●</span> {gitStatus()!.status}
                  </div>
                  <div><strong>Last Commit:</strong> {gitStatus()!.lastCommit}</div>
                  <div><strong>Author:</strong> {gitStatus()!.author}</div>
                  <div><strong>Date:</strong> {gitStatus()!.date}</div>
                  <div><strong>Ahead/Behind:</strong> {gitStatus()!.ahead}/{gitStatus()!.behind}</div>
                </div>
                <div class="git-commit-message">
                  <strong>Commit Message:</strong>
                  <p>{gitStatus()!.commitMessage}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        fallback
      )}
    </div>
  );
}
