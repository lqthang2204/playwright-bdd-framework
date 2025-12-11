Feature: Login functionality for tech one web

@T1
  Scenario: Open rwch one login opageagte
    Given I navigate to url ENV.URL_TECH
    # And I verify title this page is equal "Log On - CiA"
    And I change the page spec to loginT1
    And I wait for element userName to be EDITABLE
    And I wait for element password to be NOT_DISABLED
    And I type "ENV.USERNAME_TECH" into element userName
    And I type "ENV.PASSWORD_TECH" into element password
    And I wait for element logon-button to be VISIBLE
    And I wait for element logon-button to be NOT_HIDDEN
    And I wait for element logon-button to be ENABLED
    And I click element logon-button
    And I change the page spec to indexT1
    And I wait for element search-field to be EDITABLE
    And I type "Applications" into element search-field
    And I scroll to element Application-option
    And I wait for element Application-option to be VISIBLE
    And I click element Application-option
    And I change the page spec to ApplicationT1
    And I wait for element Add-Application-button to be ENABLED
    And I wait for element Add-Application-button to be VISIBLE
    And I wait for element page-spinner to be NOT_VISIBLE   
    And I click element Add-Application-button
    And I wait 100 seconds