import { CODE_BLOCK_ALREADY_PROCESSED, CodeBlockStabilityTimer, CodeBlockTrackingState } from './types';

const CODE_BLOCK_ID_ATTRIBUTE_NAME = 'codeBlockId';

export const addIdToCodeBlock = (element: HTMLElement) => {
  const id = crypto.randomUUID();
  element.dataset[CODE_BLOCK_ID_ATTRIBUTE_NAME] = id;
  return id;
};

export const getIdFromCodeBlock = (element: HTMLElement) => {
  return element.dataset[CODE_BLOCK_ID_ATTRIBUTE_NAME];
};

export const setupCodeBlockTracking = (): CodeBlockTrackingState => {
  return {
    codeBlockLookupTable: new Map<string, CodeBlockStabilityTimer>(),
  };
};

export const clearCodeBlockTimeoutIfExists = (codeBlockTrackingState: CodeBlockTrackingState, id: string) => {
  if (!codeBlockTrackingState.codeBlockLookupTable.has(id)) {
    console.warn('Code block not found in lookup table');
    return;
  }

  const timeout = codeBlockTrackingState.codeBlockLookupTable.get(id);

  if (timeout === CODE_BLOCK_ALREADY_PROCESSED) {
    return;
  }

  clearTimeout(timeout);
};

export const setCodeBlockTimeout = (
  codeBlockTrackingState: CodeBlockTrackingState,
  id: string,
  callback: () => void,
  timeout: number,
) => {
  const timeoutId = window.setTimeout(() => {
    callback();
    codeBlockTrackingState.codeBlockLookupTable.set(id, CODE_BLOCK_ALREADY_PROCESSED);
  }, timeout);

  codeBlockTrackingState.codeBlockLookupTable.set(id, timeoutId);
};
