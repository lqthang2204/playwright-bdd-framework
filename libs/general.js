const path = require("path");
const fs = require("fs");
const yaml = require("js-yaml");
require("dotenv").config();

/**
 * Checks whether a specific file exists on the filesystem.
 * @param {string} fileName - Base name of the file.
 * @param {string} relativeTo - Relative directory path from __dirname.
 * @param {string} suffix - File extension (default: '.json').
 * @returns {Promise<boolean>} True if file exists, false otherwise.
 */
async function checkFileExists(fileName, relativeTo, suffix = ".json") {
  try {
    const file = path.resolve(__dirname, `${relativeTo}${fileName}${suffix}`);
    return fs.existsSync(file);
  } catch (error) {
    throw new Error(`Error checking file existence: ${error.message}`);
  }
}

/**
 * Scans a directory for YAML files and logs their paths.
 * @param {string} relativeTo - Relative directory path from __dirname.
 * @param {string} fileName - Target file name.
 * @param {string} suffix - File extension (default: '.json').
 * @returns {Promise<string|null>} Path to the file or null if not found.
 */
async function findFileName(relativeTo, fileName, suffix = ".json") {
  try {
    const filePath = path.resolve(__dirname, `${relativeTo}`);
    const files = fs.readdirSync(filePath);
    const yamlFiles = files.filter((file) => file.endsWith(".yaml"));
    yamlFiles.forEach((file) => {
      const fullPath = path.join(filePath, file);
      console.log("YAML file found:", fullPath);
    });
    return null; // File not found
  } catch (error) {
    throw new Error(`Error reading directory: ${error.message}`);
  }
}

/**
 * Resolves environment variables formatted as 'ENV.<VARIABLE_NAME>' (case-insensitive).
 * @param {string} data - Input string potentially containing an ENV placeholder.
 * @param {object} options - Optional configuration options.
 * @returns {Promise<{value: any, found: boolean}>} Resolved value and flag indicating whether an ENV variable was matched.
 */
async function processEnvVariable(data, options = {}) {
  if (typeof data !== "string") return { value: data, found: false };
  const m = data.match(/^env\.(.+)$/i);
  if (!m) return { value: data, found: false };
  const key = m[1].trim();
  const value = process.env[key];
  return { value: value, found: true };
}

/**
 * Normalizes input text by removing Unicode/special characters and emoji.
 * @param {string} data - Raw input string.
 * @returns {Promise<string>} Normalized ASCII string.
 */
async function formaInput(data) {
  // Remove Unicode / special characters and normalize
  return data.trim().normalize("NFKC").replace(/[^\x00-\x7F]/g, "");
}

/**
 * Visually highlights a Playwright element locator on the page for debugging/inspection.
 * @param {import('@playwright/test').Locator} locator - Playwright Locator object to highlight.
 * @returns {Promise<boolean|null>} True if highlighted successfully, null otherwise.
 */
async function highlightElement(locator) {
  if (!locator) return null;
  try {
    // If locator supports count (Playwright Locator), verify matches first
    if (typeof locator.count === "function") {
      const cnt = await locator.count();
      if (!cnt || cnt === 0) return null; // Nothing to highlight
      if (cnt > 1) {
        // Choose the first match to avoid strict-mode violations
        locator = locator.nth(0);
      }
    }

    // Use evaluate to inject a temporary visual highlight overlay into the DOM
    if (typeof locator.evaluate === "function") {
      const keepMs = 1500; // Duration to keep overlay visible (in ms)
      await locator.evaluate((el, keepMsInner) => {
        try {
          const rect = el.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) return;

          // Remove any existing highlight overlays
          const existing = document.querySelectorAll(".playwright-debug-highlight");
          existing.forEach((item) => item.remove());

          // Create highlight overlay element
          const overlay = document.createElement("div");
          overlay.className = "playwright-debug-highlight";
          overlay.style.position = "absolute";
          overlay.style.pointerEvents = "none";
          overlay.style.zIndex = "2147483647";
          overlay.style.left = `${rect.left + window.scrollX}px`;
          overlay.style.top = `${rect.top + window.scrollY}px`;
          overlay.style.width = `${rect.width}px`;
          overlay.style.height = `${rect.height}px`;
          overlay.style.border = "2px solid red";
          overlay.style.background = "rgba(255, 255, 0, 0.35)";
          overlay.style.boxShadow = "0 0 10px rgba(255, 0, 0, 0.5)";
          overlay.style.transition = "opacity 0.2s ease-in-out";
          overlay.style.opacity = "1";
          document.body.appendChild(overlay);

          if (typeof el.blur === "function") {
            el.blur();
          }

          // Fade out and remove overlay
          setTimeout(() => {
            overlay.style.opacity = "0";
            setTimeout(() => overlay.remove(), 200);
          }, keepMsInner || 1500);
        } catch (innerErr) {
          // Ignore DOM manipulation errors
        }
      }, keepMs);
      return true;
    }
    console.warn("highlightElement: locator does not support evaluate()");
    return null;
  } catch (error) {
    // Gracefully ignore strict mode or timeout errors during highlighting
    if (
      error &&
      error.message &&
      (error.message.includes("strict mode") ||
        error.message.includes("Timeout") ||
        error.message.includes("No node found") ||
        error.message.includes("not found"))
    ) {
      return null;
    }
    console.warn(`Error highlighting element: ${error?.message ?? error}`);
    return null;
  }
}

/**
 * Placeholder for locator caching functionality.
 * @param {object} newLocator - Locator to cache.
 * @param {string} name - Cache entry name.
 * @param {string} path - Target path.
 */
async function CacheLocator(newLocator, name, path) {}

/**
 * Retrieves a cached locator for an element ID from a specific YAML file.
 * @param {string} elemmentID - Target element ID to look up.
 * @param {string} fileName - YAML file name (without extension).
 * @param {string} folderPath - Folder path where cache files reside.
 * @param {string} suffix - File extension (default: '.yaml').
 * @returns {Promise<object|null>} Locator object if found, otherwise null.
 */
async function getLocatorFromCache(elemmentID, fileName, folderPath = "../Resources/Pages/healingAI/", suffix = ".yaml") {
  try {
    const filePath = path.resolve(__dirname, `${folderPath}${fileName}${suffix}`);
    if (!fs.existsSync(filePath)) {
      console.log(`Cache file not found: ${filePath}`);
      return null;
    }

    const fileContent = fs.readFileSync(filePath, "utf8");
    const data = yaml.load(fileContent);

    if (data && data.elements && Array.isArray(data.elements) && data.elements.length > 0) {
      const element = data.elements.find((el) => el.id === elemmentID);
      if (!element) {
        console.log(`Element ID "${elemmentID}" not found in cache file: ${filePath}`);
        return null;
      }

      if (element.locators && Array.isArray(element.locators) && element.locators.length > 0) {
        return element.locators[0]; // Return the primary locator (typically DESKTOP)
      }
    }

    console.log(`No locators found in cache file: ${filePath}`);
    return null;
  } catch (error) {
    console.error(`Error reading locator from cache: ${error.message}`);
    return null;
  }
}

/**
 * Writes or merges a self-healed locator into a YAML page file.
 * Implements a fail-safe mechanism so file I/O errors never disrupt test execution.
 * @param {string} elementID - Identifier of the element.
 * @param {object} locator - Healed locator object generated by AI.
 * @param {string} folderPath - Target directory path for storing healed locators.
 * @param {string} name - Base name of the YAML file.
 * @returns {Promise<boolean>} True if written successfully, false if an error occurred.
 */
async function writeLocatorToFile(elementID, locator, folderPath = "Resources/Pages/healingAI/", name = "healed_elements") {
  try {
    if (!elementID || !locator) {
      console.warn("[writeLocatorToFile] elementID or locator is missing. Skipping write.");
      return false;
    }

    // 1. Resolve folder path (supports both absolute and project-relative paths)
    let targetDir;
    if (typeof folderPath === "string" && path.isAbsolute(folderPath)) {
      targetDir = folderPath;
    } else {
      targetDir = path.resolve(process.cwd(), typeof folderPath === "string" ? folderPath : "Resources/Pages/healingAI/");
    }

    // Ensure target directory exists safely
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // 2. Sanitize file name safely
    const nameStr = typeof name === "string" ? name : String(name || "healed_elements");
    const sanitizedFileName = nameStr.replace(/\.ya?ml$/i, "");
    const filePath = path.join(targetDir, `${sanitizedFileName}.yaml`);

    // 3. Build locator chain and device object
    const device = (locator && locator.device) || "DESKTOP";
    let chain = [];
    if (locator.chain && Array.isArray(locator.chain)) {
      chain = locator.chain;
    } else if (locator.locator?.chain && Array.isArray(locator.locator.chain)) {
      chain = locator.locator.chain;
    } else {
      const chainNode = { ...(typeof locator === "object" ? locator : {}) };
      delete chainNode.device;
      delete chainNode.id;
      delete chainNode.confidence;
      delete chainNode.reasoning;
      chain = [chainNode];
    }

    const locatorEntry = {
      device,
      chain,
    };

    const description = locator.reasoning
      ? `AI Healed (${locator.confidence || "N/A"}): ${locator.reasoning}`
      : "Self-healed locator";

    // 4. Load existing YAML file if it exists to merge elements without overwriting
    let existingData = { elements: [] };
    if (fs.existsSync(filePath)) {
      try {
        const fileContent = fs.readFileSync(filePath, "utf8");
        const parsed = yaml.load(fileContent);
        if (parsed && Array.isArray(parsed.elements)) {
          existingData = parsed;
        }
      } catch (readErr) {
        console.warn(`[writeLocatorToFile] Warning reading existing file "${filePath}": ${readErr.message}. Creating new.`);
      }
    }

    // 5. Update existing element or append a new element entry
    const existingElement = existingData.elements.find((el) => el.id === elementID);
    if (existingElement) {
      existingElement.description = description;
      existingElement.cache = true;
      existingElement.timeout = existingElement.timeout || 5000;
      if (!Array.isArray(existingElement.locators)) {
        existingElement.locators = [];
      }
      const existingLocIndex = existingElement.locators.findIndex((l) => l.device === device);
      if (existingLocIndex !== -1) {
        existingElement.locators[existingLocIndex] = locatorEntry;
      } else {
        existingElement.locators.push(locatorEntry);
      }
    } else {
      existingData.elements.push({
        id: elementID,
        description,
        cache: true,
        timeout: 5000,
        locators: [locatorEntry],
      });
    }

    // 6. Serialize to YAML format and write to disk
    const yamlContent = yaml.dump(existingData, {
      noRefs: true,
      indent: 2,
      lineWidth: -1,
    });

    fs.writeFileSync(filePath, yamlContent, "utf8");
    console.log(`[writeLocatorToFile] ✅ Healed locator for "${elementID}" written to ${filePath}`);
    return true;
  } catch (error) {
    // Catch all errors to prevent disrupting ongoing test execution
    console.error(`[writeLocatorToFile] ❌ Error writing locator to file: ${error.message}`);
    return false;
  }
}

module.exports = {
  checkFileExists,
  findFileName,
  processEnvVariable,
  formaInput,
  highlightElement,
  writeLocatorToFile,
  getLocatorFromCache,
};

