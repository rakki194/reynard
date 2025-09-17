import { test, expect, Page } from "@playwright/test";
import { createTestPage } from "../../modules/dom";

test.describe("Chat Message E2E Tests", () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await createTestPage(page, { path: "/e2e/fixtures/dom-test-page.html" });
  });

  test.afterEach(async () => {
    await page.close();
  });

  test("should render chat message with text", async () => {
    await page.setContent(`
      <div id="chat-container"></div>
      <script type="module">
        import { render } from "solid-js/web";
        import { ChatMessage } from "/packages/chat/src/components/ChatMessage.tsx";

        const message = {
          id: "1",
          text: "Hello, how are you?",
          sender: "user",
          timestamp: new Date().toISOString()
        };

        render(() => (
          <ChatMessage message={message} />
        ), document.getElementById("chat-container"));
      </script>
    `);

    await expect(page.locator("#chat-container")).toBeVisible();
    await expect(page.locator("#chat-container")).toContainText("Hello, how are you?");
  });

  test("should render chat message with different sender types", async () => {
    await page.setContent(`
      <div id="chat-container"></div>
      <script type="module">
        import { render } from "solid-js/web";
        import { ChatMessage } from "/packages/chat/src/components/ChatMessage.tsx";

        const userMessage = {
          id: "1",
          text: "User message",
          sender: "user",
          timestamp: new Date().toISOString()
        };

        const botMessage = {
          id: "2", 
          text: "Bot response",
          sender: "bot",
          timestamp: new Date().toISOString()
        };

        render(() => (
          <div>
            <ChatMessage message={userMessage} />
            <ChatMessage message={botMessage} />
          </div>
        ), document.getElementById("chat-container"));
      </script>
    `);

    await expect(page.locator("#chat-container")).toBeVisible();
    await expect(page.locator("#chat-container")).toContainText("User message");
    await expect(page.locator("#chat-container")).toContainText("Bot response");
  });
});
