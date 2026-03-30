Feature: Login web safari


@Test_login_web_safari
  Scenario: Successful login with valid credentials ios
    Given I open application with config below
      | capabilitiesFile | safari |             
     And I navigate to url ENV.URL_TECH
     And I wait 100 seconds