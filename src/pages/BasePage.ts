import type { Locator, Page } from '@playwright/test';
import { Logger } from '../utils/Logger';

/**
 * Reusable browser/page operations shared by every Page Object.
 *
 * BasePage knows NOTHING about OrangeHRM — no OrangeHRM locators, no
 * OrangeHRM URLs, no business logic. It only wraps generic Playwright
 * actions that every page needs (click, fill, read text, wait, navigate).
 * Each concrete Page Object supplies its own locators and calls these
 * methods to act on them.
 */
export class BasePage {
  constructor(protected readonly page: Page) {}

  async navigate(path: string): Promise<void> {
    Logger.info(`Navigating to ${path}`);
    await this.page.goto(path);
  }

  async click(locator: Locator): Promise<void> {
    Logger.debug(`Clicking ${locator}`);
    await locator.click();
  }

  // Deliberately does NOT log `value` — fill() is also used for passwords,
  // and log output (console + logs/test-run.log) should never contain
  // credentials, demo or otherwise.
  async fill(locator: Locator, value: string): Promise<void> {
    Logger.debug(`Filling value into ${locator}`);
    await locator.fill(value);
  }

  async getText(locator: Locator): Promise<string> {
    Logger.debug(`Reading text from ${locator}`);
    return (await locator.textContent())?.trim() ?? '';
  }

  async isVisible(locator: Locator): Promise<boolean> {
    return locator.isVisible();
  }

  async waitForElement(locator: Locator): Promise<void> {
    Logger.debug(`Waiting for ${locator} to be visible`);
    await locator.waitFor({ state: 'visible' });
  }

  async waitForPageLoad(): Promise<void> {
    Logger.debug('Waiting for page load to complete');
    await this.page.waitForLoadState('networkidle');
  }

  async takeScreenshot(name: string): Promise<void> {
    Logger.info(`Screenshot saved: screenshots/${name}.png`);
    await this.page.screenshot({ path: `screenshots/${name}.png`, fullPage: true });
  }

  getCurrentUrl(): string {
    return this.page.url();
  }

  async getTitle(): Promise<string> {
    return this.page.title();
  }
}
