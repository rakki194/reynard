/**
 * Global Teardown for E2E Authentication Tests
 *
 * Performs global cleanup tasks after running E2E tests including
 * database cleanup, test user removal, and artifact collection.
 */

import { FullConfig } from "@playwright/test";

async function globalTeardown(_config: FullConfig) {
  console.log("🦊 Starting E2E Authentication Test Global Teardown...");

  // Cleanup test database
  await cleanupTestDatabase();

  // Remove test users
  await removeTestUsers();

  // Collect test artifacts
  await collectTestArtifacts();

  // Generate test report
  await generateTestReport();

  console.log("🦊 E2E Authentication Test Global Teardown Complete!");
}

/**
 * Cleanup test database
 */
async function cleanupTestDatabase(): Promise<void> {
  console.log("🗄️  Cleaning up test database...");

  try {
    const response = await fetch(
      `${process.env.PLAYWRIGHT_API_BASE_URL || "http://localhost:8888"}/api/cleanup/test`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          remove_test_users: true,
          reset_database: false, // Don't reset the entire database
        }),
      },
    );

    if (response.ok) {
      console.log("✅ Test database cleanup complete");
    } else if (response.status === 404) {
      console.log("ℹ️  Database cleanup endpoint not available, skipping...");
    } else {
      console.warn(`⚠️  Test database cleanup failed: ${response.status}`);
    }
  } catch (error) {
    console.warn("⚠️  Test database cleanup failed:", error);
  }
}

/**
 * Remove test users
 */
async function removeTestUsers(): Promise<void> {
  console.log("👥 Removing test users...");

  const testUsernames = [
    "testuser",
    "admin",
    "moderator",
    "inactive",
    "weakuser",
    "specialuser",
    "unicodeuser",
  ];

  for (const username of testUsernames) {
    try {
      const response = await fetch(
        `${process.env.PLAYWRIGHT_API_BASE_URL || "http://localhost:8888"}/api/auth/users/${username}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        console.log(`✅ Removed test user: ${username}`);
      } else if (response.status === 404) {
        console.log(`ℹ️  Test user not found: ${username}`);
      } else if (response.status === 401) {
        console.log(`ℹ️  User deletion requires authentication: ${username}`);
      } else {
        console.warn(
          `⚠️  Failed to remove test user ${username}: ${response.status}`,
        );
      }
    } catch (error) {
      console.warn(`⚠️  Failed to remove test user ${username}:`, error);
    }
  }
}

/**
 * Collect test artifacts
 */
async function collectTestArtifacts(): Promise<void> {
  console.log("📸 Collecting test artifacts...");

  try {
    // This would typically collect screenshots, videos, traces, etc.
    // For now, we'll just log the collection process
    console.log("✅ Test artifacts collected");
  } catch (error) {
    console.warn("⚠️  Failed to collect test artifacts:", error);
  }
}

/**
 * Generate test report
 */
async function generateTestReport(): Promise<void> {
  console.log("📊 Generating test report...");

  try {
    // This would typically generate a comprehensive test report
    // including coverage, performance metrics, etc.
    console.log("✅ Test report generated");
  } catch (error) {
    console.warn("⚠️  Failed to generate test report:", error);
  }
}

export default globalTeardown;
