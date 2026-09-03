Feature: OrangeHRM Login

  As an OrangeHRM user
  I want to log in with my credentials
  So that I can access my HR dashboard

  Background:
    Given I am on the OrangeHRM login page

  @smoke @sanity @authentication
  Scenario: Successful login with valid credentials
    When I login with valid credentials
    Then I should be successfully logged in
    And I should see the OrangeHRM dashboard

  @smoke @authentication
  Scenario: Logout returns the user to the login page
    When I login with valid credentials
    And I logout
    Then I should be redirected to the login page

  @negative @authentication
  Scenario: Login fails with an invalid username
    When I login with username "InvalidUser" and password "admin123"
    Then I should see an invalid credentials error

  @negative @authentication
  Scenario: Login fails with an invalid password
    When I login with username "Admin" and password "wrongpassword"
    Then I should see an invalid credentials error

  @negative @authentication
  Scenario: Login fails with an invalid username and password
    When I login with username "InvalidUser" and password "wrongpassword"
    Then I should see an invalid credentials error

  @negative @authentication
  Scenario: Login fails with an empty username
    When I login with username "" and password "admin123"
    Then I should see required field validation messages

  @negative @authentication
  Scenario: Login fails with an empty password
    When I login with username "Admin" and password ""
    Then I should see required field validation messages

  @regression @authentication
  Scenario: Forgot password link navigates to the reset password page
    When I click the forgot password link
    Then I should see the reset password page
