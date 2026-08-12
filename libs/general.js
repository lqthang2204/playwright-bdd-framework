const path = require("path");
const fs = require("fs");
const yaml = require("js-yaml");
require('dotenv').config();

async function checkFileExists(fileName, relativeTo, suffix = ".json") {
  try {
    const file = path.resolve(__dirname, `${relativeTo}${fileName}${suffix}`);
    if (!fs.existsSync(file)) {
      return false;
    } else {
      return true;
    }
  } catch (error) {
    throw new Error(`Error checking file existence: ${error.message}`);
  }
}
async function findFileName(relativeTo, fileName, suffix = ".json") {
  try {
    const filePath = path.resolve(__dirname, `${relativeTo}`);
    const files = fs.readdirSync(filePath);
    const yamlFiles = files.filter((file) => file.endsWith(".yaml"));
    yamlFiles.forEach((file) => {
      const fullPath = path.join(folderPath, file);
      console.log("YAML file found:", fullPath);
    });
    return null; // File not found
  } catch (error) {
    throw new Error(`Error reading directory: ${error.message}`);
  }
  
}
async function processEnvVariable(data, options = {}) {
  if (typeof data !== 'string') return {value: data, found: false};
  const m = data.match(/^env\.(.+)$/i);
  if (!m) return {value: data, found: false};
  const key = m[1].trim();
  const value = process.env[key]
  return {value: value, found: true};
}
async function formaInput(data){
  //remove Unicode / emoji characters
 return data.trim().normalize('NFKC').replace(/[^\x00-\x7F]/g, '') //remove special characters
}
async function highlightElement(locator) {
  if (!locator) return null;
  try {
    // If locator supports count (Playwright Locator), check for matches first
    if (typeof locator.count === 'function') {
      const cnt = await locator.count();
      if (!cnt || cnt === 0) return null; // nothing to highlight
      if (cnt > 1) {
        // choose the first match to avoid strict-mode violations
        locator = locator.nth(0);
      }
    }

    // Both Locator and ElementHandle support evaluate, use it to draw overlay
    if (typeof locator.evaluate === 'function') {
      // keep the overlay short-lived (in ms)
      const keepMs = 1500;
      await locator.evaluate((el, keepMsInner) => {
        try {
          const rect = el.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) return;

          const existing = document.querySelectorAll('.playwright-debug-highlight');
          existing.forEach((item) => item.remove());

          const overlay = document.createElement('div');
          overlay.className = 'playwright-debug-highlight';
          overlay.style.position = 'absolute';
          overlay.style.pointerEvents = 'none';
          overlay.style.zIndex = '2147483647';
          overlay.style.left = `${rect.left + window.scrollX}px`;
          overlay.style.top = `${rect.top + window.scrollY}px`;
          overlay.style.width = `${rect.width}px`;
          overlay.style.height = `${rect.height}px`;
          overlay.style.border = '2px solid red';
          overlay.style.background = 'rgba(255, 255, 0, 0.35)';
          overlay.style.boxShadow = '0 0 10px rgba(255, 0, 0, 0.5)';
          overlay.style.transition = 'opacity 0.2s ease-in-out';
          overlay.style.opacity = '1';
          document.body.appendChild(overlay);

          if (typeof el.blur === 'function') {
            el.blur();
          }

          setTimeout(() => {
            overlay.style.opacity = '0';
            setTimeout(() => overlay.remove(), 200);
          }, keepMsInner || 1500);
        } catch (innerErr) {
          // swallow DOM errors
        }
      }, keepMs);
      return true;
    }
    console.warn('highlightElement: locator does not support evaluate()');
    return null;
  } catch (error) {
    // If Playwright throws strict-mode or timeout errors, skip highlighting gracefully
    if (error && error.message && (error.message.includes('strict mode') || error.message.includes('Timeout') || error.message.includes('No node found') || error.message.includes('not found'))) {
      return null;
    }
    console.warn(`Error highlighting element: ${error?.message ?? error}`);
    return null;
  }
}
async function CacheLocator(newLocator, name, path) {


}

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
      //get locator for the elementID
      const element = data.elements.find(el => el.id === elemmentID);
      if (!element) {
        console.log(`Element ID "${elemmentID}" not found in cache file: ${filePath}`);
        return null;
      }

      if (element.locators && Array.isArray(element.locators) && element.locators.length > 0) {
        return element.locators[0]; // Return the first locator (typically DESKTOP)
      }
      if (element.locators && Array.isArray(element.locators) && element.locators.length > 0) {
        return element.locators[0]; // Return the first locator (typically DESKTOP)
      }
    }

    console.log(`No locators found in cache file: ${filePath}`);
    return null;
  } catch (error) {
    console.error(`Error reading locator from cache: ${error.message}`);
    return null;
  }
}
async function writeLocatorToFile(elementID, locator, folderPath, name) {
  const locatorEntry = {
    device: (locator && locator.device) || 'DESKTOP',
  };

  if (locator && locator.chain) {
    locatorEntry.chain = locator.chain;
  } else {
    const chainNode = { ...(locator || {}) };
    delete chainNode.device;
    locatorEntry.chain = [chainNode];
  }

  const yamlContent = yaml.dump(
    {
      elements: [
        {
          id: elementID,
          description: locator.reasoning || '',
          cache: true,
          timeout: 5000,
          locators: [locatorEntry],
        },
      ],
    },
    {
      noRefs: true,
      indent: 2,
    }
  );

  const targetDir = path.resolve(__dirname, folderPath);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  const filePath = path.resolve(targetDir, `${name}.yaml`);
  try {
    fs.writeFileSync(filePath, yamlContent, 'utf8');
    console.log(`Locator for element "${elementID}" written to ${filePath}`);
  } catch (error) {
    console.error(`Error writing locator to file: ${error.message}`);
  }
}

module.exports = { checkFileExists, findFileName , processEnvVariable, formaInput, highlightElement, writeLocatorToFile, getLocatorFromCache};
