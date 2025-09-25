/**
 * Shared test utilities for Rogue-like game E2E tests
 *
 * @author 🦊 The Cunning Fox
 */

import { Page, Browser } from "@playwright/test";

export const GAMES_DEMO_URL = "http://localhost:3002";

export const setupPage = async (browser: Browser): Promise<Page> => {
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 720 });

  // Navigate to rogue-like game
  await page.goto(`${GAMES_DEMO_URL}/#roguelike`, {
    waitUntil: "networkidle",
    timeout: 30000,
  });

  return page;
};

export const cleanupPage = async (page: Page) => {
  await page.close();
};

export const getGameElement = (page: Page) => {
  return page.locator(".main-game, canvas, [data-testid='roguelike-game']");
};
