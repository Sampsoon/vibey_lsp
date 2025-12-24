import browser from 'webextension-polyfill';
import processCodeBlocksPath from '../contentScripts/processCodeBlocks.ts?script';
import { ContentScriptMatchConfig } from '../../permissions';

const PROCESS_CODE_BLOCKS_SCRIPT_ID = 'process-code-blocks';

export async function registerProcessCodeBlocksScript(matchConfig: ContentScriptMatchConfig) {
  await browser.scripting.unregisterContentScripts({ ids: [PROCESS_CODE_BLOCKS_SCRIPT_ID] }).catch(() => undefined);

  if (matchConfig.matches.length === 0) {
    return;
  }

  await browser.scripting.registerContentScripts([
    {
      id: PROCESS_CODE_BLOCKS_SCRIPT_ID,
      matches: matchConfig.matches,
      excludeMatches: matchConfig.excludeMatches.length > 0 ? matchConfig.excludeMatches : undefined,
      js: [processCodeBlocksPath],
      runAt: 'document_idle',
    },
  ]);
}
