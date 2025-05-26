import { CodeBlockConfig, CodeBlock } from './types';

export const findCodeBlocks = (
  document: Document, 
  config: CodeBlockConfig
): CodeBlock[] => {
  const codeBlocks: CodeBlock[] = [];
  
  config.selectors.forEach(selector => {
    const elements = document.querySelectorAll(selector.selector);
    
    elements.forEach(element => {
      const htmlElement = element as HTMLElement;
      
      const codeBlock: CodeBlock = {
        html: htmlElement
      };
      
      codeBlocks.push(codeBlock);
    });
  });
  
  return codeBlocks;
};