Feature: Login functionality android

  # @mobileAndroid @smoke
  # Scenario: Successful login with valid credentials android 1
  #   Given I open application with config below
  #     | capabilitiesFile | capabilities_android   |
  #     | appiumServerUrl  | http://127.0.0.1:4723/ |


  # @mobileAndroid @smoke
  # Scenario: Successful login with valid credentials android 2
  #   Given I open application with config below
  #     | capabilitiesFile | capabilities_android |
  #     | deviceName       | emulator-5554        |

  # @mobileAndroid @smok
  # Scenario: Successful login with valid credentials android
  #   Given I open application with config below
  #     | capabilitiesFile | capabilities_android   |
  #     | appiumServerUrl  | http://127.0.0.1:4724/ |
  #     | deviceName       | emulator-5556          |
# appium -p 4724 --default-capabilities '{"appium:udid":"emulator-5556"}'

  @mobileAndroid @chrome`
  Scenario: Successful login with valid credentials android 1
    Given I open application with config below
      | capabilitiesFile | android_chrome   |

  @demo_saucelab_android
  Scenario: Successful login with valid credentials android 1
    Given I open application with config below
      | capabilitiesFile | android_saucelab   |
            And I change the page spec to LoginSauceLabs
       And I click element username
        And I type "standard_user" into element username
     And I type "secret_sauce" into element password
      And I click element login-button