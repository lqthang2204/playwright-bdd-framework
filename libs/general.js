const path = require("path");
const fs = require("fs");
const yaml = require("js-yaml");
const { fi } = require("zod/v4/locales");
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
async function CacheLocator(newLocator, name, path) { }

/**
 * Retrieves a cached locator for an element ID from a specific YAML file.
 * @param {string} elementID - Target element ID to look up.
 * @param {string} fileName - YAML file name (without extension).
 * @param {string} folderPath - Folder path where cache files reside (relative to project root).
 * @param {string} suffix - File extension (default: '.yaml').
 * @param {string} device - Target device (default: 'DESKTOP').
 * @returns {Promise<object|null>} Locator object if found, otherwise null.
 */
async function getLocatorFromCache(elementID, fileName, folderPath = "Resources/Pages/healingAI/", suffix = ".yaml", device = "DESKTOP") {
  try {
    // Resolve relative to project root (process.cwd()) to correctly handle paths like "Resources/Pages/..."
    const filePath = path.resolve(process.cwd(), `${folderPath}${fileName}${suffix}`);
    
    // Asynchronously check if file exists
    try {
      await fs.promises.access(filePath, fs.constants.F_OK);
    } catch {
      console.log(`Cache file not found: ${filePath}`);
      return null;
    }

    const fileContent = await fs.promises.readFile(filePath, "utf8");
    const data = yaml.load(fileContent);

    if (data && Array.isArray(data.elements) && data.elements.length > 0) {
      const element = data.elements.find((el) => el.id === elementID);
      if (!element) {
        console.log(`Element ID "${elementID}" not found in cache file: ${filePath}`);
        return null;
      }

      if (Array.isArray(element.locators) && element.locators.length > 0) {
        // Try to find the locator for the specific device, fallback to the first one
        const targetLocator = element.locators.find((l) => l.device === device) || element.locators[0];
        return targetLocator;
      }
    }

    console.log(`No valid locators found for "${elementID}" in cache file: ${filePath}`);
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

const fsp = fs.promises;

/**
 * Store a successfully validated AI-healed locator into YAML.
 *
 * Flow:
 * 1. Validate locator
 * 2. Acquire async file lock
 * 3. Read the latest YAML
 * 4. Update / add locator
 * 5. Write YAML through a temporary file
 * 6. Release lock
 *
 * This is designed to support parallel Playwright/Cucumber workers.
 */
async function writeLocatorToFile(
  elementID,
  locator,
  folderPath = "Resources/Pages/healingAI/",
  name = "healed_elements"
) {
  const LOCK_TIMEOUT_MS = 10_000;
  const LOCK_RETRY_MS = 100;
  const STALE_LOCK_MS = 60_000;

  let lockPath = null;

  try {
    // =========================================================
    // 1. Validate input
    // =========================================================
    if (
      !elementID ||
      !locator ||
      typeof locator !== "object"
    ) {
      console.warn(
        "[writeLocatorToFile] elementID or locator is missing/invalid. Skipping write."
      );

      return false;
    }

    // =========================================================
    // 2. Resolve target directory
    // =========================================================
    let targetDir;

    if (
      typeof folderPath === "string" &&
      path.isAbsolute(folderPath)
    ) {
      targetDir = folderPath;
    } else {
      targetDir = path.resolve(
        process.cwd(),
        typeof folderPath === "string"
          ? folderPath
          : "Resources/Pages/healingAI/"
      );
    }

    await fsp.mkdir(targetDir, {
      recursive: true
    });

    // =========================================================
    // 3. Resolve YAML file
    // =========================================================
    const nameStr =
      typeof name === "string"
        ? name
        : String(name || "healed_elements");

    const sanitizedFileName =
      nameStr.replace(/\.ya?ml$/i, "");

    const filePath = path.join(
      targetDir,
      `${sanitizedFileName}.yaml`
    );

    lockPath = `${filePath}.lock`;

    // =========================================================
    // 4. Build device
    // =========================================================
    const device =
      locator.device || "DESKTOP";

    // =========================================================
    // 5. Build locator chain
    // =========================================================
    let chain = [];

    if (Array.isArray(locator.chain)) {
      chain = locator.chain;
    } else if (
      locator.locator &&
      Array.isArray(locator.locator.chain)
    ) {
      chain = locator.locator.chain;
    } else {
      const chainNode = {
        ...locator
      };

      delete chainNode.device;
      delete chainNode.id;
      delete chainNode.confidence;
      delete chainNode.reasoning;

      chain = [chainNode];
    }

    // =========================================================
    // 6. Validate locator chain
    // =========================================================
    if (
      !Array.isArray(chain) ||
      chain.length === 0
    ) {
      console.warn(
        `[writeLocatorToFile] Invalid locator chain for "${elementID}".`
      );

      return false;
    }

    const locatorEntry = {
      device,
      chain
    };

    // =========================================================
    // 7. Build description
    // =========================================================
    const description = locator.reasoning
      ? `AI Healed (${locator.confidence ?? "N/A"}): ${locator.reasoning}`
      : "Self-healed locator";

    // =========================================================
    // 8. Acquire async lock
    // =========================================================
    await acquireFileLock(
      lockPath,
      LOCK_TIMEOUT_MS,
      LOCK_RETRY_MS,
      STALE_LOCK_MS
    );

    console.log(
      `[writeLocatorToFile] 🔒 Lock acquired: ${filePath}`
    );

    // =========================================================
    // 9. IMPORTANT:
    //    Read YAML AFTER acquiring the lock
    // =========================================================
    let existingData = {
      elements: []
    };

    try {
      const fileContent =
        await fsp.readFile(
          filePath,
          "utf8"
        );

      const parsed =
        yaml.load(fileContent);

      if (
        parsed &&
        Array.isArray(parsed.elements)
      ) {
        existingData = parsed;
      }
    } catch (readError) {
      if (readError.code !== "ENOENT") {
        console.warn(
          `[writeLocatorToFile] Warning reading "${filePath}": ${readError.message}`
        );
      }
    }

    // =========================================================
    // 10. Find existing element
    // =========================================================
    let existingElement =
      existingData.elements.find(
        (element) =>
          element.id === elementID
      );

    // =========================================================
    // 11. Existing element
    // =========================================================
    if (existingElement) {
      existingElement.description =
        description;

      existingElement.cache = true;

      existingElement.timeout ??= 5000;

      if (
        !Array.isArray(
          existingElement.locators
        )
      ) {
        existingElement.locators = [];
      }

      // Find locator for same device
      const existingLocIndex =
        existingElement.locators.findIndex(
          (locatorItem) =>
            locatorItem.device === device
        );

      // =======================================================
      // Same device exists → replace locator
      // =======================================================
      if (existingLocIndex !== -1) {
        existingElement.locators[
          existingLocIndex
        ] = locatorEntry;

        console.log(
          `[writeLocatorToFile] 🔄 Updated "${elementID}" locator for ${device}.`
        );
      }

      // =======================================================
      // Device does not exist → add locator
      // =======================================================
      else {
        existingElement.locators.push(
          locatorEntry
        );

        console.log(
          `[writeLocatorToFile] ➕ Added ${device} locator for "${elementID}".`
        );
      }
    }

    // =========================================================
    // 12. New element
    // =========================================================
    else {
      existingData.elements.push({
        id: elementID,
        description,
        cache: true,
        timeout: 5000,
        locators: [
          locatorEntry
        ]
      });

      console.log(
        `[writeLocatorToFile] ➕ Added new healed element "${elementID}".`
      );
    }

    // =========================================================
    // 13. Convert object to YAML
    // =========================================================
    const yamlContent =
      yaml.dump(existingData, {
        noRefs: true,
        indent: 2,
        lineWidth: -1
      });

    // =========================================================
    // 14. Write temporary file
    // =========================================================
    const tempFilePath =
      `${filePath}.${process.pid}.${Date.now()}.tmp`;

    await fsp.writeFile(
      tempFilePath,
      yamlContent,
      "utf8"
    );

    // =========================================================
    // 15. Replace YAML with temp file
    // =========================================================
    await fsp.rename(
      tempFilePath,
      filePath
    );

    console.log(
      `[writeLocatorToFile] ✅ Healed locator for "${elementID}" written to ${filePath}`
    );

    return true;
  } catch (error) {
    console.error(
      `[writeLocatorToFile] ❌ Error: ${error.message}`
    );

    return false;
  } finally {
    // =========================================================
    // 16. ALWAYS release lock
    // =========================================================
    if (lockPath) {
      await releaseFileLock(lockPath);
    }
  }
}


/**
 * Acquire an asynchronous file lock.
 *
 * The lock is created using "wx".
 *
 * "wx" means:
 * - Create the file
 * - Fail if the file already exists
 *
 * This allows multiple Playwright workers to
 * safely coordinate access to the YAML file.
 */
async function acquireFileLock(
  lockPath,
  timeoutMs,
  retryMs,
  staleLockMs
) {
  const startTime =
    Date.now();

  while (true) {
    try {
      // =======================================================
      // Try to create lock
      // =======================================================
      const handle =
        await fsp.open(
          lockPath,
          "wx"
        );

      try {
        await handle.writeFile(
          JSON.stringify({
            pid: process.pid,
            createdAt: Date.now()
          })
        );
      } finally {
        await handle.close();
      }

      return;
    } catch (error) {
      // =======================================================
      // Lock already exists
      // =======================================================
      if (error.code !== "EEXIST") {
        throw error;
      }

      // =======================================================
      // Check stale lock
      // =======================================================
      try {
        const stats =
          await fsp.stat(
            lockPath
          );

        const lockAge =
          Date.now() -
          stats.mtimeMs;

        if (
          lockAge >
          staleLockMs
        ) {
          console.warn(
            `[writeLocatorToFile] ⚠️ Removing stale lock: ${lockPath}`
          );

          await fsp.unlink(
            lockPath
          );

          continue;
        }
      } catch (statError) {
        // Another worker may have
        // removed the lock already.
      }

      // =======================================================
      // Check timeout
      // =======================================================
      if (
        Date.now() -
        startTime >=
        timeoutMs
      ) {
        throw new Error(
          `Could not acquire file lock within ${timeoutMs}ms: ${lockPath}`
        );
      }

      // =======================================================
      // Wait asynchronously
      // =======================================================
      await delay(
        retryMs
      );
    }
  }
}


/**
 * Release file lock.
 */
async function releaseFileLock(
  lockPath
) {
  try {
    await fsp.unlink(
      lockPath
    );

    console.log(
      `[writeLocatorToFile] 🔓 Lock released: ${lockPath}`
    );
  } catch (error) {
    // Lock may already have been removed.
    if (error.code !== "ENOENT") {
      console.warn(
        `[writeLocatorToFile] ⚠️ Failed to release lock "${lockPath}": ${error.message}`
      );
    }
  }
}


/**
 * Non-blocking async delay.
 */
function delay(ms) {
  return new Promise(
    (resolve) =>
      setTimeout(resolve, ms)
  );
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

