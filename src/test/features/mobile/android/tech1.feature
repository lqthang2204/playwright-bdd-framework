Feature: Login functionality android 2dsdsw


  @mobileAndroid2
  Scenario: Navigate to url and click login
    Given I open application with config below
      | capabilitiesFile | android_chrome   |
      And I change the page spec to loginT1
      And I click element use-without-account-button
      And I click element no-thanks-button
      And I navigate to url tech1
      And I click element logon_button
      And I wait 10000 seconds