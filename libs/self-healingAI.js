
const cheerio = require('cheerio');
const PromptGenerateLocator = require('./PromptGenerateLocator');
let OllamaPkg;
try {
  OllamaPkg = require("ollama");
} catch (err) {
  console.error('Package "ollama" is not installed. Run: npm install ollama');
  process.exit(1);
}

const Ollama = OllamaPkg.Ollama || OllamaPkg.default || OllamaPkg;

if (typeof Ollama !== "function") {
  console.error('The imported "ollama" module does not export a constructor.');
  process.exit(1);
}
//  generateLocator(html, log_error, path_image, bdd_step, original_selector, selector_map)
async function generateLocatorFromAI(log_error, page, original_selector) {
  const ollama = new Ollama(); // Defaults to http://localhost:11434
  const html = await getContent(page);
  // console.log("html is ", html);
  const response = await ollama.chat({
    model: 'qwen2.5-coder:1.5b', // Ensure this model is available locally
    format: "json",
    messages: [
      {
        role: "user",
        content: await PromptGenerateLocator.generateLocator(html, log_error, original_selector)
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
    logError("Error getting page content", error);
    return null;
  }
  const cheerio = require('cheerio');
 
/**

* Nhận vào một chuỗi HTML thô (raw string) và trả về HTML đã làm sạch

* @param {string} htmlString - Nội dung HTML lấy từ page.content()

*/
 
}
function getCleanHtmlFromString(htmlString) {
    const $ = cheerio.load(htmlString);
    const garbageTags = ['script', 'style', 'svg', 'noscript', 'meta', 'link', 'iframe', 'head', 'title', 'noscript'];
    garbageTags.forEach(tag => $(tag).remove());
    const allowedAttrs = [
        'id', 'name', 'type', 'aria-label', 'aria-labelledby', 'aria-describedby',
        'data-testid', 'data-cy', 'placeholder', 'role', 'value', 'title', 'href', 'for'
    ];
    $('*').each((i, el) => {
        const attrs = el.attribs;
        for (let attrName in attrs) {
            if (!allowedAttrs.includes(attrName)) {
                $(el).removeAttr(attrName);
            }
        }
    });
    return $('body').html(); 
}


module.exports = { generateLocatorFromAI };
