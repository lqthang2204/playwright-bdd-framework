const path = require("path");
const fs = require("fs");
const yaml = require("js-yaml");
const pageFixture = require("../support/pageFixture.js");

/**
 * Utility class for managing YAML locator files.
 */
class ManageYamlFile {
  /**
   * Recursively search for a file by name and suffix in a directory tree.
   * @param {string} rootDir - The root directory to search.
   * @param {string} fileName - The base name of the file (without extension).
   * @param {string} suffix - The file extension (default: '.yaml').
   * @returns {string|null} Absolute path to the file if found, otherwise null.
   */
  static findFileRecursive(rootDir, fileName, suffix = ".yaml") {
    const files = fs.readdirSync(rootDir, { withFileTypes: true });
    for (const file of files) {
      const fullPath = path.join(rootDir, file.name);
      if (file.isDirectory()) {
        const found = ManageYamlFile.findFileRecursive(fullPath, fileName, suffix);
        if (found) return found;
      } else if (file.name === `${fileName}${suffix}`) {
        return fullPath;
      }
    }
    return null;
  }

  /**
   * Reads and parses a YAML file by searching recursively from a root directory.
   * Caches the result in the locator map if not already present.
   * @param {string} fileName - The base name of the YAML file (without extension).
   * @param {string} relativeTo - The root directory to search from.
   * @param {string} suffix - The file extension (default: '.yaml').
   * @returns {Promise<Object>} Parsed YAML content.
   */
  async readFileYaml(fileName, relativeTo = "../Resources/Pages/", suffix = ".yaml") {
    const mapYaml = pageFixture.getMapLocator();
    if (!mapYaml || !(mapYaml instanceof Map)) {
      throw new Error("Locator map is not initialized or not a Map.");
    }
    if (mapYaml.has(fileName)) {
      return mapYaml.get(fileName);
    }
    try {
      const rootDir = path.resolve(__dirname, relativeTo);
      const filePath = ManageYamlFile.findFileRecursive(rootDir, fileName, suffix);
      if (!filePath) {
        throw new Error(`File "${fileName}${suffix}" not found in "${rootDir}" or its subdirectories.`);
      }
      const fileContent = fs.readFileSync(filePath, "utf8");
      const data = yaml.load(fileContent);
      mapYaml.set(fileName, data);
      pageFixture.setMapLocator(mapYaml);
      await this.storeGeneralFileToCached("../Resources/Pages/General", suffix);
      return data;
    } catch (error) {
      console.error("[readFileYaml] Error:", error.message);
      throw error;
    }
  }

  /**
   * Reads all YAML files in the specified folder and stores them in the locator map.
   * Each file is stored with key "General/<filename-without-extension>" if not already present.
   * Continues execution if a file fails to load.
   * @param {string} relativeTo - Folder to search for YAML files.
   * @param {string} suffix - File extension to match (default: '.yaml').
   */
  async storeGeneralFileToCached(relativeTo = "../Resources/Pages/General", suffix = ".yaml") {
    if (!pageFixture.getFlag()) {
      console.warn("[storeGeneralFileToCached] Skipped: General YAML files already cached.");
      return;
    }
    const rootDir = path.resolve(__dirname, relativeTo);
    let files = [];
    try {
      files = fs.readdirSync(rootDir, { withFileTypes: true });
    } catch (error) {
      console.error(`[storeGeneralFileToCached] Error reading directory "${rootDir}":`, error.message);
      return;
    }
    const mapYaml = pageFixture.getMapLocator();

    for (const file of files) {
      if (file.isFile() && file.name.endsWith(suffix)) {
        try {
          const filePath = path.join(rootDir, file.name);
          const fileContent = fs.readFileSync(filePath, "utf8");
          const data = yaml.load(fileContent);
          const key = `General/${file.name.replace(suffix, "")}`;
          if (!mapYaml.has(key)) {
            mapYaml.set(key, data);
          }
        } catch (error) {
          console.error(`[storeGeneralFileToCached] Error with file "${file.name}":`, error.message);
          // Continue to next file
        }
      }
    }

    pageFixture.setMapLocator(mapYaml);
    pageFixture.setFlag(false);
  }
}

module.exports = new ManageYamlFile();

// Example usage:
// (async () => {
//   try {
//     const data = await manageTable.readFileYaml(
//       "signin_kode_page",
//       "../Resources/Pages/",
//       ".yaml"
//     );
//     await manageTable.storeGeneralFileToCached(
//       "../Resources/Pages/General",
//       ".yaml"
//     );
//     console.log("Parsed YAML:", data);
//   } catch (err) {
//     // Error already logged in readFileYaml
//   }
// })();