Feature: Login functionality ios


  @click_function_ios
  Scenario: Successful login with valid credentials ios
    Given I open application with config below
      | capabilitiesFile | ios_demo_saucelab |
            | appiumServerUrl  | http://127.0.0.1:4723/               |
      And I change the page spec to LoginSauceLabs
       And I click element username
        And I type "standard_user" into element username
     And I type "secret_sauce" into element password
     And I wait for element login-button to be NOT_ENABLED
      And I click element login-button