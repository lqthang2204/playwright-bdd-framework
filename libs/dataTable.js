const path = require('path');
const fs = require('fs');
class manageTable{
    async OverrideTable(dataTable) {
    const rows = dataTable.raw();
    if (!rows.length) {
        throw new Error("Data table is empty.");
    }

    // Check if a capabilities file is specified
    const capFileRow = rows.find(row => row[0] === "capabilitiesFile");
    let capabilities = {};

    if (capFileRow) {
        const capFileName = capFileRow[1];
        const capFilePath = path.resolve(__dirname, '../capabilitiesMobile/', `${capFileName}.json`);
        if (!fs.existsSync(capFilePath)) {
            throw new Error(`Capabilities file not found: ${capFilePath}`);
        }
        try {
            capabilities = JSON.parse(fs.readFileSync(capFilePath, 'utf-8'));

            //after loading capabilities from file, normoolaize keys
            const normalizedCaps = {};
            for(const[key, value] of Object.entries(capabilities)){
                const capKey = await this.checkPrefix(key);
                normalizedCaps[capKey] = value;

            }
            capabilities = normalizedCaps;
        } catch (err) {
            throw new Error(`Failed to parse capabilities file: ${capFilePath}\n${err.message}`);
        }
    }
    let appiumServerUrl = undefined

    // Merge/override with table values (skip the capabilitiesFile row)
    for (const [key, value] of rows) {
        if (key === "capabilitiesFile") continue;
        if (key == 'appiumServerUrl') {
            appiumServerUrl = value.trim();
            if (!appiumServerUrl) {
                throw new Error('appiumServerUrl must be a non-empty string');
            }
            continue;
        }
        const capKey = await this.checkPrefix(key);
        capabilities[capKey] = value;
    }

    // If no capabilities file, build from table only
    if (!capFileRow) {
        for (const [key, value] of rows) {
            const capKey = await this.checkPrefix(key);
            capabilities[capKey] = value;
        }
    }

    return {capabilities, appiumServerUrl};
}
async checkPrefix(key) {
    if (typeof key !== 'string' || !key.trim()) {
        throw new Error('Capability key must be a non-empty string');
    }
    // Normalize key: trim and lowercase only the prefix for consistency
    const trimmedKey = key.trim();
    if (trimmedKey.startsWith('appium:')) {
        return trimmedKey;
    }
    // Avoid double prefix if user accidentally adds whitespace or wrong case
    return `appium:${trimmedKey.replace(/^appium:/i, '')}`;
}   


}
module.exports = new manageTable();