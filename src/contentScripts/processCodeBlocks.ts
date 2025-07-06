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

async function processCodeBlock(state: HoverHintState, llmInterface: LlmInterface, codeBlock: CodeBlock) {
  const hoverHintList = await retrieveAnnotations(codeBlock, llmInterface);
  attachHoverHints(hoverHintList, state);
}

const createCodeBlockProcessingObserver = (hoverHintState: HoverHintState, llmInterface: LlmInterface) => {
  const intersectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const codeBlock = searchForCodeBlockElementIsPartOf(entry.target as HTMLElement);

        if (codeBlock) {
          intersectionObserver.unobserve(entry.target as HTMLElement);
          void processCodeBlock(hoverHintState, llmInterface, codeBlock);
        }
      }
    });
  });

  return intersectionObserver;
};

const setup = () => {
  const llmInterface = createHoverHintRetrievalLlmInterface();

  const hoverHintState = setupHoverHintState();

  const codeBlockTrackingState = setupCodeBlockTracking();

  setupHoverHintTriggers(document, hoverHintState);

  const codeBlockProcessingObserver = createCodeBlockProcessingObserver(hoverHintState, llmInterface);

  return { codeBlockTrackingState, codeBlockProcessingObserver };
};

const processCodeBlocksOnPage = (codeBlockProcessingObserver: IntersectionObserver) => {
  const blocks = findCodeBlocksOnPage(document);

  blocks.forEach((codeBlock) => {
    codeBlockProcessingObserver.observe(codeBlock.html);
  });
};

const setupMutationObserver = (
  codeBlockTrackingState: CodeBlockTrackingState,
  codeBlockProcessingObserver: IntersectionObserver,
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
          codeBlockProcessingObserver.observe(possibleCodeBlock.html);
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

const { codeBlockTrackingState, codeBlockProcessingObserver } = setup();

window.addEventListener('load', () => {
  processCodeBlocksOnPage(codeBlockProcessingObserver);
});

setupMutationObserver(codeBlockTrackingState, codeBlockProcessingObserver);
