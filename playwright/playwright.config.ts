import type { PlaywrightTestConfig } from "@playwright/test";
import { devices } from "@playwright/test";

/** Read environment variables from file. https://github.com/motdotla/dotenv */
// require('dotenv').config();

/** See https://playwright.dev/docs/test-configuration. */
const config: PlaywrightTestConfig = {
  testDir: "./tests",
  /* Maximum time one test can run for. */
  timeout: 60_000,
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met. For
     * example in `await expect(locator).toHaveText();`
     */
    timeout: 20_000,
    toHaveScreenshot: {
      maxDiffPixelRatio: 0,
    },
  },
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html",
  // globalSetup: require.resolve('./global-setup.ts'),
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
    actionTimeout: 0,
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.APP_SM_PORT
      ? `http://localhost:${process.env.APP_SM_PORT}`
      : "http://localhost:9999",
    /* Save localStorage */
    // storageState: './storageState.json',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on",
    video: "off",
    screenshot: "on",
    testIdAttribute: "data-cy",
  },

  webServer: [
    {
      cwd: "..",
      command: "yarn dev",
      url: `http://localhost:3000/`,
      reuseExistingServer: !process.env.CI,
    },
    {
      cwd: "../e2e-projects/next",
      command: "yarn slicemachine:dev",
      url: `http://localhost:9999`,
      reuseExistingServer: !process.env.CI,
    },
  ],
  /* Configure projects for major browsers */
  projects: [
    // {
    //   name: "Smoke Chromium",
    //   testDir: "./tests/smoke",
    //   use: {
    //     ...devices["Desktop Chrome"],
    //   },
    // },
    {
      name: "chromium",
      testIgnore: "./tests/smoke/**",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
    // {
    //   name: "webkit",
    //   testIgnore: "./tests/smoke/**",
    //   use: {
    //     ...devices["Desktop Safari"],
    //   },
    // },
  ],

  /* Folder for test artifacts such as screenshots, videos, traces, etc. */
  // outputDir: 'test-results/',

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   port: 3000,
  // },
};

export default config;
