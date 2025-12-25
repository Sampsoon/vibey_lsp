import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
(global as any).document = dom.window.document;
(global as any).window = dom.window;
(global as any).HTMLElement = dom.window.HTMLElement;
(global as any).Node = dom.window.Node;

const { attachIdsToTokens, setupIdToElementMapping } = await import('../src/coreFunctionality/htmlProcessing');
import type { CodeBlock } from '../src/coreFunctionality/htmlProcessing';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CODE_EXAMPLES_PATH = join(__dirname, '..', 'test-data', 'code-examples.json');
const TOKENIZED_EXAMPLES_PATH = join(__dirname, '..', 'test-data', 'tokenized-examples.json');

interface CodeExample {
  url: string;
  html: string;
}

interface TokenizedExample {
  url: string;
  tokenizedHtml: string;
}

function tokenizeHtml(html: string): string {
  const container = document.createElement('div');
  container.innerHTML = html;

  const codeBlock: CodeBlock = {
    html: container as unknown as HTMLElement,
    codeBlockId: 'test',
  };

  const idMappings = setupIdToElementMapping();
  attachIdsToTokens(codeBlock, idMappings);

  return container.innerHTML;
}

function main() {
  const codeExamples: CodeExample[] = JSON.parse(readFileSync(CODE_EXAMPLES_PATH, 'utf-8'));

  const tokenizedExamples: TokenizedExample[] = codeExamples.map((example) => {
    console.log(`Tokenizing: ${example.url}`);
    return {
      url: example.url,
      tokenizedHtml: tokenizeHtml(example.html),
    };
  });

  writeFileSync(TOKENIZED_EXAMPLES_PATH, JSON.stringify(tokenizedExamples, null, 2));
  console.log(`\nWritten ${tokenizedExamples.length} tokenized examples to ${TOKENIZED_EXAMPLES_PATH}`);
}

main();
