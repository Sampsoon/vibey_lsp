import browser from 'webextension-polyfill';
import { WebsiteFilterConfig, WebsiteFilterMode } from '../storage';
import { ContentScriptMatchConfig } from './types';

export function getMatchConfigFromWebsiteFilter(config: WebsiteFilterConfig): ContentScriptMatchConfig {
  if (config.mode === WebsiteFilterMode.ALLOW_ALL) {
    return {
      matches: ['<all_urls>'],
      excludeMatches: config.blockList,
    };
  }
  return {
    matches: config.allowList.length > 0 ? config.allowList : [],
    excludeMatches: [],
  };
}

export async function requestPermissionsForMatchConfig(matchConfig: ContentScriptMatchConfig): Promise<boolean> {
  if (matchConfig.matches.length === 0) {
    return true;
  }

  const result = await browser.permissions.request({ origins: matchConfig.matches });
  return result;
}
