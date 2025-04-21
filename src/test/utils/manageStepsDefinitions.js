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
    console.log("url TET ", url.replace(/^"|"$/g, ''));
    return targetUrl || url.replace(/^"|"$/g, ''); // Remove trailing slash if present

}
module.exports = {
    go_to_url: go_to_url,
  };
function validdate_url(url) {
  const urlPattern = new RegExp(
    "^(https?:\\/\\/)?" // Optional protocol (http or https)
);
    return urlPattern.test(url);  
}