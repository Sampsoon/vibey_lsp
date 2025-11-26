import { Json } from '../shared';

export interface CustomAPIConfig {
  model: string;
  url: string;
  key: string;
  additionalArguments?: Json;
}

export interface OpenRouterAPIConfig {
  key: string;
}

export type APIConfig = CustomAPIConfig;

export enum APIProvider {
  OPEN_ROUTER = 'OpenRouter',
  CUSTOM = 'Custom',
}

export type SettingsTab = 'api' | 'websites' | 'contact';
