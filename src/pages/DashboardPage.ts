import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { Header } from '../components/Header';

/**
 * Represents the OrangeHRM Dashboard page — the page shown immediately
 * after a successful login.
 */
export class DashboardPage extends BasePage {
  readonly pageHeading: Locator;
  readonly header: Header;

  constructor(page: Page) {
    super(page);
    this.pageHeading = page.getByRole('heading', { name: 'Dashboard' });
    this.header = new Header(page);
  }

  async isDashboardDisplayed(): Promise<boolean> {
    return this.isVisible(this.pageHeading);
  }

  async logout(): Promise<void> {
    await this.header.logout();
  }
}
