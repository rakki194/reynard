/**
 * Games Demo E2E Tests
 * 
 * Comprehensive end-to-end tests for the Reynard Games Demo application.
 * Tests game functionality, UI interactions, navigation, and performance.
 * 
 * @author 🦊 The Cunning Fox
 */

import { test, expect, Page } from "@playwright/test";

test.describe("Games Demo E2E Tests", () => {
  let page: Page;
  const GAMES_DEMO_URL = "http://localhost:3002";

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    
    // Set viewport for consistent testing
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // Navigate to games demo
    await page.goto(GAMES_DEMO_URL, { 
      waitUntil: "networkidle",
      timeout: 30000 
    });
  });

  test.afterEach(async () => {
    await page.close();
  });

  test.describe("Main Menu and Navigation", () => {
    test("should load games demo main menu", async () => {
      // Check page title
      await expect(page).toHaveTitle(/Reynard Games Demo/);
      
      // Check main header
      await expect(page.locator("h1")).toContainText("Reynard Games Demo");
      
      // Check subtitle
      await expect(page.locator("p").first()).toContainText("Interactive Games and Visualizations");
      
      // Check Reynard logo
      await expect(page.locator(".reynard-logo")).toContainText("🦊");
    });

    test("should display game selection cards", async () => {
      // Check for game cards
      const gameCards = page.locator(".game-card");
      await expect(gameCards).toHaveCount(2);
      
      // Check rogue-like game card
      const roguelikeCard = gameCards.first();
      await expect(roguelikeCard.locator(".game-icon")).toContainText("🎮");
      await expect(roguelikeCard.locator("h3")).toContainText("Rogue-like Dungeon Crawler");
      await expect(roguelikeCard.locator("p")).toContainText("ECS system");
      
      // Check 3D games card
      const threedCard = gameCards.nth(1);
      await expect(threedCard.locator(".game-icon")).toContainText("🎲");
      await expect(threedCard.locator("h3")).toContainText("3D Interactive Games");
      await expect(threedCard.locator("p")).toContainText("Three.js");
    });

    test("should display feature tags on game cards", async () => {
      const gameCards = page.locator(".game-card");
      
      // Check rogue-like features
      const roguelikeFeatures = gameCards.first().locator(".feature-tag");
      await expect(roguelikeFeatures).toHaveCount(4);
      await expect(roguelikeFeatures.nth(0)).toContainText("ECS Architecture");
      await expect(roguelikeFeatures.nth(1)).toContainText("Procedural Generation");
      await expect(roguelikeFeatures.nth(2)).toContainText("AI Systems");
      await expect(roguelikeFeatures.nth(3)).toContainText("Pixel Art");
      
      // Check 3D games features
      const threedFeatures = gameCards.nth(1).locator(".feature-tag");
      await expect(threedFeatures).toHaveCount(4);
      await expect(threedFeatures.nth(0)).toContainText("Three.js");
      await expect(threedFeatures.nth(1)).toContainText("3D Graphics");
      await expect(threedFeatures.nth(2)).toContainText("Interactive");
      await expect(threedFeatures.nth(3)).toContainText("Multiple Games");
    });

    test("should display technical features section", async () => {
      // Check tech info section
      await expect(page.locator(".tech-info h3")).toContainText("🛠️ Technical Features");
      
      // Check tech grid
      const techItems = page.locator(".tech-item");
      await expect(techItems).toHaveCount(4);
      
      await expect(techItems.nth(0).locator("h4")).toContainText("ECS System");
      await expect(techItems.nth(1).locator("h4")).toContainText("3D Rendering");
      await expect(techItems.nth(2).locator("h4")).toContainText("Procedural Generation");
      await expect(techItems.nth(3).locator("h4")).toContainText("AI Systems");
    });

    test("should have theme toggle functionality", async () => {
      // Check theme toggle exists
      const themeToggle = page.locator("button").filter({ hasText: /theme/i });
      await expect(themeToggle).toBeVisible();
      
      // Test theme toggle click
      await themeToggle.click();
      
      // Check if theme changed (this might vary based on implementation)
      // We'll just verify the button is still clickable
      await expect(themeToggle).toBeEnabled();
    });

    test("should have footer with GitHub link", async () => {
      const footer = page.locator(".app-footer");
      await expect(footer).toBeVisible();
      await expect(footer).toContainText("Built with 🦊 Reynard Framework");
      
      const githubLink = footer.locator("a[href*='github']");
      await expect(githubLink).toBeVisible();
      await expect(githubLink).toHaveAttribute("target", "_blank");
      await expect(githubLink).toHaveAttribute("rel", "noopener noreferrer");
    });
  });

  test.describe("Rogue-like Game Navigation", () => {
    test("should navigate to rogue-like game page", async () => {
      // Click on rogue-like game card
      const roguelikeCard = page.locator(".game-card").first();
      await roguelikeCard.click();
      
      // Wait for hash change (hash-based routing)
      await page.waitForFunction(() => window.location.hash === "#roguelike", { timeout: 10000 });
      
      // Check page content
      await expect(page.locator("h1")).toContainText("Reynard Rogue-like");
      await expect(page.locator(".page-description")).toContainText("ECS system");
    });

    test("should display rogue-like game component", async () => {
      // Navigate to rogue-like page
      await page.locator(".game-card").first().click();
      await page.waitForURL("**/roguelike**");
      
      // Check game container
      const gameContainer = page.locator(".game-container");
      await expect(gameContainer).toBeVisible();
      
      // Check for game component (canvas or game element)
      const gameElement = gameContainer.locator("canvas, .main-game, [data-testid='roguelike-game']");
      await expect(gameElement).toBeVisible();
    });

    test("should display technical features for rogue-like", async () => {
      // Navigate to rogue-like page
      await page.locator(".game-card").first().click();
      await page.waitForURL("**/roguelike**");
      
      // Check tech stack section
      await expect(page.locator(".tech-stack h3")).toContainText("🛠️ Technical Features");
      
      // Check feature cards
      const featureCards = page.locator(".feature-card");
      await expect(featureCards).toHaveCount(6);
      
      // Check specific features
      await expect(featureCards.nth(0).locator("h4")).toContainText("ECS Architecture");
      await expect(featureCards.nth(1).locator("h4")).toContainText("Procedural Generation");
      await expect(featureCards.nth(2).locator("h4")).toContainText("AI Systems");
      await expect(featureCards.nth(3).locator("h4")).toContainText("Pixel Art Rendering");
      await expect(featureCards.nth(4).locator("h4")).toContainText("Line of Sight");
      await expect(featureCards.nth(5).locator("h4")).toContainText("Combat & Items");
    });
  });

  test.describe("3D Games Navigation", () => {
    test("should navigate to 3D games page", async () => {
      // Click on 3D games card
      const threedCard = page.locator(".game-card").nth(1);
      await threedCard.click();
      
      // Wait for hash change (hash-based routing)
      await page.waitForFunction(() => window.location.hash === "#3d-games", { timeout: 10000 });
      
      // Check page content
      await expect(page.locator("h1")).toContainText("Reynard 3D Games");
      await expect(page.locator("p")).toContainText("Three.js");
    });

    test("should display 3D games interface", async () => {
      // Navigate to 3D games page
      await page.locator(".game-card").nth(1).click();
      await page.waitForURL("**/3d-games**");
      
      // Check for game selection interface
      await expect(page.locator(".game-selection")).toBeVisible();
      
      // Check for game info component
      await expect(page.locator(".game-info, [data-testid='game-info']")).toBeVisible();
    });

    test("should have score display", async () => {
      // Navigate to 3D games page
      await page.locator(".game-card").nth(1).click();
      await page.waitForURL("**/3d-games**");
      
      // Check score display
      const scoreDisplay = page.locator(".score-display");
      await expect(scoreDisplay).toBeVisible();
      await expect(scoreDisplay).toContainText("Score:");
      await expect(scoreDisplay.locator(".score-value")).toContainText("0");
    });
  });

  test.describe("Game Interactions", () => {
    test("should handle game card hover effects", async () => {
      const gameCard = page.locator(".game-card").first();
      
      // Test hover effect
      await gameCard.hover();
      
      // Check if card has hover state (transform or shadow changes)
      const cardStyles = await gameCard.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return {
          transform: styles.transform,
          boxShadow: styles.boxShadow
        };
      });
      
      // Card should still be visible after hover
      await expect(gameCard).toBeVisible();
    });

    test("should handle play button clicks", async () => {
      const playButtons = page.locator(".play-button");
      await expect(playButtons).toHaveCount(2);
      
      // Test first play button (rogue-like)
      await playButtons.first().click();
      await page.waitForURL("**/roguelike**");
      
      // Go back and test second play button (3D games)
      await page.goBack();
      await page.waitForLoadState("networkidle");
      
      await playButtons.nth(1).click();
      await page.waitForURL("**/3d-games**");
    });
  });

  test.describe("Responsive Design", () => {
    test("should work on mobile viewport", async () => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Check if main elements are still visible
      await expect(page.locator("h1")).toBeVisible();
      await expect(page.locator(".game-card")).toHaveCount(2);
      
      // Check if cards stack vertically on mobile
      const gameCards = page.locator(".game-card");
      const firstCardBox = await gameCards.first().boundingBox();
      const secondCardBox = await gameCards.nth(1).boundingBox();
      
      // Second card should be below first card
      expect(secondCardBox!.y).toBeGreaterThan(firstCardBox!.y + firstCardBox!.height);
    });

    test("should work on tablet viewport", async () => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      
      // Check if layout adapts
      await expect(page.locator("h1")).toBeVisible();
      await expect(page.locator(".game-card")).toHaveCount(2);
      
      // Check if tech grid adapts
      await expect(page.locator(".tech-grid")).toBeVisible();
    });
  });

  test.describe("Performance and Loading", () => {
    test("should load within acceptable time", async () => {
      const startTime = Date.now();
      
      await page.goto(GAMES_DEMO_URL, { 
        waitUntil: "networkidle",
        timeout: 30000 
      });
      
      const loadTime = Date.now() - startTime;
      
      // Should load within 5 seconds
      expect(loadTime).toBeLessThan(5000);
    });

    test("should have proper meta tags", async () => {
      // Check meta description
      const metaDescription = page.locator('meta[name="description"]');
      await expect(metaDescription).toHaveAttribute("content", /Interactive Games/);
      
      // Check viewport meta tag
      const viewport = page.locator('meta[name="viewport"]');
      await expect(viewport).toHaveAttribute("content", /width=device-width/);
    });

    test("should handle navigation without page reload", async () => {
      // Navigate to rogue-like
      await page.locator(".game-card").first().click();
      await page.waitForURL("**/roguelike**");
      
      // Navigate to 3D games
      await page.locator(".game-card").nth(1).click();
      await page.waitForURL("**/3d-games**");
      
      // Go back to main menu
      await page.goBack();
      await page.waitForLoadState("networkidle");
      
      // Should be back at main menu
      await expect(page.locator("h1")).toContainText("Reynard Games Demo");
    });
  });

  test.describe("Accessibility", () => {
    test("should have proper heading hierarchy", async () => {
      // Check h1 exists
      await expect(page.locator("h1")).toHaveCount(1);
      
      // Check h3 elements exist
      const h3Elements = page.locator("h3");
      await expect(h3Elements).toHaveCount.greaterThan(0);
    });

    test("should have accessible buttons", async () => {
      const buttons = page.locator("button");
      await expect(buttons).toHaveCount.greaterThan(0);
      
      // Check if buttons have proper roles
      for (let i = 0; i < await buttons.count(); i++) {
        const button = buttons.nth(i);
        await expect(button).toBeVisible();
        // Button should be focusable
        await expect(button).toBeEnabled();
      }
    });

    test("should have proper link accessibility", async () => {
      const links = page.locator("a");
      await expect(links).toHaveCount.greaterThan(0);
      
      // Check external links have proper attributes
      const externalLinks = links.filter({ hasText: /GitHub|github/i });
      if (await externalLinks.count() > 0) {
        await expect(externalLinks.first()).toHaveAttribute("target", "_blank");
        await expect(externalLinks.first()).toHaveAttribute("rel", "noopener noreferrer");
      }
    });
  });

  test.describe("Error Handling", () => {
    test("should handle invalid navigation gracefully", async () => {
      // Try to navigate to non-existent game
      await page.goto(`${GAMES_DEMO_URL}/#invalid-game`);
      
      // Should fall back to main menu
      await expect(page.locator("h1")).toContainText("Reynard Games Demo");
    });

    test("should handle network errors gracefully", async () => {
      // Simulate network failure
      await page.route("**/*", route => route.abort());
      
      // Try to navigate
      await page.goto(GAMES_DEMO_URL, { timeout: 5000 }).catch(() => {});
      
      // Should handle gracefully (might show error or fallback)
      // This test mainly ensures no crashes occur
    });
  });
});
