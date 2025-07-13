import { HoverHint } from '../hoverHints';

const enum StreamMessageType {
  HOVER_HINT_CHUNK = 'hoverHint',
  HOVER_HINT_ERROR = 'hoverHintError',
}

interface StreamMessage {
  type: StreamMessageType;
}

const isStreamMessage = (message: unknown): message is StreamMessage => {
  return typeof message === 'object' && message !== null && 'type' in message;
};

export interface HoverHintStreamMessage extends StreamMessage {
  type: StreamMessageType.HOVER_HINT_CHUNK;
  hoverHint: HoverHint;
}

export const isHoverHintStreamMessage = (message: unknown): message is HoverHintStreamMessage => {
  return isStreamMessage(message) && message.type === StreamMessageType.HOVER_HINT_CHUNK;
};

export const createHoverHintStreamMessage = (hoverHint: HoverHint): HoverHintStreamMessage => {
  return {
    type: StreamMessageType.HOVER_HINT_CHUNK,
    hoverHint,
  };
};

export interface HoverHintStreamError extends StreamMessage {
  type: StreamMessageType.HOVER_HINT_ERROR;
  errorMessage: string;
}

export const isHoverHintStreamError = (message: unknown): message is HoverHintStreamError => {
  return isStreamMessage(message) && message.type === StreamMessageType.HOVER_HINT_ERROR;
};

export const createHoverHintStreamError = (errorMessage: string): HoverHintStreamError => {
  return {
    type: StreamMessageType.HOVER_HINT_ERROR,
    errorMessage,
  };
};
