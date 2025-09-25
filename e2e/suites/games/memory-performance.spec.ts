/**
 * Games Demo Memory Performance E2E Tests
 *
 * Performance-focused tests for memory usage and leak detection.
 *
 * @author 🦊 The Cunning Fox
 */

import { test, expect, Page } from "@playwright/test";
import { getMemoryUsage, assertMemoryIncrease, performMemoryStressTest } from "./memory-test-utils";

const GAMES_DEMO_URL = "http://localhost:3002";

test.describe("Games Demo Memory Performance", () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test.afterEach(async () => {
    await page.close();
  });

  test("should not have memory leaks in main menu", async () => {
    await testMainMenuMemoryLeaks(page);
  });

  test("should handle game initialization memory efficiently", async () => {
    await testGameInitializationMemory(page);
  });

  test("should handle game interactions without memory leaks", async () => {
    await testGameInteractionMemory(page);
  });
});

async function testMainMenuMemoryLeaks(page: Page): Promise<void> {
  await page.goto(GAMES_DEMO_URL, { waitUntil: "networkidle" });

  const initialMemory = await getMemoryUsage(page);
  if (!initialMemory) {
    test.skip();
    return;
  }

  await performMenuInteractions(page);

  const finalMemory = await getMemoryUsage(page);
  if (finalMemory) {
    assertMemoryIncrease(initialMemory, finalMemory, 10);
  }
}

async function testGameInitializationMemory(page: Page): Promise<void> {
  await page.goto(`${GAMES_DEMO_URL}/#roguelike`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);

  const initialMemory = await getMemoryUsage(page);
  if (!initialMemory) {
    test.skip();
    return;
  }

  const gameElement = page.locator(".main-game, canvas, [data-testid='roguelike-game']");
  await expect(gameElement).toBeVisible();

  const finalMemory = await getMemoryUsage(page);
  if (finalMemory) {
    assertMemoryIncrease(initialMemory, finalMemory, 15);
  }
}

async function testGameInteractionMemory(page: Page): Promise<void> {
  await page.goto(`${GAMES_DEMO_URL}/#roguelike`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);

  const gameElement = page.locator(".main-game, canvas, [data-testid='roguelike-game']");
  await expect(gameElement).toBeVisible();

  const initialMemory = await getMemoryUsage(page);
  if (!initialMemory) {
    test.skip();
    return;
  }

  await performGameInteractions(page);

  const finalMemory = await getMemoryUsage(page);
  if (finalMemory) {
    assertMemoryIncrease(initialMemory, finalMemory, 20);
  }
}

async function performMenuInteractions(page: Page): Promise<void> {
  await performMemoryStressTest(
    page,
    async () => {
      await page.locator(".game-card").first().hover();
      await page.waitForTimeout(100);
      await page.locator(".game-card").nth(1).hover();
    },
    10
  );
}

async function performGameInteractions(page: Page): Promise<void> {
  const gameElement = page.locator(".main-game, canvas, [data-testid='roguelike-game']");

  await performMemoryStressTest(
    page,
    async () => {
      await gameElement.click({
        position: {
          x: 100 + Math.random() * 200,
          y: 100 + Math.random() * 200,
        },
      });
    },
    20
  );
}
