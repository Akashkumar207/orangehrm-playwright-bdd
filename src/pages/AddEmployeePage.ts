import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Represents the "Add Employee" form, reached from PIMPage's Add button.
 *
 * OrangeHRM assigns the new Employee Id automatically (an incrementing
 * number shown in a read-only field) — the caller doesn't choose it, so
 * `addEmployee()` returns whatever the app generated, for the test to use
 * afterwards (e.g. to search for this exact employee). This is data the
 * action produces, not a business assertion, so returning it here — rather
 * than asserting on it — keeps this class assertion-free like every other
 * Page Object in the framework.
 */
export class AddEmployeePage extends BasePage {
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly employeeIdInput: Locator;
  readonly saveButton: Locator;

  constructor(page: Page) {
    super(page);
    this.firstNameInput = page.getByPlaceholder('First Name');
    this.lastNameInput = page.getByPlaceholder('Last Name');
    this.employeeIdInput = page.locator('.oxd-input-group', { hasText: 'Employee Id' }).first().locator('input');
    this.saveButton = page.getByRole('button', { name: 'Save' });
  }

  async enterFirstName(firstName: string): Promise<void> {
    await this.fill(this.firstNameInput, firstName);
  }

  async enterLastName(lastName: string): Promise<void> {
    await this.fill(this.lastNameInput, lastName);
  }

  async getGeneratedEmployeeId(): Promise<string> {
    return this.employeeIdInput.inputValue();
  }

  async clickSave(): Promise<void> {
    await this.click(this.saveButton);
    await this.page.waitForURL('**/pim/viewPersonalDetails/**');
  }

  /** Fills the form, saves, and returns the app-generated Employee Id. */
  async addEmployee(firstName: string, lastName: string): Promise<string> {
    await this.enterFirstName(firstName);
    await this.enterLastName(lastName);
    const employeeId = await this.getGeneratedEmployeeId();
    await this.clickSave();
    return employeeId;
  }
}
