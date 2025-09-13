/**
 * Global Setup for E2E Authentication Tests
 * 
 * Performs global setup tasks before running E2E tests including
 * database initialization, test user creation, and environment validation.
 */

import { chromium, FullConfig } from '@playwright/test';
import { TestUserData } from './fixtures/test-data';

async function globalSetup(_config: FullConfig) {
  console.log('🦊 Starting E2E Authentication Test Global Setup...');

  // Validate environment
  await validateEnvironment();

  // Setup test database
  await setupTestDatabase();

  // Create test users
  await createTestUsers();

  // Validate backend connectivity
  await validateBackendConnectivity();

  // Validate frontend connectivity
  await validateFrontendConnectivity();

  console.log('🦊 E2E Authentication Test Global Setup Complete!');
}

/**
 * Validate test environment
 */
async function validateEnvironment(): Promise<void> {
  console.log('🔍 Validating test environment...');

  const requiredEnvVars = [
    'PLAYWRIGHT_BASE_URL',
    'PLAYWRIGHT_API_BASE_URL',
  ];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.warn(`⚠️  Environment variable ${envVar} not set, using default`);
    }
  }

  // Check if backend is accessible
  try {
    const response = await fetch(process.env.PLAYWRIGHT_API_BASE_URL || 'http://localhost:8888/');
    if (!response.ok) {
      throw new Error(`Backend health check failed: ${response.status}`);
    }
    console.log('✅ Backend connectivity validated');
  } catch (error) {
    console.error('❌ Backend connectivity validation failed:', error);
    throw error;
  }
}

/**
 * Setup test database
 */
async function setupTestDatabase(): Promise<void> {
  console.log('🗄️  Setting up test database...');

  try {
    // Initialize test database
    const response = await fetch(`${process.env.PLAYWRIGHT_API_BASE_URL || 'http://localhost:8000'}/api/setup/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reset: true,
        create_test_users: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Database setup failed: ${response.status}`);
    }

    console.log('✅ Test database setup complete');
  } catch (error) {
    console.error('❌ Test database setup failed:', error);
    // Don't throw error as this might not be available in all environments
    console.warn('⚠️  Continuing without database setup...');
  }
}

/**
 * Create test users
 */
async function createTestUsers(): Promise<void> {
  console.log('👥 Creating test users...');

  const testUsers = [
    TestUserData.getValidUser(),
    TestUserData.getAdminUser(),
    TestUserData.getModeratorUser(),
    TestUserData.getInactiveUser(),
  ];

  for (const user of testUsers) {
    try {
      const response = await fetch(`${process.env.PLAYWRIGHT_API_BASE_URL || 'http://localhost:8000'}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: user.username,
          email: user.email,
          password: user.password,
          full_name: user.fullName,
        }),
      });

      if (response.ok) {
        console.log(`✅ Created test user: ${user.username}`);
      } else if (response.status === 400) {
        console.log(`ℹ️  Test user already exists: ${user.username}`);
      } else {
        console.warn(`⚠️  Failed to create test user ${user.username}: ${response.status}`);
      }
    } catch (error) {
      console.warn(`⚠️  Failed to create test user ${user.username}:`, error);
    }
  }
}

/**
 * Validate backend connectivity
 */
async function validateBackendConnectivity(): Promise<void> {
  console.log('🔗 Validating backend connectivity...');

  const backendUrl = process.env.PLAYWRIGHT_API_BASE_URL || 'http://localhost:8888';
  
  try {
    const response = await fetch(`${backendUrl}/`);
    if (!response.ok) {
      throw new Error(`Backend health check failed: ${response.status}`);
    }

    const healthData = await response.json();
    console.log('✅ Backend health check passed:', healthData);
  } catch (error) {
    console.error('❌ Backend connectivity validation failed:', error);
    throw error;
  }
}

/**
 * Validate frontend connectivity
 */
async function validateFrontendConnectivity(): Promise<void> {
  console.log('🔗 Validating frontend connectivity...');

  const frontendUrl = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';
  
  try {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    await page.goto(frontendUrl, { timeout: 30000 });
    
    // Check if the page loads successfully
    const title = await page.title();
    console.log(`✅ Frontend loaded successfully: ${title}`);
    
    await browser.close();
  } catch (error) {
    console.error('❌ Frontend connectivity validation failed:', error);
    throw error;
  }
}

export default globalSetup;
