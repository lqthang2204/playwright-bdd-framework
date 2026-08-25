
const cheerio = require('cheerio');
const PromptGenerateLocator = require('./PromptGenerateLocator');
let OllamaPkg;
let Ollama;
let ollamaEnabled = true;

try {
  OllamaPkg = require("ollama");
  Ollama = OllamaPkg.Ollama || OllamaPkg.default || OllamaPkg;
  if (typeof Ollama !== "function") {
    console.warn('The imported "ollama" module does not export a constructor. Self-healing will be disabled.');
    ollamaEnabled = false;
  }
} catch (err) {
  console.warn('Package "ollama" is not installed. Self-healing will be disabled. Run: npm install ollama if you want AI locator healing.');
  ollamaEnabled = false;
}
//  generateLocator(html, log_error, path_image, bdd_step, original_selector, selector_map)
async function generateLocatorFromAI(log_error, page, original_selector, elementId) {
  if (!ollamaEnabled) {
    throw new Error('Ollama package unavailable; self-healing skipped.');
  }
  const ollama = new Ollama(); // Defaults to http://localhost:11434
  const html = await getContent(page);
  // console.log("html is ", html);
  const response = await ollama.chat({
    model: 'qwen2.5-coder:1.5b', // Ensure this model is available locally
    format: "json",
    messages: [
      {
        role: "user",
        content: await PromptGenerateLocator.generateLocator(html, log_error, original_selector._selector, elementId)
      }
    ],
    options: {
      temperature: 0
    }
  });
  

  console.log(response.message?.content ?? response);
  const response_json = JSON.parse(response.message?.content);
  // console.log("Response from Ollama: ", response_json.type, response_json.value, response_json.description);
  return response_json;

  
}
async function getContent(page) {
  if (!page) return null;
  try {
    const cheerio = require("cheerio");
    const fullHTML = await page.content();
    const cleanHTML = getCleanHtmlFromString(fullHTML);
    return cheerio.load(cleanHTML).html();
  } catch (error) {
    console.error("Error fetching or cleaning page content:", error.message);
    return null;
  }
  
}
// function getCleanHtmlFromString(htmlString) {
//   const cheerio = require('cheerio');
//     const $ = cheerio.load(htmlString);
//     const garbageTags = ['script', 'style', 'svg', 'noscript', 'meta', 'link', 'iframe', 'head', 'title', 'noscript'];
//     garbageTags.forEach(tag => $(tag).remove());
//     const allowedAttrs = [
//         'id', 'name', 'type', 'aria-label', 'aria-labelledby', 'aria-describedby',
//         'data-testid', 'data-cy', 'placeholder', 'role', 'value', 'title', 'href', 'for'
//     ];
//     $('*').each((i, el) => {
//         const attrs = el.attribs;
//         for (let attrName in attrs) {
//             if (!allowedAttrs.includes(attrName)) {
//                 $(el).removeAttr(attrName);
//             }
//         }
//     });
//     return $('body').html(); 
// }
// Trong libs/self-healingAI.js:
function getCleanHtmlFromString(htmlString) {
    const cheerio = require('cheerio');
    const $ = cheerio.load(htmlString);
    
    // Loại bỏ thẻ rác
    const garbageTags = ['script', 'style', 'svg', 'noscript', 'meta', 'link', 'iframe', 'head'];
    garbageTags.forEach(tag => $(tag).remove());

    // Nếu có form hoặc container chính thì ưu tiên lấy container đó
    const mainContainer = $('form, main, [role="main"]').first();
    const targetHtml = mainContainer.length ? mainContainer.html() : $('body').html();
    
    return targetHtml;
}

module.exports = {
  generateLocatorFromAI,
  isSelfHealingAvailable: () => ollamaEnabled,
};
