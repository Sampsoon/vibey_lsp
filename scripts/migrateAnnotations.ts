import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { JSDOM } from 'jsdom';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ANNOTATIONS_PATH = join(__dirname, '..', 'test-data', 'annotated-examples.json');

interface TokenizedExample {
  url: string;
  tokenizedHtml: string;
}

interface TokenInfo {
  id: string;
  text: string;
  charStart: number;
  charEnd: number;
}

interface Annotation {
  url: string;
  expectedAnnotations: ExpectedAnnotation[];
}

interface ExpectedAnnotation {
  ids: string[];
  type: string;
}

interface MigrationWarning {
  url: string;
  oldId: string;
  newIds: string[];
  reason: string;
}

function extractTokens(html: string): TokenInfo[] {
  const dom = new JSDOM(`<div id="root">${html}</div>`);
  const doc = dom.window.document;
  const root = doc.getElementById('root')!;

  const tokens: TokenInfo[] = [];
  let charPosition = 0;

  function traverse(node: Node) {
    if (node.nodeType === 3) {
      const text = node.textContent || '';
      charPosition += text.length;
    } else if (node.nodeType === 1) {
      const element = node as Element;
      const tokenId = element.getAttribute('data-token-id');

      if (tokenId && element.textContent?.trim()) {
        const text = element.textContent;
        tokens.push({
          id: tokenId,
          text,
          charStart: charPosition,
          charEnd: charPosition + text.length,
        });
      }

      for (const child of Array.from(node.childNodes)) {
        traverse(child);
      }
    }
  }

  traverse(root);
  return tokens;
}

function findOverlappingTokens(
  oldToken: TokenInfo,
  newTokens: TokenInfo[],
): { newIds: string[]; isPartialOverlap: boolean } {
  const overlapping: TokenInfo[] = [];

  for (const newToken of newTokens) {
    const overlapStart = Math.max(oldToken.charStart, newToken.charStart);
    const overlapEnd = Math.min(oldToken.charEnd, newToken.charEnd);

    if (overlapStart < overlapEnd) {
      overlapping.push(newToken);
    }
  }

  if (overlapping.length === 0) {
    return { newIds: [], isPartialOverlap: false };
  }

  const combinedStart = Math.min(...overlapping.map((t) => t.charStart));
  const combinedEnd = Math.max(...overlapping.map((t) => t.charEnd));
  const isPartialOverlap = combinedStart !== oldToken.charStart || combinedEnd !== oldToken.charEnd;

  return {
    newIds: overlapping.map((t) => t.id),
    isPartialOverlap,
  };
}

function buildIdMapping(
  oldTokens: TokenInfo[],
  newTokens: TokenInfo[],
): { mapping: Map<string, string[]>; warnings: { oldId: string; newIds: string[]; reason: string }[] } {
  const mapping = new Map<string, string[]>();
  const warnings: { oldId: string; newIds: string[]; reason: string }[] = [];

  for (const oldToken of oldTokens) {
    const { newIds, isPartialOverlap } = findOverlappingTokens(oldToken, newTokens);

    if (newIds.length === 0) {
      warnings.push({
        oldId: oldToken.id,
        newIds: [],
        reason: `No matching tokens found for "${oldToken.text}"`,
      });
    } else if (isPartialOverlap) {
      warnings.push({
        oldId: oldToken.id,
        newIds,
        reason: `Partial overlap for "${oldToken.text}" -> mapped to ${newIds.length} token(s)`,
      });
    }

    mapping.set(oldToken.id, newIds);
  }

  return { mapping, warnings };
}

function parseArgs(): { oldPath: string; newPath: string } {
  const args = process.argv.slice(2);
  let oldPath = '';
  let newPath = '';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--old' && args[i + 1]) {
      oldPath = args[i + 1];
      i++;
    } else if (args[i] === '--new' && args[i + 1]) {
      newPath = args[i + 1];
      i++;
    }
  }

  if (!oldPath || !newPath) {
    console.error('Usage: tsx migrateAnnotations.ts --old <old-tokenized-file> --new <new-tokenized-file>');
    process.exit(1);
  }

  return { oldPath, newPath };
}

function main() {
  const { oldPath, newPath } = parseArgs();

  console.log('Loading tokenized files...');
  const oldTokenized: TokenizedExample[] = JSON.parse(readFileSync(oldPath, 'utf-8'));
  const newTokenized: TokenizedExample[] = JSON.parse(readFileSync(newPath, 'utf-8'));
  const annotations: Annotation[] = JSON.parse(readFileSync(ANNOTATIONS_PATH, 'utf-8'));

  const oldByUrl = new Map(oldTokenized.map((e) => [e.url, e]));
  const newByUrl = new Map(newTokenized.map((e) => [e.url, e]));

  const allWarnings: MigrationWarning[] = [];
  let updatedCount = 0;

  for (const annotation of annotations) {
    const oldExample = oldByUrl.get(annotation.url);
    const newExample = newByUrl.get(annotation.url);

    if (!oldExample || !newExample) {
      console.warn(`Skipping ${annotation.url}: missing from tokenized files`);
      continue;
    }

    const oldTokens = extractTokens(oldExample.tokenizedHtml);
    const newTokens = extractTokens(newExample.tokenizedHtml);

    const { mapping, warnings } = buildIdMapping(oldTokens, newTokens);

    for (const warning of warnings) {
      allWarnings.push({ url: annotation.url, ...warning });
    }

    for (const expectedAnnotation of annotation.expectedAnnotations) {
      const newIds: string[] = [];

      for (const oldId of expectedAnnotation.ids) {
        const mappedIds = mapping.get(oldId);
        if (mappedIds && mappedIds.length > 0) {
          newIds.push(...mappedIds);
        } else {
          console.warn(`  Warning: No mapping found for ${oldId} in ${annotation.url}`);
        }
      }

      const uniqueNewIds = [...new Set(newIds)];

      if (uniqueNewIds.length > 0) {
        expectedAnnotation.ids = uniqueNewIds;
        updatedCount++;
      }
    }
  }

  writeFileSync(ANNOTATIONS_PATH, JSON.stringify(annotations, null, 2));
  console.log(`\nUpdated ${updatedCount} annotations in ${ANNOTATIONS_PATH}`);

  if (allWarnings.length > 0) {
    console.log('\n=== WARNINGS (may need manual review) ===\n');
    for (const warning of allWarnings) {
      console.log(`URL: ${warning.url}`);
      console.log(`  Old ID: ${warning.oldId}`);
      console.log(`  New IDs: ${warning.newIds.join(', ') || 'none'}`);
      console.log(`  Reason: ${warning.reason}`);
      console.log('');
    }
    console.log(`Total warnings: ${allWarnings.length}`);
  } else {
    console.log('\nNo warnings - all tokens mapped cleanly!');
  }
}

main();
