import { callLLM } from '../llm';
import { ServiceWorkerMessage, ServiceWorkerMessageType } from './interface';

export interface TextLlmInterfacingPayload {
  prompt: string;
  llmCall: keyof typeof callLLM;
  schema: Record<string, unknown>;
}

export interface TextLlmInterfacingMessage extends ServiceWorkerMessage<TextLlmInterfacingPayload> {
  type: ServiceWorkerMessageType.TEXT_LLM_INTERFACING;
  payload: TextLlmInterfacingPayload;
}

const isTextLlmInterfacingMessage = (message: ServiceWorkerMessage<unknown>): message is TextLlmInterfacingMessage => {
  // TODO: Delete eslint rule once more message types are added
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  return message.type === ServiceWorkerMessageType.TEXT_LLM_INTERFACING;
};

chrome.runtime.onMessage.addListener((message: ServiceWorkerMessage<unknown>, _sender, sendResponse) => {
  console.log('Message received:', message);

  if (!isTextLlmInterfacingMessage(message)) {
    return;
  }

  // TODO

  sendResponse({ received: true });
});
