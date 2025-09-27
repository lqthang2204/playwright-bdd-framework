Feature: Login functionality ios


  @click_function_ios
  Scenario: Successful login with valid credentials ios
    Given I open application with config below
      | capabilitiesFile | ios_demo_saucelab |
      And I change the page spec to LoginSauceLabs
      And I click element login-button