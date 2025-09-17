import { HoverHint, hoverHintListSchema, hoverHintSchema } from '../hoverHints';
import { callLLM, LlmParams } from '../llm';
import { createHoverHintStreamError, createHoverHintStreamMessage, parseListOfObjectsFromStream } from '../stream';
import { cleanHoverHintRetrievalHtml, RETRIEVAL_HOVER_HINTS_PROMPT } from './hoverHintRetrieval';
import { isHoverHintRetrievalMessage, isServiceWorkerMessage } from './interface';
import browser from 'webextension-polyfill';

const retrieveHoverHintsStream = async (
  codeBlockRawHtml: string,
  onHoverHint: (hoverHint: HoverHint) => void,
  onError: (errorMessage: string) => void,
) => {
  const MAX_RETRIES = 5;
  const RETRY_DELAY = 1000;

  const llmParams: LlmParams = {
    prompt: RETRIEVAL_HOVER_HINTS_PROMPT,
    schema: hoverHintListSchema,
  };

  const cleanedHtml = cleanHoverHintRetrievalHtml(codeBlockRawHtml);

  let currentRetryDelay = RETRY_DELAY;

  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      const onParsedElement = parseListOfObjectsFromStream(hoverHintSchema, onHoverHint);

      await callLLM.OPEN_ROUTER(cleanedHtml, llmParams, onParsedElement);

      return;
    } catch (error) {
      console.error('Error retrieving annotations', error);
      await new Promise((resolve) => setTimeout(resolve, currentRetryDelay));
      currentRetryDelay *= 2;
    }
  }

  onError('Failed to retrieve annotations after 5 retries');
};

browser.runtime.onMessage.addListener((message: unknown, sender: browser.Runtime.MessageSender) => {
  if (!isServiceWorkerMessage(message) || !isHoverHintRetrievalMessage(message)) {
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
      void browser.tabs.sendMessage(tabId, createHoverHintStreamMessage(hoverHint));
    },
    (errorMessage) => {
      void browser.tabs.sendMessage(tabId, createHoverHintStreamError(errorMessage));
    },
  );
});
