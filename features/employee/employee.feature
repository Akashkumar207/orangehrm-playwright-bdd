Feature: Employee Management

  As an HR admin
  I want to add new employees and find them again
  So that the organization's employee records stay accurate and searchable

  Background:
    Given I am logged in and on the PIM employee list page

  @smoke @employee
  Scenario: A newly added employee can be found by their Employee Id
    When I add a new employee with first name "QA" and last name "AutoTest"
    And I search for that employee by their Employee Id
    Then the employee should appear in the search results
