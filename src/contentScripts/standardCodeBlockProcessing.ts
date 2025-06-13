import { CODE_SELECTORS } from '../htmlParsing';
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

// --------------------------CLEAN UP GROSS CODE BELOW-----------------------------------
// TODO: clean up this code

async function processCodeBlock(state: HoverHintState, llmInterface: LlmInterface, element: Element) {
  const codeBlock = { html: element as HTMLElement };

  const hoverHintList = await retrieveAnnotations(codeBlock, llmInterface);
  attachHoverHints(hoverHintList, state);
}

const { state, llmInterface } = setup();

const STABILITY_DELAY = 800;

const ALREADY_PROCESSED = 'Already Processed';
type AlreadyProcessed = typeof ALREADY_PROCESSED;

type CodeBlockStablityTimer = number | AlreadyProcessed;

const codeBlockTracking = new Map<string, CodeBlockStablityTimer>();

const addIdToCodeBlock = (element: Element) => {
  const id = crypto.randomUUID();
  element.setAttribute('data--code-block-id', id);
  return id;
};

const getIdFromCodeBlock = (element: Element) => {
  return element.getAttribute('data--code-block-id');
};

const debugObserver = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    const target = mutation.target;
    const element = target.nodeType === Node.ELEMENT_NODE ? (target as Element) : target.parentElement;

    const possibleCodeBlock = searchForCodeBlock(element);

    if (!possibleCodeBlock) {
      return;
    }

    let id = getIdFromCodeBlock(possibleCodeBlock);

    if (id) {
      clearTimeout(codeBlockTracking.get(id));
      if (codeBlockTracking.get(id) === ALREADY_PROCESSED) {
        return;
      }
    } else {
      id = addIdToCodeBlock(possibleCodeBlock);
    }

    const timeout = window.setTimeout(() => {
      console.log('Code block processed');

      codeBlockTracking.set(id, ALREADY_PROCESSED);

      void processCodeBlock(state, llmInterface, possibleCodeBlock);
    }, STABILITY_DELAY);

    codeBlockTracking.set(id, timeout);
  });
});

const searchForCodeBlock = (element: Element | null): Element | null => {
  if (!element) {
    return null;
  }

  const codeBlockSelector = Object.values(CODE_SELECTORS).find((selector) => element.closest(selector.selector));

  if (codeBlockSelector) {
    return element.closest(codeBlockSelector.selector);
  }

  return null;
};

debugObserver.observe(document.body, {
  childList: true,
  subtree: true,
  characterData: true,
});
