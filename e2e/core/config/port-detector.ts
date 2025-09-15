/**
 * Port Detection Utility for E2E Tests
 * Automatically detects ports where various apps are running
 */

import { execSync } from "child_process";

/**
 * Detect the port where the auth-app is running
 * Scans common development ports (3000-3010) for a Vite dev server
 */
export function detectAuthAppPort(): number {
  const commonPorts = [3000, 3001, 3002, 3003, 3004, 3005, 3006, 3007, 3008, 3009, 3010];

  for (const port of commonPorts) {
    try {
      // Check if port is listening
      const result = execSync(`ss -tlnp | grep ":${port}"`, {
        encoding: "utf8",
        stdio: "pipe",
      });
      if (result.trim()) {
        // Try to make a request to see if it's a Vite dev server
        try {
          const response = execSync(`curl -s http://localhost:${port}`, {
            encoding: "utf8",
            stdio: "pipe",
            timeout: 2000,
          });

          // Check if it's a Vite dev server by looking for Vite-specific content
          if (response.includes("@vite/client") || response.includes("vite")) {
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
  console.log("⚠️  Could not detect auth-app port, using default 3001");
  return 3001;
}

/**
 * Detect all running Vite dev servers and their ports
 */
export function detectAllVitePorts(): { [appName: string]: number } {
  const ports: { [appName: string]: number } = {};
  const commonPorts = [
    3000, 3001, 3002, 3003, 3004, 3005, 3006, 3007, 3008, 3009, 3010, 5173, 5174, 5175, 5176, 5177, 5178, 5179, 5180,
  ];

  for (const port of commonPorts) {
    try {
      // Check if port is listening
      const result = execSync(`ss -tlnp | grep ":${port}"`, {
        encoding: "utf8",
        stdio: "pipe",
      });
      if (result.trim()) {
        // Try to make a request to see if it's a Vite dev server
        try {
          const response = execSync(`curl -s http://localhost:${port}`, {
            encoding: "utf8",
            stdio: "pipe",
            timeout: 2000,
          });

          // Check if it's a Vite dev server by looking for Vite-specific content
          if (response.includes("@vite/client") || response.includes("vite")) {
            // Try to determine which app this is based on content
            let appName = `app-${port}`;
            if (response.includes("i18n") || response.includes("translation") || response.includes("language")) {
              appName = "i18n-demo";
            } else if (response.includes("basic") || response.includes("simple") || response.includes("Basic")) {
              appName = "basic-app";
            } else if (response.includes("auth") || response.includes("login") || response.includes("Auth")) {
              appName = "auth-app";
            }

            // Only add if we haven't already detected this app type
            if (!ports[appName]) {
              ports[appName] = port;
              console.log(`✅ Detected ${appName} running on port ${port}`);
            }
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

  return ports;
}

/**
 * Get the base URL for the auth-app
 */
export function getAuthAppBaseUrl(): string {
  const port = detectAuthAppPort();
  return `http://localhost:${port}`;
}

/**
 * Get the base URL for a specific app
 */
export function getAppBaseUrl(appName: string): string {
  const ports = detectAllVitePorts();
  const port = ports[appName];
  if (port) {
    return `http://localhost:${port}`;
  }

  // Fallback to common defaults
  const defaults: { [key: string]: number } = {
    "i18n-demo": 5173,
    "basic-app": 5174,
    "auth-app": 3001,
  };

  const defaultPort = defaults[appName] || 3000;
  console.log(`⚠️  Could not detect ${appName} port, using default ${defaultPort}`);
  return `http://localhost:${defaultPort}`;
}
