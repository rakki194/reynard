/**
 * 🐺 GLOBAL PENETRATION TESTING SETUP
 * 
 * *snarls with predatory glee* Global setup for penetration testing suite
 * including blackhat exploit validation and environment preparation.
 */

import { chromium, FullConfig } from '@playwright/test';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

async function globalSetup(_config: FullConfig) {
  console.log('🐺 Starting Penetration Testing Global Setup...');

  // Validate blackhat suite availability
  await validateBlackhatSuite();

  // Validate target environment
  await validateTargetEnvironment();

  // Setup penetration testing environment
  await setupPenetrationEnvironment();

  console.log('✅ Penetration testing global setup completed');
}

/**
 * Validate blackhat suite is available and functional
 */
async function validateBlackhatSuite(): Promise<void> {
  console.log('🔍 Validating blackhat exploit suite...');
  
  const blackhatPath = path.join(process.cwd(), '..', 'blackhat');
  
  try {
    // Check if blackhat directory exists
    const { stdout } = await execAsync(`ls -la "${blackhatPath}"`);
    console.log('✅ Blackhat directory found');
    
    // Check if Python dependencies are available
    const pythonPath = process.env.PYTHON_PATH || 'python3';
    const { stdout: deps } = await execAsync(`${pythonPath} -c "import requests, jwt, httpx; print('Dependencies OK')"`);
    console.log('✅ Python dependencies validated');
    
    // Test blackhat suite import
    const { stdout: importTest } = await execAsync(`${pythonPath} -c "
import sys
sys.path.append('${blackhatPath}')
from blackhat import jwt_exploits, sql_injection, path_traversal
print('Blackhat imports OK')
"`);
    console.log('✅ Blackhat suite imports validated');
    
  } catch (error) {
    console.error('❌ Blackhat suite validation failed:', error);
    throw new Error('Blackhat suite validation failed');
  }
}

/**
 * Validate target environment is ready for penetration testing
 */
async function validateTargetEnvironment(): Promise<void> {
  console.log('🎯 Validating target environment...');
  
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
  const frontendUrl = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';
  
  try {
    // Test backend connectivity
    const { stdout: backendTest } = await execAsync(`curl -s -o /dev/null -w "%{http_code}" "${backendUrl}/health" || echo "000"`);
    if (backendTest.trim() === '200') {
      console.log('✅ Backend is accessible');
    } else {
      console.log('⚠️ Backend may not be running (this is OK for some tests)');
    }
    
    // Test frontend connectivity
    const { stdout: frontendTest } = await execAsync(`curl -s -o /dev/null -w "%{http_code}" "${frontendUrl}" || echo "000"`);
    if (frontendTest.trim() === '200') {
      console.log('✅ Frontend is accessible');
    } else {
      console.log('⚠️ Frontend may not be running (this is OK for some tests)');
    }
    
  } catch (error) {
    console.warn('⚠️ Target environment validation warning:', error.message);
  }
}

/**
 * Setup penetration testing environment
 */
async function setupPenetrationEnvironment(): Promise<void> {
  console.log('🛡️ Setting up penetration testing environment...');
  
  // Create results directory
  await execAsync('mkdir -p penetration-results');
  console.log('✅ Results directory created');
  
  // Set environment variables for penetration testing
  process.env.PENETRATION_TESTING = 'true';
  process.env.DESTRUCTIVE_TESTING = process.env.DESTRUCTIVE_TESTING || 'false';
  process.env.VERBOSE_TESTING = process.env.VERBOSE_TESTING || 'false';
  
  console.log('✅ Environment variables set');
  console.log(`   - Destructive testing: ${process.env.DESTRUCTIVE_TESTING}`);
  console.log(`   - Verbose testing: ${process.env.VERBOSE_TESTING}`);
  
  // Validate destructive testing warning
  if (process.env.DESTRUCTIVE_TESTING === 'true') {
    console.log('🚨 WARNING: Destructive testing is enabled!');
    console.log('   This will actually attempt to break the target system!');
    console.log('   Make sure you are testing on a safe environment!');
  }
}

export default globalSetup;
