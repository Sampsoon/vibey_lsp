import { ApiKeyConfig } from './types';
import browser from 'webextension-polyfill';

const enum STORAGE_KEY {
  API_KEY_CONFIG = 'apiKeyConfig',
}

export async function getAPIKeyConfigFromStorage(): Promise<ApiKeyConfig | undefined> {
  const result = await browser.storage.local.get(STORAGE_KEY.API_KEY_CONFIG);
  return result[STORAGE_KEY.API_KEY_CONFIG] as ApiKeyConfig | undefined;
}

export async function saveAPIKeyConfigToStorage(config: ApiKeyConfig) {
  await browser.storage.local.set({ [STORAGE_KEY.API_KEY_CONFIG]: config });
}

export async function deleteAPIKeyConfigFromStorage() {
  await browser.storage.local.remove(STORAGE_KEY.API_KEY_CONFIG);
}
