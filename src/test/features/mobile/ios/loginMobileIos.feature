Feature: Login functionality ios


  @mobile_ios
  Scenario: Successful login with valid credentials ios
    Given I open application with config below
      | capabilitiesFile | ios_demo_saucelab |

  @mobile_ios
  Scenario: Successful login with valid credentials on iOS (custom device)
    Given I open application with config below
      | capabilitiesFile | ios_demo_saucelab                    |
      | deviceName       | iPhone 15 Pro Max                    |
      | udid             | 11C0D149-63DF-4D58-A866-E876A0521BE3 |
      | appiumServerUrl  | http://127.0.0.1:4724/               |

  @mobile_ios
  Scenario: Successful login with valid credentials on iOS (custom device)
    Given I open application with config below
      | deviceName      |iPhone 16 Pro Max |
      | appiumServerUrl | http://127.0.0.1:4725/ |  
      | platformName    | iOS |
      | bundleId        | com.saucelabs.SwagLabsMobileApp |
      | udid            | 02837323-82FD-44B1-AD01-C0626B936D53 |
      | platformVersion | 16.6 |
      | automationName  | XCUITest |
      | app             | https://github.com/saucelabs/sample-app-mobile/releases/download/2.7.1/iOS.Simulator.SauceLabs.Mobile.Sample.app.2.7.1.zip |