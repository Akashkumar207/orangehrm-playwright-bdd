import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

const LOGIN_PATH = '/web/index.php/auth/login';

/**
 * Represents the OrangeHRM login page.
 *
 * Responsibilities: locate and interact with the login form only.
 * It does NOT assert anything (e.g. "login should succeed") — it exposes
 * locators and state getters (`getErrorMessage`, `isLoginPageDisplayed`),
 * and the step definition decides what to assert with Playwright's
 * `expect()`. This keeps business "should" statements in the BDD layer,
 * where a reader expects to find them, and keeps this class reusable for
 * both positive and negative scenarios.
 */
export class LoginPage extends BasePage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly forgotPasswordLink: Locator;
  readonly invalidCredentialsAlert: Locator;
  readonly requiredFieldMessages: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.getByPlaceholder('Username');
    this.passwordInput = page.getByPlaceholder('Password');
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.forgotPasswordLink = page.getByText('Forgot your password?');
    this.invalidCredentialsAlert = page.getByRole('alert');
    this.requiredFieldMessages = page.getByText('Required', { exact: true });
  }

  async open(): Promise<void> {
    await this.navigate(LOGIN_PATH);
  }

  async enterUsername(username: string): Promise<void> {
    await this.fill(this.usernameInput, username);
  }

  async enterPassword(password: string): Promise<void> {
    await this.fill(this.passwordInput, password);
  }

  async clickLogin(): Promise<void> {
    await this.click(this.loginButton);
  }

  async login(username: string, password: string): Promise<void> {
    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.clickLogin();
  }

  async clickForgotPassword(): Promise<void> {
    await this.click(this.forgotPasswordLink);
  }

  async isLoginPageDisplayed(): Promise<boolean> {
    return this.isVisible(this.loginButton);
  }

  async getErrorMessage(): Promise<string> {
    return this.getText(this.invalidCredentialsAlert);
  }
}
