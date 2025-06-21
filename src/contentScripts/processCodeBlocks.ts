import {
  clearCodeBlockTimeoutIfExists,
  CodeBlock,
  CodeBlockTrackingState,
  findCodeBlocksOnPage,
  searchForCodeBlockElementIsPartOf,
  setCodeBlockTimeout,
  setupCodeBlockTracking,
} from '../htmlProcessing';
import { LlmInterface, createHoverHintRetrievalLlmInterface } from '../llm';
import {
  attachHoverHints,
  retrieveAnnotations,
  setupHoverHintState,
  setupHoverHintTriggers,
  HoverHintState,
} from '../hoverHints';

const MS_TO_WAIT_BEFORE_CONSIDERING_CODE_BLOCK_STABLE = 800;

const setup = () => {
  const llmInterface = createHoverHintRetrievalLlmInterface();

  const hoverHintState = setupHoverHintState();

  const codeBlockTrackingState = setupCodeBlockTracking();

  setupHoverHintTriggers(document, hoverHintState);

  return { hoverHintState, codeBlockTrackingState, llmInterface };
};

async function processCodeBlock(state: HoverHintState, llmInterface: LlmInterface, codeBlock: CodeBlock) {
  const hoverHintList = await retrieveAnnotations(codeBlock, llmInterface);
  attachHoverHints(hoverHintList, state);
}

const processAllCodeBlocksOnPageLoad = (hoverHintState: HoverHintState, llmInterface: LlmInterface) => {
  const blocks = findCodeBlocksOnPage(document);

  blocks.forEach((codeBlock) => {
    void processCodeBlock(hoverHintState, llmInterface, codeBlock);
  });
};

const setupMutationObserver = (
  hoverHintState: HoverHintState,
  codeBlockTrackingState: CodeBlockTrackingState,
  llmInterface: LlmInterface,
) => {
  const mutationObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      const target = mutation.target;

      const element = target.nodeType === Node.ELEMENT_NODE ? (target as HTMLElement) : target.parentElement;

      const possibleCodeBlock = element ? searchForCodeBlockElementIsPartOf(element) : null;

      if (!possibleCodeBlock) {
        return;
      }

      const { codeBlockId } = possibleCodeBlock;

      clearCodeBlockTimeoutIfExists(codeBlockTrackingState, codeBlockId);

      setCodeBlockTimeout(
        codeBlockTrackingState,
        codeBlockId,
        () => {
          console.log('Code block processed');
          void processCodeBlock(hoverHintState, llmInterface, possibleCodeBlock);
        },
        MS_TO_WAIT_BEFORE_CONSIDERING_CODE_BLOCK_STABLE,
      );
    });
  });

  mutationObserver.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });

  return mutationObserver;
};

const { hoverHintState, codeBlockTrackingState, llmInterface } = setup();

window.addEventListener('load', () => {
  processAllCodeBlocksOnPageLoad(hoverHintState, llmInterface);
});

setupMutationObserver(hoverHintState, codeBlockTrackingState, llmInterface);
