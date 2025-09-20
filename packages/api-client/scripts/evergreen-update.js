#!/usr/bin/env node

/**
 * Evergreen API Client Update Script
 * 
 * This script automatically updates the API client when backend changes are detected.
 * It monitors the backend OpenAPI spec and regenerates the client when needed.
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const BACKEND_URL = 'http://localhost:8000';
const OPENAPI_SPEC_URL = `${BACKEND_URL}/openapi.json`;
const SPEC_CACHE_FILE = '.openapi-spec-cache.json';
const CLIENT_VERSION_FILE = 'src/version.ts';

class EvergreenUpdater {
  constructor() {
    this.projectRoot = process.cwd();
    this.specCachePath = join(this.projectRoot, SPEC_CACHE_FILE);
    this.versionPath = join(this.projectRoot, CLIENT_VERSION_FILE);
  }

  /**
   * Fetch the current OpenAPI specification from the backend
   */
  async fetchOpenAPISpec() {
    try {
      console.log('🔍 Fetching OpenAPI specification from backend...');
      const response = await fetch(OPENAPI_SPEC_URL);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch OpenAPI spec: ${response.status} ${response.statusText}`);
      }
      
      const spec = await response.json();
      console.log('✅ OpenAPI specification fetched successfully');
      return spec;
    } catch (error) {
      console.error('❌ Failed to fetch OpenAPI specification:', error.message);
      throw error;
    }
  }

  /**
   * Get the cached OpenAPI specification
   */
  getCachedSpec() {
    if (!existsSync(this.specCachePath)) {
      return null;
    }
    
    try {
      const cached = JSON.parse(readFileSync(this.specCachePath, 'utf8'));
      return cached;
    } catch (error) {
      console.warn('⚠️  Failed to read cached spec, will regenerate');
      return null;
    }
  }

  /**
   * Cache the OpenAPI specification
   */
  cacheSpec(spec) {
    try {
      writeFileSync(this.specCachePath, JSON.stringify(spec, null, 2));
      console.log('💾 OpenAPI specification cached');
    } catch (error) {
      console.warn('⚠️  Failed to cache spec:', error.message);
    }
  }

  /**
   * Check if the specification has changed
   */
  hasSpecChanged(currentSpec, cachedSpec) {
    if (!cachedSpec) {
      return true;
    }

    // Compare the info.version field as a simple change detection
    const currentVersion = currentSpec.info?.version;
    const cachedVersion = cachedSpec.info?.version;
    
    if (currentVersion !== cachedVersion) {
      console.log(`📊 Version changed: ${cachedVersion} → ${currentVersion}`);
      return true;
    }

    // Compare the paths count as another indicator
    const currentPathsCount = Object.keys(currentSpec.paths || {}).length;
    const cachedPathsCount = Object.keys(cachedSpec.paths || {}).length;
    
    if (currentPathsCount !== cachedPathsCount) {
      console.log(`🛣️  Paths count changed: ${cachedPathsCount} → ${currentPathsCount}`);
      return true;
    }

    console.log('✅ No changes detected in OpenAPI specification');
    return false;
  }

  /**
   * Update the client version
   */
  updateClientVersion(spec) {
    const version = spec.info?.version || '1.0.0';
    const timestamp = new Date().toISOString();
    
    const versionContent = `/**
 * Auto-generated version information for Reynard API Client
 * Updated: ${timestamp}
 */

export const API_CLIENT_VERSION = '${version}';
export const LAST_UPDATED = '${timestamp}';
export const BACKEND_VERSION = '${spec.info?.version || 'unknown'}';
export const OPENAPI_VERSION = '${spec.openapi || 'unknown'}';
`;

    try {
      writeFileSync(this.versionPath, versionContent);
      console.log(`📝 Client version updated to ${version}`);
    } catch (error) {
      console.warn('⚠️  Failed to update client version:', error.message);
    }
  }

  /**
   * Regenerate the API client
   */
  regenerateClient() {
    try {
      console.log('🔄 Regenerating API client...');
      
      // Clean previous generated files
      execSync('pnpm run clean', { stdio: 'inherit' });
      
      // Generate new client
      execSync('pnpm run generate', { stdio: 'inherit' });
      
      // Build the client
      execSync('pnpm run build', { stdio: 'inherit' });
      
      console.log('✅ API client regenerated successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to regenerate API client:', error.message);
      return false;
    }
  }

  /**
   * Run the evergreen update process
   */
  async run() {
    console.log('🌲 Starting evergreen API client update...');
    
    try {
      // Fetch current specification
      const currentSpec = await this.fetchOpenAPISpec();
      
      // Get cached specification
      const cachedSpec = this.getCachedSpec();
      
      // Check if specification has changed
      if (!this.hasSpecChanged(currentSpec, cachedSpec)) {
        console.log('✨ API client is up to date');
        return;
      }
      
      // Update client version
      this.updateClientVersion(currentSpec);
      
      // Regenerate client
      const success = this.regenerateClient();
      
      if (success) {
        // Cache the new specification
        this.cacheSpec(currentSpec);
        console.log('🎉 Evergreen update completed successfully');
      } else {
        console.error('💥 Evergreen update failed');
        process.exit(1);
      }
      
    } catch (error) {
      console.error('💥 Evergreen update failed:', error.message);
      process.exit(1);
    }
  }
}

// Run the evergreen updater
if (import.meta.url === `file://${process.argv[1]}`) {
  const updater = new EvergreenUpdater();
  updater.run().catch(console.error);
}

export default EvergreenUpdater;

