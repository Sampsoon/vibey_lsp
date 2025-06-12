import { CODE_SELECTORS } from '../htmlParsing';
import { findCodeBlocks, isCodeBlockProcessed, markCodeBlockAsProcessed } from '../htmlParsing/parser';
import { OpenAI } from 'openai';
import { createOpenAiInterface, LlmInterface } from '../llm';
import { attachHoverHints, retrieveAnnotations, setupHoverHintState, setupHoverHintTriggers } from '../hoverHints';
import { OPENAI_API_KEY } from '../tempApiKey';
import { HoverHintState } from '../hoverHints/hoverHintAttachment';

const setup = () => {
  const client = new OpenAI({
    apiKey: OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
  });

  const llmInterface = createOpenAiInterface(client, 'gpt-4.1-2025-04-14');

  const state = setupHoverHintState();
  setupHoverHintTriggers(document, state);

  return { state, llmInterface };
};

async function run(state: HoverHintState, llmInterface: LlmInterface) {
  console.log('Standard code block processing script running...');

  const blocks = findCodeBlocks(document, { selectors: Object.values(CODE_SELECTORS) });

  const unprocessedBlocks = blocks.filter((b) => !isCodeBlockProcessed(b));

  await Promise.all(
    unprocessedBlocks.map(async (b) => {
      markCodeBlockAsProcessed(b);
      const hoverHintList = await retrieveAnnotations(b, llmInterface);
      attachHoverHints(hoverHintList, state);
    }),
  );

  console.log('Standard code block processing script completed.');
}

console.log('Standard code block processing script invoked...');

const { state, llmInterface } = setup();

// Timeout to ensure the DOM is fully loaded
setTimeout(() => {
  void run(state, llmInterface);
}, 1000);
