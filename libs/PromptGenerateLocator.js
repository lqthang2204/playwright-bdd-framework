async function generateLocator(html, log_error, original_selector) {
  const content = `
### ROLE
You are an expert QA Automation Engineer. Your goal is to select the MOST STABLE locator for an element. 
"Stability" is defined as: An attribute that rarely changes even if the UI text, styling, or placeholder changes.

### CONTEXT
- **HTML Source:** ${html}
- **Playwright Exception:** ${log_error}
- **Failed Selector:** ${original_selector}

### INSTRUCTIONS
1. **Analyze Strategy (Heuristic Approach):**
   Evaluate all available attributes in the HTML snippet. Score them based on stability:
   - **High Stability (Best):** data-testid, id, data-cy, name (if unique).
   - **Medium Stability:** aria-label, role.
   - **Low Stability (Avoid if possible):** placeholder, value, innerText, classes, or XPath indices (e.g., div[1]).
2. **Task:** Select the attribute that provides the best balance of **Uniqueness** and **Stability**.
3. **Logic:** 
   - If a 'data-testid' or unique 'id' exists, ALWAYS prefer it.
   - If not, pick the attribute that is least likely to change when a UX designer updates the text (e.g., 'name' is often better than 'placeholder').
4. **Constraint:** Output MUST be a valid JSON.

### OUTPUT JSON SCHEMA
{
  "id": "identifier_name",
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