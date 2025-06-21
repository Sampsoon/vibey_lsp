import { getOrAddIdToCodeBlock } from './codeBlocks';
import { CODE_SELECTORS, CodeBlock } from './types';

const queryAllSelectorsSelector = Object.values(CODE_SELECTORS)
  .map((selector) => selector.selector)
  .join(', ');

export const searchForCodeBlockElementIsPartOf = (element: Element): CodeBlock | null => {
  const codeBlockElement = element.closest(queryAllSelectorsSelector) as HTMLElement | undefined;

  if (codeBlockElement) {
    const codeBlockId = getOrAddIdToCodeBlock(codeBlockElement);
    return {
      html: codeBlockElement,
      codeBlockId,
    };
  }

  return null;
};

export const findCodeBlocksOnPage = (document: Document): CodeBlock[] => {
  const elements = document.querySelectorAll(queryAllSelectorsSelector);

  return Array.from(elements).map((element: Element) => {
    const htmlElement = element as HTMLElement;

    const codeBlockId = getOrAddIdToCodeBlock(htmlElement);

    return {
      html: htmlElement,
      codeBlockId,
    };
  });
};
