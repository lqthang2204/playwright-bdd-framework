const path = require("path");
const fs = require("fs");
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


module.exports = { checkFileExists, findFileName , processEnvVariable, formaInput};
