import OpenAI from 'openai';
import { API_KEYS } from './tempApiKeys';
import { createOpenAiClientInterface } from './llmInvocation';

const openAiClient = new OpenAI({
  apiKey: API_KEYS.OPENAI,
});

const geminiClient = new OpenAI({
  apiKey: API_KEYS.GEMINI,
  baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
});

const openRouterClient = new OpenAI({
  apiKey: API_KEYS.OPEN_ROUTER,
  baseURL: 'https://openrouter.ai/api/v1',
});

export const callLLM = {
  GPT_4_1: createOpenAiClientInterface(openAiClient, 'gpt-4.1-2025-04-14'),
  GEMINI_2_5_FLASH: createOpenAiClientInterface(geminiClient, 'gemini-2.5-flash-preview-05-20'),
  OPEN_ROUTER: createOpenAiClientInterface(openRouterClient, 'google/gemini-2.5-flash-preview-05-20'),
} as const;
