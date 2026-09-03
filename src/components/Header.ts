import type { Locator, Page } from '@playwright/test';

/**
 * The user-menu header bar that appears at the top of every authenticated
 * OrangeHRM page (Dashboard, PIM, Admin, ...). This used to live directly
 * inside DashboardPage (Phase 6), which was fine while Dashboard was the
 * only authenticated page in the framework. Now that PIMPage also needs
 * the same dropdown and Logout action, duplicating those locators there
 * would violate "no duplicate locators" — so they live here once instead.
 *
 * A Page Object embeds this the same way it embeds any other dependency:
 * `this.header = new Header(page);` in its constructor.
 */
export class Header {
  readonly userDropdownTrigger: Locator;
  readonly logoutMenuItem: Locator;

  constructor(private readonly page: Page) {
    this.userDropdownTrigger = page.locator('.oxd-userdropdown-tab');
    this.logoutMenuItem = page.getByRole('menuitem', { name: 'Logout' });
  }

  async logout(): Promise<void> {
    await this.userDropdownTrigger.click();
    await this.logoutMenuItem.click();
    await this.page.waitForURL('**/auth/login');
  }
}
