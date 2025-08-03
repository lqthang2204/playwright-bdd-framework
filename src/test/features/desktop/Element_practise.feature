Feature: Test all feature of KodeIT

  @element @smoke @element_KodeIT
  Scenario: Open and login to KodeIT
    Given I navigate to url KodeIT
    And I verify title this page is equal "Practice Page"
    And I change the page spec to signin_kode_page
    # And I click element Sign-in-button
    And I click element rdb_bmw_2
    And I click element typing-text-field
    And I click element chk-honda-group
    And I click element chk-honda
    And I click element Sign-in-button-2
    And I verify title this page is equal "Login"


      @element @smoke @element_playwright
  Scenario: Open and login to KodeIT
    Given I navigate to url playwright
    And I verify title this page is equal "Fast and reliable end-to-end testing for modern web apps | Playwright"
    And I change the page spec to index_playwright
    # And I click element Sign-in-button
    And I click element start_link
    And I click element npm_header_link
    And I click element Page_Object_Model_section_link

# And I verify title this page is "Login"

#   await page.locator('#radio-btn-example').getByText('BMW').click();
# await page.locator('#benzradio').check();
# await page.locator('#hondaradio').check();
# await page.locator('#bmwcheck').check();
# await page.locator('#benzcheck').check();
# await page.locator('#checkbox-example-div').getByText('Honda').click();
# await page.locator('#hondacheck').check();
# await page.locator('#carselect').selectOption('benz');
# await page.locator('#multiple-select-example').selectOption('orange');
# await page.getByRole('textbox', { name: 'Start Typing...' }).click();
# await page.getByRole('textbox', { name: 'Start Typing...' }).fill('test');


