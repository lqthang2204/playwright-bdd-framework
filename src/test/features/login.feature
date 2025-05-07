Feature: Login functionality 1

@smoke
  Scenario: Open login page 1
    Given I navigate to url index
    And I verify title this page is "Fast and reliable end-to-end testing for modern web apps | Playwright"
    


@smoke
  Scenario: Open login page 2
    Given I navigate to url https://playwright.dev/
    And I verify title this page is "Fast and reliable end-to-end testingdsds for modern web apps | Playwright"

@smoke @regression
  Scenario: Open login page 3
    Given I navigate to url "https://playwright.dev/"
    And I verify title this page is "Fast and reliable end-to-end testing for dsmodern web apps | Playwright"    