const pageFixture = require("../../../support/pageFixture.js");
const { chromium, firefox, webkit } = require("playwright");
const { remote } = require("webdriverio");
const path = require("path");
const fs = require("fs");
const { expect } = require("@playwright/test");
const manageYamlFile = require("../../../libs/ManageYamlFile.js");
const { type } = require("os");
class ManageStepsDefinitionsMobile {
    async resolveLocatorMobile(driver, locatorItem) {
        let element = locatorItem.locator;
        const locatorType = element.type.toUpperCase();
        switch(locatorType){
            case "ID":
                return driver.$(`id=${element.value}`);
            case "ACCESSIBILITY_ID":
                return driver.$(`~${element.value}`);
            case "XPATH":
                return driver.$(element.value);
            case "CLASS_NAME":
                return driver.$(`class=${element.value}`);
            case "NAME":
                return driver.$(`name=${element.value}`);
            case "CSS":
                return driver.$(element.value);
            case 'Predicate':
                return driver.$(`-ios predicate string:${element.value}`);
            case "Class Chain":
                return driver.$(`-ios class chain:${element.value}`);
            //android specific
            case "UIAUTOMATOR":
                return driver.$(`android=${element.value}`);
            default:
                throw new Error(`Unsupported locator type: ${locatorType}`);    
        }
    }
 async executeActions(action, element, value = null){
    try {
        const timestamp  = new Date().toString();
        switch(action.toUpperCase()){
            case "CLICK":
                await this.clickElement(element);
                break;
            case "DOUBLE_CLICK":
                await this.doubleClickElement(element);
                break;
            case "RIGHT_CLICK":
                await this.rightClickElement(element);
                break;
            case "HOVER":
                await this.hoverElement(element);
                break;
            case "FILL":
                if(value === null) throw new Error("Value must be provided for FILL action");
                await this.fillElement(element, value);
                break;
            case "CLEAR":
                await this.clearElement(element);
                break;
            case "SELECT":
                if(value === null) throw new Error("Value must be provided for SELECT action");
                await this.selectElement(element, value);
                break;
            case "CHECK":
                await this.checkElement(element);
                break;
            case "UNCHECK":
                await this.uncheckElement(element);
                break;
            case "UPLOAD":
                if(value === null) throw new Error("File path must be provided for UPLOAD action");
                await this.uploadFile(element, value);
                break;
            case "SWIPE":
                if(value === null) throw new Error("Direction must be provided for SWIPE action");
                await this.swipeElement(element, value);
                break;
            case "LONG_PRESS":
                await this.longPressElement(element);
                break;
            case "GET_TEXT":
                return await this.getTextElement(element);
            case "IS_DISPLAYED":
                return await this.isDisplayedElement(element);
            case "IS_ENABLED":
                return await this.isEnabledElement(element);
            case "IS_SELECTED":
                return await this.isSelectedElement(element);
            case "TAKE_SCREENSHOT":
                await this.takeScreenshot(element, `screenshot_${timestamp}.png`);
                break;
            default:
                throw new Error(`Unsupported action: ${action}`);   
        }
    } catch (error) {
        console.error(`Error executing action "${action}": ${error.message}`);
        throw error;
    }
 }
 async clickElement(element){
    try {
        await element.click();
    } catch (error) {
        console.error(`Error clicking element: ${error.message}`);
        throw error;
        
    }
    
 }

}
module.exports = new ManageStepsDefinitionsMobile();