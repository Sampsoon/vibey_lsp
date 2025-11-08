import { saveAPIKeyConfigToStorage, getAPIKeyConfigFromStorage } from './storage';
import { isOpenRouterAPIConfig, isFullAPIConfig, FullAPIConfig, ApiKeyConfig } from './types';

export const DEFAULT_MODEL = 'x-ai/grok-4-fast';
export const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1';

const DEV_ENVIRONMENT_API_KEYS = {
  OPEN_ROUTER: import.meta.env.VITE_OPEN_ROUTER_API_KEY,
} as const;

export async function saveAPIKeyConfig(config: ApiKeyConfig): Promise<void> {
  await saveAPIKeyConfigToStorage(config);
}

export async function getAPIKeyConfig(): Promise<FullAPIConfig | undefined> {
  const config = await getAPIKeyConfigFromStorage();

  if (config && isFullAPIConfig(config)) {
    return config;
  }

  if (config && isOpenRouterAPIConfig(config)) {
    return {
      model: DEFAULT_MODEL,
      url: OPENROUTER_API_URL,
      key: config.key,
    };
  }

  if (DEV_ENVIRONMENT_API_KEYS.OPEN_ROUTER) {
    return {
      model: DEFAULT_MODEL,
      url: OPENROUTER_API_URL,
      key: DEV_ENVIRONMENT_API_KEYS.OPEN_ROUTER,
    };
  }

  return undefined;
}
