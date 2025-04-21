function go_to_url(url, config){
    console.log("config ", config.environments);
    const currentEnv = config.environments.find(env => env.name === config.env);
    if (!currentEnv) {
      throw new Error(`Environment "${config.env}" not found in config file.`);
    }
    const targetUrl = currentEnv.links[url];
    if (!targetUrl) {
      throw new Error(`URL "${url}" not found in environment "${config.env}".`);
    }
    return targetUrl

}
module.exports = {
    go_to_url: go_to_url,
  };