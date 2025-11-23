// ...existing code...
const pageFixture = require("../../../support/pageFixture.js");
const chalk = require("chalk");
class ManageMode {
  // cached execution context for one-time read
  static _executionContext = null;

  /**
   * Read mode/device once and cache the result.
   * Returns an object: { config, mode: 'DESKTOP'|'MOBILE', device }
   */
  static getExecutionContext() {
    if (this._executionContext) return this._executionContext;

    const config = pageFixture.getConfig() || {};
    const rawMode = (config.mode || "desktop").toString().toUpperCase();
    const mode = rawMode === "MOBILE" ? "MOBILE" : "DESKTOP";

    let device = "DESKTOP";
    if (mode === "MOBILE") {
      if (!config.mobile || !config.mobile.device) {
        throw new Error("Mobile device configuration is missing in config.");
      }
      device = String(config.mobile.device).toUpperCase();
      console.log(chalk.blue(`[INFO] Running in mobile mode. Device: ${device}`))
    } else {
    console.log(chalk.blue(`[INFO] Running in desktop mode.`))
    }
    this._executionContext = { config, mode, device };
    return this._executionContext;
  }

  /**
   * Reset cached context (call in hooks if you need to re-read config per scenario)
   */
  static resetExecutionContext() {
    this._executionContext = null;
  }
}

module.exports = ManageMode;
// ...existing code...