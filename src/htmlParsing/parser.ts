import { CodeBlockConfig, CodeBlock } from './types';

const CODE_BLOCK_PROCESSED_CLASS_NAME = 'vibey-lsp-processed';

export const findCodeBlocks = (document: Document, config: CodeBlockConfig): CodeBlock[] => {
  const codeBlocks: CodeBlock[] = [];

  config.selectors.forEach((selector) => {
    const elements = document.querySelectorAll(selector.selector);

    elements.forEach((element) => {
      const htmlElement = element as HTMLElement;

      const codeBlock: CodeBlock = {
        html: htmlElement,
      };

      codeBlocks.push(codeBlock);
    });
  });

  return codeBlocks;
};

export const markCodeBlockAsProcessed = (codeBlock: CodeBlock) => {
  codeBlock.html.classList.add(CODE_BLOCK_PROCESSED_CLASS_NAME);
};

export const isCodeBlockProcessed = (codeBlock: CodeBlock) => {
  return codeBlock.html.classList.contains(CODE_BLOCK_PROCESSED_CLASS_NAME);
};
