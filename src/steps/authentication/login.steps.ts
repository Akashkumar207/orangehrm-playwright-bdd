import { expect, type Page } from '@playwright/test';
import { Given, When, Then } from '../../bdd/StepRegistry';
import type { LoginPage } from '../../pages/LoginPage';
import type { DashboardPage } from '../../pages/DashboardPage';
import type { ForgotPasswordPage } from '../../pages/ForgotPasswordPage';
import { frameworkConfig } from '../../../config/framework.config';
import users from '../../data/users.json';

/**
 * The "world" every step receives: Playwright's `page` plus the page-object
 * fixtures defined in `src/fixtures/test.fixture.ts`. Fixtures are already
 * constructed by the time a step runs — steps just destructure the ones
 * they need, they never call `new LoginPage(...)` themselves.
 */
interface World {
  page: Page;
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  forgotPasswordPage: ForgotPasswordPage;
}

Given<World>('I am on the OrangeHRM login page', async ({ loginPage }) => {
  await loginPage.open();
});

When<World, [string, string]>('I login with username {string} and password {string}', async ({ loginPage }, username, password) => {
  await loginPage.login(username, password);
});

When<World>('I login with valid credentials', async ({ loginPage }) => {
  await loginPage.login(frameworkConfig.adminUsername, frameworkConfig.adminPassword);
});

When<World>('I logout', async ({ dashboardPage }) => {
  await dashboardPage.logout();
});

When<World>('I click the forgot password link', async ({ loginPage }) => {
  await loginPage.clickForgotPassword();
});

Then<World>('I should be successfully logged in', async ({ dashboardPage }) => {
  await expect(dashboardPage.pageHeading).toBeVisible();
});

Then<World>('I should see the OrangeHRM dashboard', async ({ page, dashboardPage }) => {
  await expect(page).toHaveURL(/dashboard\/index/);
  await expect(dashboardPage.header.userDropdownTrigger).toContainText(users.adminUser.displayName);
});

Then<World>('I should be redirected to the login page', async ({ page, loginPage }) => {
  await expect(page).toHaveURL(/auth\/login/);
  await expect(loginPage.loginButton).toBeVisible();
});

Then<World>('I should see an invalid credentials error', async ({ loginPage }) => {
  await expect(loginPage.invalidCredentialsAlert).toBeVisible();
  await expect(loginPage.invalidCredentialsAlert).toContainText('Invalid credentials');
});

Then<World>('I should see required field validation messages', async ({ loginPage }) => {
  await expect(loginPage.requiredFieldMessages.first()).toBeVisible();
});

Then<World>('I should see the reset password page', async ({ forgotPasswordPage }) => {
  await expect(forgotPasswordPage.pageHeading).toBeVisible();
});
