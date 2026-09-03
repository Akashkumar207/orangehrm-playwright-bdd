import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { Header } from '../components/Header';

const PIM_PATH = '/web/index.php/pim/viewEmployeeList';

/**
 * Represents the PIM module's Employee List page — the employee search
 * grid reached from the sidebar's "PIM" link.
 *
 * Search is done by Employee Id rather than the Employee Name field on
 * purpose: Employee Name is an autocomplete widget with a debounced,
 * timing-sensitive suggestion list, while Employee Id is a plain text
 * input matched exactly — deterministic and far less prone to flaking in
 * an automated test than driving a typeahead.
 */
export class PIMPage extends BasePage {
  readonly header: Header;
  readonly addButton: Locator;
  readonly employeeIdSearchInput: Locator;
  readonly searchButton: Locator;

  constructor(page: Page) {
    super(page);
    this.header = new Header(page);
    this.addButton = page.getByRole('button', { name: 'Add' });
    this.employeeIdSearchInput = page.locator('.oxd-input-group', { hasText: 'Employee Id' }).first().locator('input');
    this.searchButton = page.getByRole('button', { name: 'Search' });
  }

  async open(): Promise<void> {
    await this.navigate(PIM_PATH);
  }

  async clickAdd(): Promise<void> {
    await this.click(this.addButton);
  }

  async searchByEmployeeId(employeeId: string): Promise<void> {
    await this.fill(this.employeeIdSearchInput, employeeId);
    await this.click(this.searchButton);
    await this.waitForPageLoad();
  }

  /** The grid row for a given Employee Id, for the caller to assert on. */
  getEmployeeRow(employeeId: string): Locator {
    return this.page.getByRole('row', { name: employeeId });
  }
}
