const path = require("path");
const fs = require("fs");
const yaml = require("js-yaml");
const pageFixture = require("../support/pageFixture.js");


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
                const found = ManageYamlFile.findFileRecursive(
                    fullPath,
                    fileName,
                    suffix
                );
                if (found) return found;
            } else if (file.name === `${fileName}${suffix}`) {
                return fullPath;
            }
        }
        return null;
    }

    /**
     * Reads and parses a YAML file by searching recursively from a root directory.
     * @param {string} fileName - The base name of the YAML file (without extension).
     * @param {string} relativeTo - The root directory to search from.
     * @param {string} suffix - The file extension (default: '.yaml').
     * @returns {Promise<Object>} Parsed YAML content.
     */
    async readFileYaml(
        fileName,
        relativeTo = "../Resources/Pages/",
        suffix = ".yaml",
    ) {
        if (pageFixture.getMapLocator() && pageFixture.getMapLocator() instanceof Map) {
            const mapYaml = pageFixture.getMapLocator()
            if (mapYaml.has(fileName)) {
                return mapYaml.get(fileName);
            } else {
                try {
                    const rootDir = path.resolve(__dirname, relativeTo);
                    const filePath = ManageYamlFile.findFileRecursive(
                        rootDir,
                        fileName,
                        suffix
                    );
                    if (!filePath) {
                        throw new Error(
                            `File "${fileName}${suffix}" not found in "${rootDir}" or its subdirectories.`
                        );
                    }
                    const fileContent = fs.readFileSync(filePath, "utf8");
                    const data = yaml.load(fileContent);
                    mapYaml.set(fileName,data)
                    pageFixture.setMapLocator(mapYaml);
                    return data;
                } catch (error) {
                    console.error("Error in readFileYaml:", error.message);
                    throw error;
                }
            }
        }
    }
}
module.exports = new ManageYamlFile

// Example usage:
// (async () => {
//     const manageTable = new ManageYamlFile();
//     try {
//         const data = await manageTable.readFileYaml(
//             "signin_kode_page",
//             "../Resources/Pages/",
//             ".yaml"
//         );
//           const data2 = await manageTable.readFileYaml(
//             "login",
//             "../Resources/Pages/",
//             ".yaml"
//         );
//         // const data = await manageTable.readFileYaml('test', '../', '.yaml');
//         console.log("Parsed YAML:", data);
//     } catch (err) {
//         // Error already logged in readFileYaml
//     }
// })();
