const path = require("path");
const fs = require("fs");

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
module.exports = { checkFileExists, findFileName };
