const ManageMode = require("./ManageMode.js");
const WebSteps = require("../step-definitions/WebSteps.js");
const MobileSteps = require("../step-definitions/MobileSteps.js");

class StepFactory {
  /**
   * Retrieves the current execution context and instantiates the appropriate Step class (WebSteps or MobileSteps).
   * @param {Object} world - Cucumber CustomWorld instance (containing page or driver)
   * @returns {{ context: Object, steps: WebSteps | MobileSteps }}
   */
  static getContextAndSteps(world) {
    const context = ManageMode.getExecutionContext();
    let steps;
    if (context.mode === "DESKTOP") {
      steps = new WebSteps(world.page);
    } else if (context.mode === "MOBILE") {
      steps = new MobileSteps(world.driver);
    } else {
      throw new Error(`Unsupported mode: ${context.mode}`);
    }
    return { context, steps };
  }
}

module.exports = StepFactory;