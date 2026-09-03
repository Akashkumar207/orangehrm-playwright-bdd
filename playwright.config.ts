import { defineConfig, devices } from '@playwright/test';
import { frameworkConfig } from './config/framework.config';

/**
 * Detects whether the run is happening on a CI server. Unlike GitHub
 * Actions/CircleCI/Travis, Jenkins does NOT set CI=true on its own — the
 * Jenkinsfile declares it explicitly in its `environment` block. Local
 * runs get a visible browser and no retries for fast feedback; CI runs get
 * headless execution and automatic retries for flaky-network resilience.
 */
const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',

  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },

  fullyParallel: true,
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,

  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/playwright', open: 'never' }],
    ['allure-playwright', { resultsDir: 'reports/allure-results' }],
  ],

  use: {
    baseURL: frameworkConfig.baseURL,
    headless: isCI ? true : false,

    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',

    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },

  outputDir: 'test-results',

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    // //   use: { ...devices['Desktop Safari'] },
    // },
  ],
});
