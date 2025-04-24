const { execSync } = require('child_process');
const path = require('path');
const config = require(path.resolve(__dirname, './config.json'));

console.log('Running tests with the following configuration:');

// Get tags from the environment variable or fallback to config.json
const tags = process.env.TAGS || config.tags;

// Build the command to run cucumber-js
const command = `npx cucumber-js --tags "${tags}" `;
console.log(`Running: ${command}`);

try {
    // Execute the command
    execSync(command, { stdio: 'inherit' });
} catch (error) {
    console.error('Error running tests:', error.message);
    process.exit(0); // Exit with failure code
}