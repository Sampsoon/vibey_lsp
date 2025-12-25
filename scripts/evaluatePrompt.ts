import { readFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

import {
  RETRIEVAL_HOVER_HINTS_PROMPT,
  cleanHoverHintRetrievalHtml,
} from '../src/coreFunctionality/serviceWorker/hoverHintRetrieval';
import { hoverHintListSchema, hoverHintSchema, HoverHint } from '../src/coreFunctionality/hoverHints';
import { callLLMWithConfig, LlmParams } from '../src/coreFunctionality/llm';
import { parseListOfObjectsFromStream } from '../src/coreFunctionality/stream';
import { DEFAULT_MODEL, OPEN_ROUTER_API_URL, APIConfig } from '../src/storage';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TOKENIZED_EXAMPLES_PATH = join(__dirname, '..', 'test-data', 'tokenized-examples.json');
const ANNOTATIONS_PATH = join(__dirname, '..', 'test-data', 'annotated-examples.json');

interface TokenizedExample {
  url: string;
  tokenizedHtml: string;
}

interface Annotation {
  url: string;
  expectedAnnotations: ExpectedAnnotation[];
}

interface ExpectedAnnotation {
  ids: string[];
  type: string;
}

async function invokeHoverHintRetrieval(cleanedHtml: string, config: APIConfig): Promise<HoverHint[]> {
  const llmParams: LlmParams = {
    prompt: RETRIEVAL_HOVER_HINTS_PROMPT,
    schema: hoverHintListSchema,
  };

  const hints: HoverHint[] = [];
  const onParsedElement = parseListOfObjectsFromStream(hoverHintSchema, (hint) => {
    hints.push(hint);
  });

  await callLLMWithConfig(cleanedHtml, llmParams, config, onParsedElement);

  return hints;
}

interface Metrics {
  precision: number;
  recall: number;
  f1: number;
  typeAccuracy: number;
  truePositives: number;
  falsePositives: number;
  falseNegatives: number;
  expectedCount: number;
  actualCount: number;
}

function calculateMetrics(expected: ExpectedAnnotation[], actual: HoverHint[]): Metrics {
  const expectedIds = new Set(expected.flatMap((ann) => ann.ids));
  const actualIds = new Set(actual.flatMap((hint) => hint.ids));

  let truePositives = 0;
  let falsePositives = 0;
  let falseNegatives = 0;

  for (const id of actualIds) {
    if (expectedIds.has(id)) {
      truePositives++;
    } else {
      falsePositives++;
    }
  }

  for (const id of expectedIds) {
    if (!actualIds.has(id)) {
      falseNegatives++;
    }
  }

  const precision = truePositives / (truePositives + falsePositives) || 0;
  const recall = truePositives / (truePositives + falseNegatives) || 0;
  const f1 = (2 * (precision * recall)) / (precision + recall) || 0;

  let typeMatches = 0;
  let typeTotal = 0;

  for (const hint of actual) {
    for (const id of hint.ids) {
      if (expectedIds.has(id)) {
        typeTotal++;
        const expectedAnn = expected.find((ann) => ann.ids.includes(id));
        if (expectedAnn && expectedAnn.type === hint.documentation.type) {
          typeMatches++;
        }
      }
    }
  }

  const typeAccuracy = typeTotal > 0 ? typeMatches / typeTotal : 0;

  return {
    precision,
    recall,
    f1,
    typeAccuracy,
    truePositives,
    falsePositives,
    falseNegatives,
    expectedCount: expectedIds.size,
    actualCount: actualIds.size,
  };
}

interface EvalResult {
  url: string;
  metrics?: Metrics;
  expected?: ExpectedAnnotation[];
  actual?: HoverHint[];
  error?: string;
}

async function main() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.error('Error: OPENAI_API_KEY environment variable is required');
    console.error('Usage: OPENAI_API_KEY=your-key pnpm evaluate');
    process.exit(1);
  }

  const config: APIConfig = {
    key: apiKey,
    url: OPEN_ROUTER_API_URL,
    model: DEFAULT_MODEL,
  };

  if (!existsSync(ANNOTATIONS_PATH)) {
    console.error('Error: No annotated examples found at', ANNOTATIONS_PATH);
    console.error('Run the annotation UI first: pnpm annotate');
    process.exit(1);
  }

  if (!existsSync(TOKENIZED_EXAMPLES_PATH)) {
    console.error('Error: No tokenized examples found at', TOKENIZED_EXAMPLES_PATH);
    console.error('Run the tokenization script first: pnpm tokenize');
    process.exit(1);
  }

  const tokenizedExamples: TokenizedExample[] = JSON.parse(readFileSync(TOKENIZED_EXAMPLES_PATH, 'utf-8'));
  const annotations: Annotation[] = JSON.parse(readFileSync(ANNOTATIONS_PATH, 'utf-8'));

  const annotationsMap: Record<string, ExpectedAnnotation[]> = {};
  annotations.forEach((ann) => {
    annotationsMap[ann.url] = ann.expectedAnnotations || [];
  });

  const annotatedExamples = tokenizedExamples.filter(
    (ex) => annotationsMap[ex.url] && annotationsMap[ex.url].length > 0,
  );

  if (annotatedExamples.length === 0) {
    console.error('Error: No annotated examples found');
    console.error('Annotate some examples first using the annotation UI');
    process.exit(1);
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log('PROMPT EVALUATION');
  console.log('='.repeat(60));
  console.log(`Model: ${config.model}`);
  console.log(`Base URL: ${config.url}`);
  console.log(`Annotated examples: ${annotatedExamples.length}`);
  console.log('='.repeat(60) + '\n');

  const results: EvalResult[] = [];

  for (let i = 0; i < annotatedExamples.length; i++) {
    const example = annotatedExamples[i];
    const expected = annotationsMap[example.url];

    console.log(`[${i + 1}/${annotatedExamples.length}] Evaluating: ${example.url.slice(0, 60)}...`);

    try {
      const cleanedHtml = cleanHoverHintRetrievalHtml(example.tokenizedHtml);
      const actual = await invokeHoverHintRetrieval(cleanedHtml, config);

      const metrics = calculateMetrics(expected, actual);
      results.push({ url: example.url, metrics, expected, actual });

      console.log(
        `  Precision: ${(metrics.precision * 100).toFixed(1)}%, Recall: ${(metrics.recall * 100).toFixed(1)}%, F1: ${(metrics.f1 * 100).toFixed(1)}%`,
      );
      console.log(
        `  Expected: ${metrics.expectedCount}, Actual: ${metrics.actualCount}, TP: ${metrics.truePositives}, FP: ${metrics.falsePositives}, FN: ${metrics.falseNegatives}`,
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log(`  Error: ${errorMessage}`);
      results.push({ url: example.url, error: errorMessage });
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log('AGGREGATE RESULTS');
  console.log('='.repeat(60));

  const successfulResults = results.filter((r) => r.metrics);

  if (successfulResults.length > 0) {
    const avgPrecision = successfulResults.reduce((sum, r) => sum + r.metrics!.precision, 0) / successfulResults.length;
    const avgRecall = successfulResults.reduce((sum, r) => sum + r.metrics!.recall, 0) / successfulResults.length;
    const avgF1 = successfulResults.reduce((sum, r) => sum + r.metrics!.f1, 0) / successfulResults.length;
    const avgTypeAccuracy =
      successfulResults.reduce((sum, r) => sum + r.metrics!.typeAccuracy, 0) / successfulResults.length;

    console.log(`\nAverage Precision: ${(avgPrecision * 100).toFixed(1)}%`);
    console.log(`Average Recall:    ${(avgRecall * 100).toFixed(1)}%`);
    console.log(`Average F1 Score:  ${(avgF1 * 100).toFixed(1)}%`);
    console.log(`Type Accuracy:     ${(avgTypeAccuracy * 100).toFixed(1)}%`);
    console.log(`\nSuccessful: ${successfulResults.length}/${results.length}`);
  } else {
    console.log('No successful evaluations');
  }

  console.log('\n' + '='.repeat(60) + '\n');
}

main().catch(console.error);
