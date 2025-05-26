import { OpenAI } from "openai";
import * as z from 'zod';
import { zodToJsonSchema } from "zod-to-json-schema";
import type { LlmInterface } from './types';

export const createOpenAiInterface = (client: OpenAI, model: string): LlmInterface => {
  return {
    callLlmForJsonOutput: async <T>(prompt: string, schema: z.ZodSchema<T>) => {
      const jsonSchema = zodToJsonSchema(schema);
      const response = await client.chat.completions.create({
        model,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              }
            ]
          }
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: "extracted_json_data",
            schema: jsonSchema,
          }
        }
      });
      const rawContent = response.choices[0]?.message?.content;

      if (!rawContent) {
        throw new Error("No content received from LLM");
      }

      return schema.parse(JSON.parse(rawContent));
    }
  }
}