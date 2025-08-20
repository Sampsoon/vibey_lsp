import {
  HoverHintDocumentation,
  isVariableDocumentation,
  isObjectDocumentation,
  isFunctionDocumentation,
  FunctionDocumentation,
  DocString,
  ParamDocString,
  ReturnDocString,
  ObjectDocumentation,
  VariableDocumentation,
} from './types';

const MIN_WIDTH = '320px';

const CONTAINER_STYLE =
  'font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; line-height: 1.5;';

const PRIMARY_TEXT_STYLE = 'margin: 0 0 8px 0; white-space: pre-wrap; word-wrap: break-word;';

const SECONDARY_TEXT_STYLE = 'color: #666; white-space: pre-wrap; word-wrap: break-word;';

const CODE_CONTAINER_STYLE = `margin: 0 0 8px 0; padding: 8px; background: #f5f5f5; border: 1px solid #ddd; border-radius: 4px; white-space: pre; display: inline-block; min-width: ${MIN_WIDTH};`;

const CODE_TEXT_STYLE = 'font-family: monospace; font-size: 12px;';

// Used to prevent cross-site scripting attacks
const sanitizeHtml = (value: string) => {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
};

const renderParamDocStringAsHtml = (docString: ParamDocString) => {
  const name = sanitizeHtml(docString.name);
  const documentation = sanitizeHtml(docString.documentation);
  return `<div style="${PRIMARY_TEXT_STYLE}">@Param ${name}: ${documentation}</div>`;
};

const renderReturnDocStringAsHtml = (docString: ReturnDocString) => {
  const documentation = sanitizeHtml(docString.documentation);
  return `<div style="${PRIMARY_TEXT_STYLE}">@Return: ${documentation}</div>`;
};

const renderDocStringAsHtml = (docString: DocString) => {
  const params = docString.params.map((param) => renderParamDocStringAsHtml(param));
  const returns = renderReturnDocStringAsHtml(docString.returns);
  return `${params.join('')}${returns}`;
};

const renderFunctionDocumentationAsHtml = (documentation: FunctionDocumentation) => {
  const docString = documentation.docString ? renderDocStringAsHtml(documentation.docString) : '';
  const rawSignature = documentation.functionSignature;
  const signature = sanitizeHtml(rawSignature);
  const details = documentation.documentation ? sanitizeHtml(documentation.documentation) : '';

  const longestLineChars = rawSignature.split('\n').reduce((max, line) => {
    if (line.length > max) {
      return line.length;
    }
    return max;
  }, 0);

  const wrapperWidth = `max(${MIN_WIDTH}, ${String(longestLineChars)}ch)`;
  const containerStyleWithWidth = `${CONTAINER_STYLE} display: inline-block; width: ${wrapperWidth}; min-width: ${MIN_WIDTH};`;

  const signatureHtml = `<pre style="${CODE_CONTAINER_STYLE}"><code style="${CODE_TEXT_STYLE}">${signature}</code></pre>`;
  const docStringHtml = docString ? `<div style="${SECONDARY_TEXT_STYLE}">${docString}</div>` : '';
  const detailsHtml = details ? `<div style="${PRIMARY_TEXT_STYLE}">${details}</div>` : '';

  return `<div style="${containerStyleWithWidth}">${signatureHtml}${docStringHtml}${detailsHtml}</div>`;
};

const renderObjectDocumentationAsHtml = (documentation: ObjectDocumentation) => {
  const body = sanitizeHtml(documentation.docInHtml);
  return `<div style="${CONTAINER_STYLE}"><div style="${PRIMARY_TEXT_STYLE}">${body}</div></div>`;
};

const renderVariableDocumentationAsHtml = (documentation: VariableDocumentation) => {
  const body = sanitizeHtml(documentation.docInHtml);
  return `<div style="${CONTAINER_STYLE}"><div style="${PRIMARY_TEXT_STYLE}">${body}</div></div>`;
};

export const renderDocumentationAsHtml = (documentation: HoverHintDocumentation) => {
  if (isFunctionDocumentation(documentation)) {
    return renderFunctionDocumentationAsHtml(documentation);
  }

  if (isObjectDocumentation(documentation)) {
    return renderObjectDocumentationAsHtml(documentation);
  }

  if (isVariableDocumentation(documentation)) {
    return renderVariableDocumentationAsHtml(documentation);
  }

  console.error('Unknown documentation type', documentation);
  return undefined;
};
