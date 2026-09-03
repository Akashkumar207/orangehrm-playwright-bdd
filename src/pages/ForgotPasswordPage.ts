import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Represents the "Reset Password" page OrangeHRM navigates to after
 * clicking "Forgot your password?" on the login page.
 */
export class ForgotPasswordPage extends BasePage {
  readonly pageHeading: Locator;
  readonly usernameInput: Locator;
  readonly resetPasswordButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    
    super(page);
    this.pageHeading = page.getByRole('heading', { name: 'Reset Password' });
    this.usernameInput = page.getByPlaceholder('Username');
    this.resetPasswordButton = page.getByRole('button', { name: 'Reset Password' });
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
  }

  async isDisplayed(): Promise<boolean> {
    return this.isVisible(this.pageHeading);
  }

  async clickCancel(): Promise<void> {
    await this.click(this.cancelButton);
  }
}
