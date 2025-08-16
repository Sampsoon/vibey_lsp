import * as z from 'zod';
import { Id } from '../htmlProcessing';

const TOKEN_TYPES = {
  FUNCTION: 'function',
  OBJECT: 'object',
  VARIABLE: 'variable',
} as const;

const functionDocumentationSchema = z.object({
  type: z.literal(TOKEN_TYPES.FUNCTION).describe('Designates the documentation as function documentation'),
  docString: z
    .string()
    .optional()
    .describe(
      `Documentation for the function signature.
      This includes arguments and a explanation of what they are used for.
      This should also include the return values when the function returns something.
      Please include any nuances of the function signature such as if a value is inclusive or exclusive, if something is mutated by the function, etc so that nothing is ambiguous.
      Should follow the format:
      <argument name>: <explanation of what it is used for>
      <argument name> - <explanation of what it is used for>
      ...
      <return value>: <explanation of what it is used for>
      Do not include an documentation outside the values being returned or the arguments being passed in.
      These should be short and concise. Only include this if the information is not obvious to the user.
      Never include a subset of the function signature, only the full signature or none.`,
    ),
  functionSignature: z
    .string()
    .describe('The function signature. This should cover function return type and types for the arguments'),
  documentation: z.string().optional()
    .describe(`An explanations of the nuances of how the function is used and it's expected behavior.
      This should be between 1 and 15 lines.
      It should be a short summary of what you would typically find online.
      It should be concise and to the point.
      Feel free to add examples of how the function is used, but do not become overly verbose.
      Only include this if the information is not obvious to the user.`),
});

export type FunctionDocumentation = z.infer<typeof functionDocumentationSchema>;

const objectDocumentationSchema = z.object({
  type: z.literal(TOKEN_TYPES.OBJECT),
  docInHtml: z.string(),
});

export type ObjectDocumentation = z.infer<typeof objectDocumentationSchema>;

const variableDocumentationSchema = z.object({
  type: z.literal(TOKEN_TYPES.VARIABLE),
  docInHtml: z.string(),
});

export type VariableDocumentation = z.infer<typeof variableDocumentationSchema>;

export const hoverHintDocumentation = z.union([
  functionDocumentationSchema,
  objectDocumentationSchema,
  variableDocumentationSchema,
]);

export const isFunctionDocumentation = (
  documentation: HoverHintDocumentation,
): documentation is FunctionDocumentation => {
  return documentation.type === TOKEN_TYPES.FUNCTION;
};

export const isObjectDocumentation = (documentation: HoverHintDocumentation): documentation is ObjectDocumentation => {
  return documentation.type === TOKEN_TYPES.OBJECT;
};

export const isVariableDocumentation = (
  documentation: HoverHintDocumentation,
): documentation is VariableDocumentation => {
  return documentation.type === TOKEN_TYPES.VARIABLE;
};

export const hoverHintSchema = z.object({
  ids: z.array(z.string()),
  documentation: hoverHintDocumentation,
});

export const hoverHintListSchema = z.object({
  hoverHintList: z.array(hoverHintSchema),
});

export type HoverHintDocumentation = z.infer<typeof hoverHintDocumentation>;
export type HoverHint = z.infer<typeof hoverHintSchema>;

export type HoverHintList = z.infer<typeof hoverHintListSchema>;

export const NO_TIMEOUT_ACTIVE = 'Not Timeout Active';
export type NoTimeoutActive = typeof NO_TIMEOUT_ACTIVE;

export type TimeoutId = number | NoTimeoutActive;

export interface HoverHintState {
  hoverHintMap: Map<Id, string>;
  tooltip: HTMLElement;
  timeoutId: TimeoutId;
}
