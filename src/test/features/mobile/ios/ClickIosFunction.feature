Feature: Login functionality ios


  @click_function_ios
  Scenario: Successful login with valid credentials ios
    Given I open application with config below
      | capabilitiesFile | ios_demo_saucelab |
            | appiumServerUrl  | http://127.0.0.1:4723/               |
      And I change the page spec to LoginSauceLabs
       And I click element username
        And I type "ENV.USERNAME" into element username
     And I type "ENV.PASSWORD" into element password
     And I wait for element login-button to be ENABLED
     And I clear element username
      And I click element login-button