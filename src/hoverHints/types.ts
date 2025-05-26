import * as z from 'zod';

export const hoverHintSchema = z.object({
  htmlText: z.string(),
  htmlClass: z.string().optional(),
  docInHtml: z.string(),
});

export const hoverHintListSchema = z.object({
  hoverHintList: z.array(hoverHintSchema)
});

export type HoverHint = z.infer<typeof hoverHintSchema>;

export type HoverHintList = z.infer<typeof hoverHintListSchema>;
