/**
 * Port Detection Utility for E2E Tests
 * Automatically detects the port where the auth-app is running
 */

import { execSync } from 'child_process';

/**
 * Detect the port where the auth-app is running
 * Scans common development ports (3000-3010) for a Vite dev server
 */
export function detectAuthAppPort(): number {
  const commonPorts = [3000, 3001, 3002, 3003, 3004, 3005, 3006, 3007, 3008, 3009, 3010];
  
  for (const port of commonPorts) {
    try {
      // Check if port is listening
      const result = execSync(`ss -tlnp | grep ":${port}"`, { encoding: 'utf8', stdio: 'pipe' });
      if (result.trim()) {
        // Try to make a request to see if it's a Vite dev server
        try {
          const response = execSync(`curl -s http://localhost:${port}`, { 
            encoding: 'utf8', 
            stdio: 'pipe',
            timeout: 2000 
          });
          
          // Check if it's a Vite dev server by looking for Vite-specific content
          if (response.includes('@vite/client') || response.includes('vite')) {
            console.log(`✅ Detected Vite dev server running on port ${port}`);
            return port;
          }
        } catch (_) {
          // Continue to next port if curl fails
          continue;
        }
      }
    } catch (error) {
      // Continue to next port if ss command fails
      continue;
    }
  }
  
  // Fallback to default port
  console.log('⚠️  Could not detect auth-app port, using default 3001');
  return 3001;
}

/**
 * Get the base URL for the auth-app
 */
export function getAuthAppBaseUrl(): string {
  const port = detectAuthAppPort();
  return `http://localhost:${port}`;
}
