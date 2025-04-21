function go_to_url(url, config){
    console.log("config ", config.environments);
    const currentEnv = config.environments.find(env => env.name === config.env);
    if (!currentEnv) {
      throw new Error(`Environment "${config.env}" not found in config file.`);
    }
    const targetUrl = currentEnv.links[url];
    if (!targetUrl && !validdate_url(url)) {
        throw new Error(`URL "${url}" not found in environment "${config.env}".`);
    }
    return targetUrl || url.replace(/^"|"$/g, ''); // Remove trailing slash if present

}
module.exports = {
    go_to_url: go_to_url,
  };
function validdate_url(url) {
  const urlPattern = new RegExp(
    "^(https?:\\/\\/)?" + // Optional protocol (http or https)
    "((([a-zA-Z0-9\\-]+\\.)+[a-zA-Z]{2,})|" + // Domain name
    "localhost|" + // OR localhost
    "\\d{1,3}(\\.\\d{1,3}){3})" + // OR IPv4 address
    "(\\:\\d+)?(\\/.*)?$", // Optional port and path
    "i"
);
    return urlPattern.test(url);  
}