export const enum ServiceWorkerMessageType {
  HOVER_HINT_RETRIEVAL = 'hoverHintRetrieval',
}

export interface ServiceWorkerMessage<T> {
  type: ServiceWorkerMessageType;
  payload: T;
}

export interface HoverHintRetrievalPayload {
  codeBlockRawHtml: string;
}

export interface HoverHintRetrievalMessage extends ServiceWorkerMessage<HoverHintRetrievalPayload> {
  type: ServiceWorkerMessageType.HOVER_HINT_RETRIEVAL;
  payload: HoverHintRetrievalPayload;
}

export const isHoverHintRetrievalMessage = (
  message: ServiceWorkerMessage<unknown>,
): message is HoverHintRetrievalMessage => {
  // TODO: Delete eslint rule once more message types are added
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  return message.type === ServiceWorkerMessageType.HOVER_HINT_RETRIEVAL;
};
