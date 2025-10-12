Feature: Login functionality for tech one web

@T1
  Scenario: Open rwch one login opageagte
    Given I navigate to url tech1
    And I verify title this page is equal "Log On - CiA"
    And I change the page spec to LoginT1
    And I type "test" into element userName
    And I wait 10000 seconds