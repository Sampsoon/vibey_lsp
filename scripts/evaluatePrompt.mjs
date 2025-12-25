/**
 * Prompt Evaluation Script
 * 
 * AI-generated code (Claude)
 * 
 * Evaluates the LLM prompt by comparing its output against human annotations.
 * Simulates the exact same behavior as the Chrome extension.
 * 
 * What it does:
 * - Loads annotated examples from test-data/annotated-examples.json
 * - For each example, tokenizes HTML the same way as the extension
 * - Calls the LLM with the same prompt used by the extension
 * - Compares which tokens received documentation vs expected
 * - Calculates precision, recall, F1 score, and type accuracy
 * 
 * Usage:
 *   # Set environment variables for API access
 *   export OPENAI_API_KEY="your-key"
 *   export OPENAI_BASE_URL="https://openrouter.ai/api/v1"  # optional
 *   export OPENAI_MODEL="x-ai/grok-4.1-fast"               # optional
 * 
 *   node scripts/evaluatePrompt.mjs
 * 
 * Output: Prints evaluation report to console
 */

import { readFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { JSDOM } from 'jsdom';
import OpenAI from 'openai';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CODE_EXAMPLES_PATH = join(__dirname, '..', 'test-data', 'code-examples.json');
const ANNOTATIONS_PATH = join(__dirname, '..', 'test-data', 'annotated-examples.json');

const CODE_DELIMITERS = new Set([
  ' ', '\t', '\n', '\r', '\v', '\f',
  '.', ',', ';', ':', '(', ')', '[', ']', '{', '}',
  '>', '<', '=', '+', '*', '/', '%',
  '&', '|', '^', '~', '"', "'", '`', '\\',
]);

const RETRIEVAL_HOVER_HINTS_PROMPT = `
Analyze the provided HTML code blocks and produce hover hints for relevant code elements.

For each relevant code element:
- Identify all occurrences that refer to the same underlying entity and collect their span data--element-id values.
- Provide concise, high-signal documentation including the element's signature, purpose/behavior, key parameters and return values (if applicable), and notable usage notes.

Include documentation for:
- Classes, functions, methods, variables, types, properties
- Standard library functions (print, open, Math.max, etc.)
- User-defined elements

Exclude:
- Language keywords (def, class, if, return, etc.)
- Built-in types (str, int, float, etc.)
- Common syntax elements
- Elements that are obvious to the user such as \`const hello = "hello"\` or types in a JSON object

Format all output strings should be plain text only. Do not use HTML tags or markdown under any circumstances.
This includes all strings, even those nested in json objects.

Type mapping and fields:
- Use lowercase category identifiers for the documentation type: function, object, variable.
- Map elements: functions and methods → function; classes and objects → object; variables/constants → variable.

For function documentation:
- ALWAYS include the tokenToCssStylingMap field whenever possible.
- This map applies CSS styling (class and/or style attributes) to tokens in the function signature to match the color theme of the code block.
- Extract class and style attributes from the cleaned HTML input for each token that appears in the function signature.
- Only include tokens that are part of the signature itself (function name, parameter names, type names, return type, etc.).
- If a token in the signature doesn't appear in the code block, infer appropriate styling from similar tokens if available.
`;

const HOVER_HINT_SCHEMA = {
  type: "object",
  properties: {
    hoverHintList: {
      type: "array",
      items: {
        type: "object",
        properties: {
          ids: {
            type: "array",
            items: { type: "string" }
          },
          documentation: {
            type: "object",
            properties: {
              type: { type: "string", enum: ["function", "variable", "object"] },
              functionSignature: { type: "string" },
              docString: {
                type: "object",
                properties: {
                  params: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        documentation: { type: "string" }
                      },
                      required: ["name", "documentation"],
                      additionalProperties: false
                    }
                  },
                  returns: {
                    type: "object",
                    properties: {
                      documentation: { type: "string" }
                    },
                    required: ["documentation"],
                    additionalProperties: false
                  }
                },
                required: ["params", "returns"],
                additionalProperties: false
              },
              documentation: { type: "string" },
              tokenToCssStylingMap: {
                type: "object",
                additionalProperties: {
                  type: "object",
                  properties: {
                    class: { type: "string" },
                    style: { type: "string" }
                  },
                  additionalProperties: false
                }
              },
              docInHtml: { type: "string" },
              properties: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    documentation: { type: "string" }
                  },
                  required: ["name", "documentation"],
                  additionalProperties: false
                }
              }
            },
            required: ["type"],
            additionalProperties: false
          }
        },
        required: ["ids", "documentation"],
        additionalProperties: false
      }
    }
  },
  required: ["hoverHintList"],
  additionalProperties: false
};

function generateDeterministicId(index) {
  return `tok_${index.toString(36)}`;
}

function breakIntoTokens(document, elementContent) {
  const fragment = document.createDocumentFragment();

  if (!elementContent.trim()) {
    fragment.appendChild(document.createTextNode(elementContent));
    return fragment;
  }

  let currentToken = [];
  let isTraversingDelimiters = CODE_DELIMITERS.has(elementContent[0]);

  for (const char of elementContent) {
    const stateChanged = isTraversingDelimiters !== CODE_DELIMITERS.has(char);

    if (stateChanged && isTraversingDelimiters) {
      fragment.appendChild(document.createTextNode(currentToken.join('')));
    } else if (stateChanged && !isTraversingDelimiters) {
      const span = document.createElement('span');
      span.setAttribute('data-programmatically-added', 'true');
      span.textContent = currentToken.join('');
      fragment.appendChild(span);
    }

    if (stateChanged) {
      isTraversingDelimiters = !isTraversingDelimiters;
      currentToken = [];
    }

    currentToken.push(char);
  }

  if (currentToken.length > 0 && isTraversingDelimiters) {
    fragment.appendChild(document.createTextNode(currentToken.join('')));
  }

  if (currentToken.length > 0 && !isTraversingDelimiters) {
    const span = document.createElement('span');
    span.setAttribute('data-programmatically-added', 'true');
    span.textContent = currentToken.join('');
    fragment.appendChild(span);
  }

  return fragment;
}

function wrapTokensInSpans(document, element) {
  const childNodes = Array.from(element.childNodes);

  childNodes.forEach((node) => {
    if (node.nodeType === 3 && node.textContent?.trim()) {
      const originalText = node.textContent;
      const tokens = breakIntoTokens(document, originalText);

      if (tokens.childNodes.length > 1) {
        const parent = node.parentNode;
        parent.replaceChild(tokens, node);
      }
    } else if (node.nodeType === 1 && node.nodeName !== 'SPAN') {
      wrapTokensInSpans(document, node);
    }
  });
}

function getDomLeaves(element) {
  return Array.from(element.querySelectorAll('*')).filter(el => el.children.length === 0);
}

function tokenizeAndCleanHtml(html) {
  const dom = new JSDOM(`<div id="root">${html}</div>`);
  const document = dom.window.document;
  const root = document.getElementById('root');
  
  wrapTokensInSpans(document, root);
  
  const leaves = getDomLeaves(root);
  let tokenIndex = 0;
  
  leaves.forEach((leaf) => {
    if (leaf.textContent?.trim()) {
      leaf.setAttribute('data-token-id', generateDeterministicId(tokenIndex));
      tokenIndex++;
    }
  });
  
  let cleanedHtml = root.innerHTML;
  
  const tokenIdPattern = /<[^>]+\s+data-token-id="([^"]+)"[^>]*>/g;
  cleanedHtml = cleanedHtml.replace(tokenIdPattern, (match, tokenId) => {
    const classMatch = /class="([^"]*)"/.exec(match);
    const styleMatch = /style="([^"]*)"/.exec(match);
    
    let result = `<id=${tokenId}`;
    if (classMatch) {
      result += ` class="${classMatch[1]}"`;
    }
    if (styleMatch) {
      result += ` style="${styleMatch[1]}"`;
    }
    result += '/>';
    return result;
  });
  
  cleanedHtml = cleanedHtml.replace(/<\/(?!>)[^>]*>/g, '</>');
  cleanedHtml = cleanedHtml.replace(/<(?!id=|\/?>)[^>]+>/g, '');
  
  return cleanedHtml;
}

async function callLLM(cleanedHtml, apiKey, baseUrl, model) {
  const client = new OpenAI({
    apiKey,
    baseURL: baseUrl,
  });

  const response = await client.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: RETRIEVAL_HOVER_HINTS_PROMPT },
      { role: 'user', content: cleanedHtml }
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        strict: true,
        name: 'hover_hints',
        schema: HOVER_HINT_SCHEMA
      }
    }
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No response from LLM');
  }
  
  return JSON.parse(content);
}

function calculateMetrics(expected, actual) {
  const expectedIds = new Set(expected.flatMap(ann => ann.ids));
  const actualIds = new Set(actual.flatMap(hint => hint.ids));
  
  let truePositives = 0;
  let falsePositives = 0;
  let falseNegatives = 0;
  
  for (const id of actualIds) {
    if (expectedIds.has(id)) {
      truePositives++;
    } else {
      falsePositives++;
    }
  }
  
  for (const id of expectedIds) {
    if (!actualIds.has(id)) {
      falseNegatives++;
    }
  }
  
  const precision = truePositives / (truePositives + falsePositives) || 0;
  const recall = truePositives / (truePositives + falseNegatives) || 0;
  const f1 = 2 * (precision * recall) / (precision + recall) || 0;
  
  let typeMatches = 0;
  let typeTotal = 0;
  
  for (const hint of actual) {
    for (const id of hint.ids) {
      if (expectedIds.has(id)) {
        typeTotal++;
        const expectedAnn = expected.find(ann => ann.ids.includes(id));
        if (expectedAnn && expectedAnn.type === hint.documentation.type) {
          typeMatches++;
        }
      }
    }
  }
  
  const typeAccuracy = typeTotal > 0 ? typeMatches / typeTotal : 0;
  
  return {
    precision,
    recall,
    f1,
    typeAccuracy,
    truePositives,
    falsePositives,
    falseNegatives,
    expectedCount: expectedIds.size,
    actualCount: actualIds.size
  };
}

async function main() {
  const apiKey = process.env.OPENAI_API_KEY;
  const baseUrl = process.env.OPENAI_BASE_URL || 'https://openrouter.ai/api/v1';
  const model = process.env.OPENAI_MODEL || 'x-ai/grok-4.1-fast';

  if (!apiKey) {
    console.error('Error: OPENAI_API_KEY environment variable is required');
    console.error('Usage: OPENAI_API_KEY=your-key node scripts/evaluatePrompt.mjs');
    process.exit(1);
  }

  if (!existsSync(ANNOTATIONS_PATH)) {
    console.error('Error: No annotated examples found at', ANNOTATIONS_PATH);
    console.error('Run the annotation UI first: node scripts/annotateCodeExamples.mjs');
    process.exit(1);
  }

  if (!existsSync(CODE_EXAMPLES_PATH)) {
    console.error('Error: No code examples found at', CODE_EXAMPLES_PATH);
    process.exit(1);
  }

  const codeExamples = JSON.parse(readFileSync(CODE_EXAMPLES_PATH, 'utf-8'));
  const annotations = JSON.parse(readFileSync(ANNOTATIONS_PATH, 'utf-8'));

  const annotationsMap = {};
  annotations.forEach(ann => {
    annotationsMap[ann.url] = ann.expectedAnnotations || [];
  });

  const annotatedExamples = codeExamples.filter(ex => 
    annotationsMap[ex.url] && annotationsMap[ex.url].length > 0
  );

  if (annotatedExamples.length === 0) {
    console.error('Error: No annotated examples found');
    console.error('Annotate some examples first using the annotation UI');
    process.exit(1);
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log('PROMPT EVALUATION');
  console.log('='.repeat(60));
  console.log(`Model: ${model}`);
  console.log(`Base URL: ${baseUrl}`);
  console.log(`Annotated examples: ${annotatedExamples.length}`);
  console.log('='.repeat(60) + '\n');

  const results = [];

  for (let i = 0; i < annotatedExamples.length; i++) {
    const example = annotatedExamples[i];
    const expected = annotationsMap[example.url];
    
    console.log(`[${i + 1}/${annotatedExamples.length}] Evaluating: ${example.url.slice(0, 60)}...`);
    
    try {
      const cleanedHtml = tokenizeAndCleanHtml(example.html);
      const response = await callLLM(cleanedHtml, apiKey, baseUrl, model);
      const actual = response.hoverHintList || [];
      
      const metrics = calculateMetrics(expected, actual);
      results.push({ url: example.url, metrics, expected, actual });
      
      console.log(`  Precision: ${(metrics.precision * 100).toFixed(1)}%, Recall: ${(metrics.recall * 100).toFixed(1)}%, F1: ${(metrics.f1 * 100).toFixed(1)}%`);
      console.log(`  Expected: ${metrics.expectedCount}, Actual: ${metrics.actualCount}, TP: ${metrics.truePositives}, FP: ${metrics.falsePositives}, FN: ${metrics.falseNegatives}`);
    } catch (error) {
      console.log(`  Error: ${error.message}`);
      results.push({ url: example.url, error: error.message });
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log('AGGREGATE RESULTS');
  console.log('='.repeat(60));

  const successfulResults = results.filter(r => r.metrics);
  
  if (successfulResults.length > 0) {
    const avgPrecision = successfulResults.reduce((sum, r) => sum + r.metrics.precision, 0) / successfulResults.length;
    const avgRecall = successfulResults.reduce((sum, r) => sum + r.metrics.recall, 0) / successfulResults.length;
    const avgF1 = successfulResults.reduce((sum, r) => sum + r.metrics.f1, 0) / successfulResults.length;
    const avgTypeAccuracy = successfulResults.reduce((sum, r) => sum + r.metrics.typeAccuracy, 0) / successfulResults.length;
    
    console.log(`\nAverage Precision: ${(avgPrecision * 100).toFixed(1)}%`);
    console.log(`Average Recall:    ${(avgRecall * 100).toFixed(1)}%`);
    console.log(`Average F1 Score:  ${(avgF1 * 100).toFixed(1)}%`);
    console.log(`Type Accuracy:     ${(avgTypeAccuracy * 100).toFixed(1)}%`);
    console.log(`\nSuccessful: ${successfulResults.length}/${results.length}`);
  } else {
    console.log('No successful evaluations');
  }

  console.log('\n' + '='.repeat(60) + '\n');
}

main().catch(console.error);

