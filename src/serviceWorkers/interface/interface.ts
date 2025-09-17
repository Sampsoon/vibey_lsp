import { HoverHint } from '../../hoverHints';
import { CodeBlock } from '../../htmlProcessing';
import { isHoverHintStreamError, isHoverHintStreamMessage } from '../../stream';
import { ServiceWorkerMessageType, HoverHintRetrievalMessage } from './types';
import browser from 'webextension-polyfill';

export const invokeHoverHintRetrievalServiceWorker = async (codeBlock: CodeBlock) => {
  const message: HoverHintRetrievalMessage = {
    type: ServiceWorkerMessageType.HOVER_HINT_RETRIEVAL,
    payload: {
      codeBlockRawHtml: codeBlock.html.innerHTML,
    },
  };

  await browser.runtime.sendMessage(message);
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

  browser.runtime.onMessage.addListener(messageListener);
};
