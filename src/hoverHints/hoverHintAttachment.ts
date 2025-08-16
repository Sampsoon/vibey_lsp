import { CODE_TOKEN_ID_NAME, Id, IdToCodeTokenMap } from '../htmlProcessing';
import {
  NO_TIMEOUT_ACTIVE,
  TimeoutId,
  NoTimeoutActive,
  HoverHintState,
  HoverHint,
  HoverHintDocumentation,
  isVariableDocumentation,
  isObjectDocumentation,
  isFunctionDocumentation,
  FunctionDocumentation,
} from './types';

const MOUSE_EVENTS = {
  MOUSE_ENTER: 'mouseenter',
  MOUSE_LEAVE: 'mouseleave',
} as const;

const isNoTimeoutActive = (timeoutId: TimeoutId): timeoutId is NoTimeoutActive => {
  return timeoutId === NO_TIMEOUT_ACTIVE;
};

const clearTimeoutIfActive = (state: HoverHintState) => {
  if (!isNoTimeoutActive(state.timeoutId)) {
    clearTimeout(state.timeoutId);
    state.timeoutId = NO_TIMEOUT_ACTIVE;
  }
};

export const setupHoverHintState = (): HoverHintState => {
  return {
    hoverHintMap: new Map<Id, string>(),
    tooltip: createTooltip(),
    timeoutId: NO_TIMEOUT_ACTIVE,
  };
};

export const setupHoverHintTriggers = (element_to_listen_on: Document | HTMLElement, state: HoverHintState) => {
  element_to_listen_on.addEventListener(
    MOUSE_EVENTS.MOUSE_ENTER,
    (event) => {
      onMouseEnterCodeToken(event as MouseEvent, state);
    },
    true,
  );

  element_to_listen_on.addEventListener(
    MOUSE_EVENTS.MOUSE_LEAVE,
    (event) => {
      onMouseLeaveCodeToken(event as MouseEvent, state);
    },
    true,
  );
};

// Used to prevent cross-site scripting attacks
const sanitizeHtml = (value: string) => {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
};

const getContainerStyle = () => {
  return 'font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, Apple Color Emoji, Segoe UI Emoji; line-height: 1.5; color: #111827;';
};

const getPrimaryTextStyle = () => {
  return 'margin: 0 0 8px 0; color: #111827; white-space: pre-wrap;';
};

const getSecondaryTextStyle = () => {
  return 'color: #374151; white-space: pre-wrap;';
};

const getCodeBlockStyle = () => {
  return 'margin: 0 0 8px 0; padding: 8px; background: #f7f7f8; border: 1px solid #e5e7eb; border-radius: 6px; white-space: pre-wrap; overflow-x: auto;';
};

const getCodeStyle = () => {
  return 'font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace; font-size: 12px; color: #111827;';
};

const renderFunctionDocumentationAsHtml = (documentation: FunctionDocumentation) => {
  const docString = documentation.docString ? sanitizeHtml(documentation.docString) : '';
  const signature = sanitizeHtml(documentation.functionSignature);
  const details = documentation.documentation ? sanitizeHtml(documentation.documentation) : '';

  return `
      <div style="${getContainerStyle()}">
        ${docString ? `<div style="${getPrimaryTextStyle()}">${docString}</div>` : ''}
        <pre style="${getCodeBlockStyle()}"><code style="${getCodeStyle()}">${signature}</code></pre>
        ${details ? `<div style="${getSecondaryTextStyle()}">${details}</div>` : ''}
      </div>
    </div>
  `;
};

const renderPlainTextDocumentationAsHtml = (text: string) => {
  const body = sanitizeHtml(text);
  return `
    <div style="${getContainerStyle()}">
      <div style="${getSecondaryTextStyle()}">${body}</div>
    </div>
  `;
};

const renderDocumentationAsHtml = (documentation: HoverHintDocumentation) => {
  if (isFunctionDocumentation(documentation)) {
    return renderFunctionDocumentationAsHtml(documentation);
  }

  if (isObjectDocumentation(documentation)) {
    return renderPlainTextDocumentationAsHtml(documentation.docInHtml);
  }

  if (isVariableDocumentation(documentation)) {
    return renderPlainTextDocumentationAsHtml(documentation.docInHtml);
  }

  console.error('Unknown documentation type', documentation);
  return undefined;
};

export const attachHoverHint = (hoverHint: HoverHint, state: HoverHintState, idToCodeTokenMap: IdToCodeTokenMap) => {
  const { ids, documentation } = hoverHint;
  const renderedHtml = renderDocumentationAsHtml(documentation);

  if (!renderedHtml) {
    return;
  }

  ids.forEach((id) => {
    state.hoverHintMap.set(id, renderedHtml);

    const codeToken = idToCodeTokenMap.get(id);
    if (codeToken) {
      addEffectToCodeToken(codeToken);
    } else {
      console.error(`Code token with id ${id} not found in idToCodeTokenMap`);
    }
  });
};

const addEffectToCodeToken = (htmlElement: HTMLElement) => {
  htmlElement.style.textDecoration = 'underline dotted';
};

const isHTMLElement = (target: EventTarget | null): target is HTMLElement => {
  return target instanceof HTMLElement;
};

const onMouseEnterCodeToken = (event: MouseEvent, state: HoverHintState) => {
  const target = event.target;

  if (!isHTMLElement(target)) {
    return;
  }

  const tokenId = target.dataset[CODE_TOKEN_ID_NAME];

  if (!tokenId || !state.hoverHintMap.has(tokenId)) {
    return;
  }

  clearTimeoutIfActive(state);

  const renderedHtml = state.hoverHintMap.get(tokenId);

  if (renderedHtml) {
    showTooltip(renderedHtml, event, state);
  }
};

const onMouseLeaveCodeToken = (event: MouseEvent, state: HoverHintState) => {
  const target = event.target;

  if (!isHTMLElement(target)) {
    return;
  }

  const tokenId = target.dataset[CODE_TOKEN_ID_NAME];

  if (!tokenId || !state.hoverHintMap.has(tokenId)) {
    return;
  }

  clearTimeoutIfActive(state);

  setHideTooltipTimeout(state);
};

const createTooltip = (): HTMLElement => {
  const tooltip = document.createElement('div');
  tooltip.className = 'vibey-tooltip';
  tooltip.style.cssText = `
      position: fixed;
      background: white;
      color: black;
      padding: 8px 12px;
      border-radius: 4px;
      max-width: 400px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      z-index: 999999;
      display: none;
      pointer-events: none;
      border: 1px solid #ccc;
    `;

  document.body.appendChild(tooltip);
  return tooltip;
};

const showTooltip = (html: string, event: MouseEvent, state: HoverHintState) => {
  state.tooltip.innerHTML = html;
  positionTooltip(state.tooltip, event.target as HTMLElement);
  state.tooltip.style.display = 'block';
};

const setHideTooltipTimeout = (state: HoverHintState) => {
  state.timeoutId = window.setTimeout(() => {
    state.tooltip.style.display = 'none';
  }, 300);
};

const positionTooltip = (tooltip: HTMLElement, element: HTMLElement) => {
  const PADDING = 10;

  const { innerWidth: viewportWidth, innerHeight: viewportHeight } = window;

  const elementRect = element.getBoundingClientRect();

  let left = elementRect.left;
  let top = elementRect.bottom + PADDING;

  const { tooltipWidth, tooltipHeight } = getTooltipDimensions(tooltip);

  if (left + tooltipWidth > viewportWidth) {
    left = elementRect.right - tooltipWidth;
  }

  if (top + tooltipHeight > viewportHeight) {
    top = elementRect.top - tooltipHeight - PADDING;
  }

  left = Math.max(PADDING, Math.min(left, viewportWidth - tooltipWidth - PADDING));
  top = Math.max(PADDING, Math.min(top, viewportHeight - tooltipHeight - PADDING));

  tooltip.style.left = `${left.toString()}px`;
  tooltip.style.top = `${top.toString()}px`;
};

const getTooltipDimensions = (tooltip: HTMLElement) => {
  const originalDisplay = tooltip.style.display;
  const originalVisibility = tooltip.style.visibility;

  tooltip.style.visibility = 'hidden';
  tooltip.style.display = 'block';

  const { width: tooltipWidth, height: tooltipHeight } = tooltip.getBoundingClientRect();

  tooltip.style.display = originalDisplay;
  tooltip.style.visibility = originalVisibility;

  return { tooltipWidth, tooltipHeight };
};
