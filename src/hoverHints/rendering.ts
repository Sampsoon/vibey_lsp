import {
  applyCodeContainerStyle,
  applyCodeTextStyle,
  applyPrimaryTextStyle,
  applySecondaryTextStyle,
  applyBottomMarginStyle,
  applyTextContainerStyle,
  applyTopMarginStyle,
  applySemiBoldTextStyle,
  MarginSize,
  createDocStringCommandElement,
  DocStringCommand,
} from './styles';
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
  PropertyDocString,
} from './types';

// Used to prevent cross-site scripting attacks
function sanitizeHtml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderSignatureAsHtml(signature: string) {
  const sanitizedSignature = sanitizeHtml(signature);

  const signatureElement = document.createElement('div');

  applyCodeTextStyle(signatureElement.style);
  applyCodeContainerStyle(signatureElement.style);
  applyTopMarginStyle(signatureElement.style);
  applyBottomMarginStyle(signatureElement.style, MarginSize.LARGE);

  signatureElement.innerHTML = sanitizedSignature;

  return signatureElement;
}

function renderParamDocStringAsHtml(docString: ParamDocString) {
  const name = sanitizeHtml(docString.name);
  const documentation = sanitizeHtml(docString.documentation);
  const div = document.createElement('div');

  applyPrimaryTextStyle(div.style);
  applyBottomMarginStyle(div.style);

  const nameSpan = document.createElement('span');
  applySemiBoldTextStyle(nameSpan.style);
  nameSpan.textContent = name;

  div.innerHTML = ` ${createDocStringCommandElement(DocStringCommand.PARAM)} ${nameSpan.outerHTML} — ${documentation}`;
  return div.outerHTML;
}

function renderReturnDocStringAsHtml(docString: ReturnDocString) {
  const documentation = sanitizeHtml(docString.documentation);
  const div = document.createElement('div');
  applyPrimaryTextStyle(div.style);
  applyBottomMarginStyle(div.style);
  div.innerHTML = ` ${createDocStringCommandElement(DocStringCommand.RETURN)} — ${documentation}`;
  return div.outerHTML;
}

function renderPropertyDocStringAsHtml(docString: PropertyDocString) {
  const name = sanitizeHtml(docString.name);
  const documentation = sanitizeHtml(docString.documentation);
  const div = document.createElement('div');

  applyPrimaryTextStyle(div.style);
  applyBottomMarginStyle(div.style);

  const nameSpan = document.createElement('span');
  applySemiBoldTextStyle(nameSpan.style);
  nameSpan.textContent = name;

  div.innerHTML = ` ${createDocStringCommandElement(DocStringCommand.PROPERTY)} ${nameSpan.outerHTML} — ${documentation}`;
  return div.outerHTML;
}

function renderDocStringAsHtml(docString: DocString) {
  const docStringElement = document.createElement('div');

  applySecondaryTextStyle(docStringElement.style);
  applyTextContainerStyle(docStringElement.style);

  const params = docString.params.map((param) => renderParamDocStringAsHtml(param));
  const returns = renderReturnDocStringAsHtml(docString.returns);
  const renderedText = `${params.join('')}${returns}`;
  docStringElement.innerHTML = renderedText;

  return docStringElement;
}

function renderPropertiesAsHtml(properties: PropertyDocString[]) {
  const propertiesElement = document.createElement('div');

  applySecondaryTextStyle(propertiesElement.style);
  applyTextContainerStyle(propertiesElement.style);

  const renderedProperties = properties.map((property) => renderPropertyDocStringAsHtml(property));
  propertiesElement.innerHTML = renderedProperties.join('');

  return propertiesElement;
}

function renderFunctionDocumentationTextAsHtml(documentation: string) {
  const sanitizedDocumentation = sanitizeHtml(documentation);
  const documentationElement = document.createElement('div');

  applyPrimaryTextStyle(documentationElement.style);
  applyTextContainerStyle(documentationElement.style);
  applyBottomMarginStyle(documentationElement.style);

  documentationElement.innerHTML = sanitizedDocumentation;

  return documentationElement;
}

function renderObjectDocumentationTextAsHtml(documentation: string) {
  const sanitizedDocumentation = sanitizeHtml(documentation);
  const documentationElement = document.createElement('div');

  applyPrimaryTextStyle(documentationElement.style);
  applyTextContainerStyle(documentationElement.style);
  applyBottomMarginStyle(documentationElement.style);

  documentationElement.innerHTML = sanitizedDocumentation;

  return documentationElement;
}

function renderFunctionDocumentationAsHtml(documentation: FunctionDocumentation) {
  const hoverHintElement = document.createElement('div');

  const signatureElement = renderSignatureAsHtml(documentation.functionSignature);
  hoverHintElement.appendChild(signatureElement);

  if (documentation.docString) {
    const docStringElement = renderDocStringAsHtml(documentation.docString);
    hoverHintElement.appendChild(docStringElement);
  }

  if (documentation.documentation) {
    const documentationElement = renderFunctionDocumentationTextAsHtml(documentation.documentation);
    hoverHintElement.appendChild(documentationElement);
  }

  const renderedElement = hoverHintElement.outerHTML;
  hoverHintElement.remove();

  return renderedElement;
}

function renderObjectDocumentationAsHtml(documentation: ObjectDocumentation) {
  const hoverHintElement = document.createElement('div');

  if (documentation.docInHtml) {
    const documentationElement = renderObjectDocumentationTextAsHtml(documentation.docInHtml);
    hoverHintElement.appendChild(documentationElement);
  }

  if (documentation.properties) {
    const propertiesElement = renderPropertiesAsHtml(documentation.properties);
    hoverHintElement.appendChild(propertiesElement);
  }

  const renderedElement = hoverHintElement.outerHTML;
  hoverHintElement.remove();

  return renderedElement;
}

function renderVariableDocumentationAsHtml(documentation: VariableDocumentation) {
  const body = sanitizeHtml(documentation.docInHtml);
  const container = document.createElement('div');
  applyTextContainerStyle(container.style);

  const contentDiv = document.createElement('div');
  applyPrimaryTextStyle(contentDiv.style);
  contentDiv.innerHTML = body;

  container.appendChild(contentDiv);
  return container.outerHTML;
}

export function renderDocumentationAsHtml(documentation: HoverHintDocumentation) {
  console.log('rendering documentation', documentation);

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
}
