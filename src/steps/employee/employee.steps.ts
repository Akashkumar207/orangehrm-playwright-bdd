import { expect } from '@playwright/test';
import { Given, When, Then } from '../../bdd/StepRegistry';
import type { LoginPage } from '../../pages/LoginPage';
import type { PIMPage } from '../../pages/PIMPage';
import type { AddEmployeePage } from '../../pages/AddEmployeePage';
import { frameworkConfig } from '../../../config/framework.config';

interface EmployeeContext {
  employeeId?: string;
}

interface World {
  loginPage: LoginPage;
  pimPage: PIMPage;
  addEmployeePage: AddEmployeePage;
  context: EmployeeContext;
}

Given<World>('I am logged in and on the PIM employee list page', async ({ loginPage, pimPage }) => {
  await loginPage.open();
  await loginPage.login(frameworkConfig.adminUsername, frameworkConfig.adminPassword);
  await pimPage.open();
});

When<World, [string, string]>(
  'I add a new employee with first name {string} and last name {string}',
  async ({ pimPage, addEmployeePage, context }, firstName, lastName) => {
    await pimPage.clickAdd();
    context.employeeId = await addEmployeePage.addEmployee(firstName, lastName);
  },
);

When<World>('I search for that employee by their Employee Id', async ({ pimPage, context }) => {
  if (!context.employeeId) {
    throw new Error('No employee has been added yet in this scenario — expected an Employee Id in context.');
  }
  await pimPage.open();
  await pimPage.searchByEmployeeId(context.employeeId);
});

Then<World>('the employee should appear in the search results', async ({ pimPage, context }) => {
  if (!context.employeeId) {
    throw new Error('No employee has been added yet in this scenario — expected an Employee Id in context.');
  }
  await expect(pimPage.getEmployeeRow(context.employeeId)).toBeVisible();
});
