Feature: Login functionality for tech one web

@T1
  Scenario: Open rwch one login opageagte
    Given I navigate to url ENV.URL_TECH
    # And I verify title this page is equal "Log On - CiA"
    And I change the page spec to loginT1
    And I type "ENV.USERNAME_TECH" into element userName
    And I type "ENV.PASSWORD_TECH" into element password
    And I wait for element logon-button to be ENABLED
    And I click element logon-button
    And I wait 100 seconds