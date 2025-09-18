/**
 * 🦊 EFFECTS GLOBAL SETUP
 * 
 * *whiskers twitch with strategic cunning* Global setup for effect monitoring tests.
 * Initializes monitoring systems and prepares the test environment.
 */

import { chromium, FullConfig } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

async function globalSetup(config: FullConfig) {
  console.log('🦊 Setting up effects monitoring environment...');
  
  // Create results directory
  const resultsDir = path.join(__dirname, '../../results');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }
  
  // Create effects-specific results directory
  const effectsResultsDir = path.join(resultsDir, 'effects');
  if (!fs.existsSync(effectsResultsDir)) {
    fs.mkdirSync(effectsResultsDir, { recursive: true });
  }
  
  // Initialize monitoring configuration
  const monitoringConfig = {
    maxApiCallsPerSecond: 10,
    maxEffectExecutions: 5,
    maxMemoryUsageMB: 100,
    maxCpuUsagePercent: 80,
    detectionWindowMs: 5000,
    alertThreshold: 0.8,
    testEnvironment: 'effects-monitoring',
    startTime: new Date().toISOString()
  };
  
  // Save monitoring configuration
  fs.writeFileSync(
    path.join(effectsResultsDir, 'monitoring-config.json'),
    JSON.stringify(monitoringConfig, null, 2)
  );
  
  // Test server connectivity
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:3001/test-effects', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Verify test page loaded
    const title = await page.title();
    if (!title.includes('Effect Dependency Test Page')) {
      throw new Error('Test page did not load correctly');
    }
    
    console.log('✅ Effects test environment ready');
    
    // Save setup status
    fs.writeFileSync(
      path.join(effectsResultsDir, 'setup-status.json'),
      JSON.stringify({
        status: 'ready',
        timestamp: new Date().toISOString(),
        testPageUrl: 'http://localhost:3001/test-effects',
        title: title
      }, null, 2)
    );
    
  } catch (error) {
    console.error('❌ Failed to setup effects test environment:', error);
    
    // Save error status
    fs.writeFileSync(
      path.join(effectsResultsDir, 'setup-status.json'),
      JSON.stringify({
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error.message
      }, null, 2)
    );
    
    throw error;
  } finally {
    await browser.close();
  }
  
  console.log('🦊 Effects global setup completed');
}

export default globalSetup;
