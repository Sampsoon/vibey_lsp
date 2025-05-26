import * as z from 'zod';

export interface LlmInterface {
  callLlmForJsonOutput<T>(
    prompt: string,
    schema: z.ZodSchema<T>
  ): Promise<T>;
}
