/**
 * A shared object to manage the browser, context, page, and configuration during tests.
 */
class PageFixture {
    constructor(){
        this.page = undefined;
        this.context = undefined;   
        this.browser = undefined;
        this.config = undefined
    }
    /**
     * set the page instance.
     * @param {import('playwright').Page} page - The Playwright page instance.  
     * 
     */
    setPage(page){
        this.page = page;
    }
    /**
     * get the current page instance.
     * @returns {import('playwright').Page | undefined}  - The current Playwright page instance.
     */
    getPage(){
        return this.page;
    }
    /**
     * set the bropwser instance     
     * @param {import('playwright').Browser} browser - The Playwright browser instance.
     */
    setBrowser(browser){
        this.browser = browser;
    }
    /**
     * get the current browser instance
     * @returns {import('playwright').Browser | undefined} - The current Playwright browser instance.
     */
    getBrowser(){
        return this.browser
    }
    /**
     * set the browser context instance
     * @param {import('playwright').BrowserContext} context - The Playwright browser context instance.
     */
    setContext(context){
        this.context = context;
    }
    /**
     * get the current browser context instance
     * @returns {import('playtwright').BrowserContext | undefined} - The current Playwright browser context instance.
     */
    getContext(){
        return this.context;
    }
    /**
     * set the configuration object
     * @param {object} config - The configuration object.
     */
    setConfig(config){
        this.config = config
    }
    /**
     * get the current configuration object
     * @returns {object | undefined} - The current configuration object.
     */
    getConfig(){
        return this.config;
    }
    reset(){
        this.page = undefined;
        this.context = undefined;   
        this.browser = undefined;
        this.config = undefined;
    }
}
module.exports = new PageFixture();