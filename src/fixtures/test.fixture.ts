import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { PIMPage } from '../pages/PIMPage';
import { AddEmployeePage } from '../pages/AddEmployeePage';
import { ScreenshotUtils } from '../utils/ScreenshotUtils';
import { Logger } from '../utils/Logger';

/**
 * One fixture per Page Object. Playwright instantiates a fixture only the
 * first time a test callback actually destructures it, and disposes of it
 * automatically after the test — so step definitions just ask for the page
 * object they need (`{ loginPage }`) instead of constructing it themselves.
 */
interface PageFixtures {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  forgotPasswordPage: ForgotPasswordPage;
  pimPage: PIMPage;
  addEmployeePage: AddEmployeePage;
}

/**
 * The framework's `test`, extended with page-object fixtures. Every spec
 * file and BDDRunner call should import `test` from here, never straight
 * from `@playwright/test` — that base `test` only knows about `page`.
 */
export const test = base.extend<PageFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },

  forgotPasswordPage: async ({ page }, use) => {
    await use(new ForgotPasswordPage(page));
  },

  pimPage: async ({ page }, use) => {
    await use(new PIMPage(page));
  },

  addEmployeePage: async ({ page }, use) => {
    await use(new AddEmployeePage(page));
  },

  // Overrides the built-in `page` fixture purely to add failure evidence
  // capture around it — every step still receives the same `page`. On
  // failure this attaches a meaningfully-named screenshot and the current
  // URL to the test's report entry (HTML + Allure both pick up `attach`).
  page: async ({ page }, use, testInfo) => {
    await use(page);

    if (testInfo.status !== testInfo.expectedStatus) {
      const screenshotPath = await ScreenshotUtils.captureFailure(page, testInfo.title);
      await testInfo.attach('failure-screenshot', { path: screenshotPath, contentType: 'image/png' });
      await testInfo.attach('failure-url', { body: page.url(), contentType: 'text/plain' });

      Logger.error(
        `Test failed: "${testInfo.title}" at ${page.url()} — ${testInfo.error?.message ?? 'unknown error'}`,
      );
    }
  },
});

export { expect } from '@playwright/test';
