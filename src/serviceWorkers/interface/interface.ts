import { HoverHint } from '../../hoverHints';
import { CodeBlock } from '../../htmlProcessing';
import { isHoverHintStreamError, isHoverHintStreamMessage } from '../../stream';
import { ServiceWorkerMessageType, HoverHintRetrievalMessage } from './types';

export const invokeHoverHintRetrievalServiceWorker = async (codeBlock: CodeBlock) => {
  const message: HoverHintRetrievalMessage = {
    type: ServiceWorkerMessageType.HOVER_HINT_RETRIEVAL,
    payload: {
      codeBlockRawHtml: codeBlock.html.innerHTML,
    },
  };

  await chrome.runtime.sendMessage(message);
};

export const listenForHoverHintsFromServiceWorker = (processHoverHint: (hoverHint: HoverHint) => void) => {
  const messageListener = (msg: unknown) => {
    if (isHoverHintStreamMessage(msg)) {
      processHoverHint(msg.hoverHint);
      return;
    }

    if (isHoverHintStreamError(msg)) {
      console.error(msg.errorMessage);
    }
  };

  chrome.runtime.onMessage.addListener(messageListener);
};
