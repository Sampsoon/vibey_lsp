const MIN_WIDTH = '320px';

export const applyHoverHintStyle = (styles: CSSStyleDeclaration) => {
  styles.position = 'fixed';
  styles.background = 'white';
  styles.color = 'black';
  styles.borderRadius = '4px';
  styles.width = 'max-content';
  styles.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
  styles.zIndex = '999999';
  styles.pointerEvents = 'none';
  styles.border = '1px solid #ccc';
  styles.boxSizing = 'border-box';
};

export const hideElement = (element: HTMLElement) => {
  element.style.display = 'none';
};

export const applyTextContainerStyle = (styles: CSSStyleDeclaration) => {
  styles.minWidth = MIN_WIDTH;
  styles.whiteSpace = 'pre-wrap';
  styles.overflowWrap = 'break-word';
  styles.padding = '6px';
};

export const applyPrimaryTextStyle = (styles: CSSStyleDeclaration) => {
  styles.color = '#000';
};

export const applySecondaryTextStyle = (styles: CSSStyleDeclaration) => {
  styles.color = '#666';
};

export const applyCodeContainerStyle = (styles: CSSStyleDeclaration) => {
  styles.padding = '6px';
  styles.background = '#f5f5f5';
  styles.whiteSpace = 'pre';
  styles.minWidth = MIN_WIDTH;
  styles.padding = '8px';
};

export const applyCodeTextStyle = (styles: CSSStyleDeclaration) => {
  styles.fontFamily = 'monospace';
  styles.fontSize = '12px';
};

export const setWidth = (element: HTMLElement, width: number) => {
  element.style.width = width.toString() + 'px';
};
