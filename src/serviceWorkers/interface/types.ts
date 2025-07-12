export const enum ServiceWorkerMessageType {
  TEXT_LLM_INTERFACING = 'textLlmInterfacing',
}

export interface ServiceWorkerMessage<T> {
  type: ServiceWorkerMessageType;
  payload: T;
}
