export interface FullAPIConfig {
  model: string;
  url: string;
  key: string;
}

export interface OpenRouterAPIConfig {
  key: string;
}

export type ApiKeyConfig = FullAPIConfig | OpenRouterAPIConfig;

export function isFullAPIConfig(config: ApiKeyConfig): config is FullAPIConfig {
  return 'model' in config && 'url' in config && 'key' in config;
}

export function isOpenRouterAPIConfig(config: ApiKeyConfig): config is OpenRouterAPIConfig {
  return 'key' in config && !('model' in config) && !('url' in config);
}
