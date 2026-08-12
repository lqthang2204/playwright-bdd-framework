async function generateLocator(html, log_error, original_selector, elementId) {
  const content = `
### ROLE
You are an expert QA Automation Engineer specializing in Playwright Self-Healing locators.

Your goal is to repair the failed locator by selecting the MOST STABLE XPath for the SAME HTML element and returning it in a structured JSON format.

--------------------------------------------------

### CONTEXT

HTML Source:
${html}

Playwright Exception:
${log_error}

Original Locator (Element to Repair):
${original_selector}

"id": ${elementId}
--------------------------------------------------

### RULES & ANALYSIS

1. **HTML Source of Truth:** Evaluate ONLY attributes that physically exist in the supplied HTML. Never invent or infer attributes.
2. **Stability Hierarchy:** Prioritize attributes from highest to lowest:
   - High: \`data-testid\`, \`id\`, \`data-cy\`, \`name\` (if present in HTML)
   - Medium: \`aria-label\`, \`role\`
   - Low: \`placeholder\`, \`value\`, visible text
   - Lowest: CSS classes, XPath indexes, \`nth-child\`, \`nth-of-type\`
3. **Case Sensitivity:** Attribute names and values must preserve the exact case used in the HTML.
4. **Uniqueness & Reliability:** The XPath must uniquely identify the target element and be as short as possible.

--------------------------------------------------

### OUTPUT FORMAT

Return **ONLY** a valid JSON object matching the exact schema below. Do not wrap the JSON in markdown code blocks (no \`\`\`json).

{
  "id": "${elementId}",
  "confidence": "percentage",
  "reasoning": "Briefly explain WHY this attribute is more stable than others (e.g., 'Chosen data-testid because it is purpose-built for testing')",
  "chain": [
    {
      "type": "LOCATOR",
      "value": "XPATH_STRING_HERE"
    }
  ]
}

### RESPONSE
`;
  return content;
}

module.exports = { generateLocator };