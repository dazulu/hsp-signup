import { defineConfig } from "@playwright/test";

/**
 * See https://playwright.dev/docs/test-configuration.
 */

export default defineConfig({
  testDir: "./tests",
  timeout: 30000,
  reporter: "html",
  use: {
    headless: true,
    screenshot: "only-on-failure",
    trace: "on-first-retry",
    viewport: { width: 1280, height: 720 },
  },
});
