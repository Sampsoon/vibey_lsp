import { HoverHint, hoverHintListSchema } from '../hoverHints';
import { callLLM } from '../llm';
import { createHoverHintStreamError, createHoverHintStreamMessage } from '../stream';
import { RETRIEVAL_HOVER_HINTS_PROMPT } from './hoverHintRetrieval';
import { isHoverHintRetrievalMessage, ServiceWorkerMessage } from './interface';

const retrieveHoverHintsStream = async (
  codeBlockRawHtml: string,
  onHoverHint: (hoverHint: HoverHint) => void,
  onError: (errorMessage: string) => void,
) => {
  const MAX_RETRIES = 5;
  const RETRY_DELAY = 1000;

  const prompt = RETRIEVAL_HOVER_HINTS_PROMPT(codeBlockRawHtml);

  let currentRetryDelay = RETRY_DELAY;

  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      const hoverHintList = await callLLM.OPEN_ROUTER(prompt, hoverHintListSchema);

      hoverHintList.hoverHintList.forEach((hoverHint) => {
        onHoverHint(hoverHint);
      });
      return;
    } catch (error) {
      console.error('Error retrieving annotations', error);
      await new Promise((resolve) => setTimeout(resolve, currentRetryDelay));
      currentRetryDelay *= 2;
    }
  }

  onError('Failed to retrieve annotations after 5 retries');
};

chrome.runtime.onMessage.addListener((message: ServiceWorkerMessage<unknown>, sender) => {
  if (!isHoverHintRetrievalMessage(message)) {
    return;
  }

  const tabId = sender.tab?.id;

  if (!tabId) {
    console.error('No tab id found');
    return;
  }

  void retrieveHoverHintsStream(
    message.payload.codeBlockRawHtml,
    (hoverHint) => {
      void chrome.tabs.sendMessage(tabId, createHoverHintStreamMessage(hoverHint));
    },
    (errorMessage) => {
      void chrome.tabs.sendMessage(tabId, createHoverHintStreamError(errorMessage));
    },
  );

  return true;
});
