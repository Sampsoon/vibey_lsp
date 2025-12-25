/**
 * Code Examples Annotation UI
 *
 * AI-generated code (Claude)
 *
 * A local web server for annotating which tokens in code examples should receive
 * documentation from the LLM. Uses the same tokenization logic as the Chrome extension.
 *
 * What it does:
 * - Loads code examples from test-data/code-examples.json
 * - Renders each code block with clickable tokens (same tokenization as extension)
 * - Allows selecting groups of tokens that should have documentation
 * - Allows specifying the documentation type (function/variable/object)
 * - Saves annotations to test-data/annotated-examples.json
 *
 * Usage:
 *   cd scripts && pnpm run annotate
 *   # Then open http://localhost:3457 in your browser
 *
 * Token selection:
 *   - Click a token to start a new group
 *   - Shift+click to add tokens to the current group
 *   - Select the documentation type from the dropdown
 *   - Click "Save Group" to save the current selection
 *
 * Output: test-data/annotated-examples.json
 */

import { createServer, IncomingMessage, ServerResponse } from 'http';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { JSDOM } from 'jsdom';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TOKENIZED_EXAMPLES_PATH = join(__dirname, '..', 'test-data', 'tokenized-examples.json');
const ANNOTATIONS_PATH = join(__dirname, '..', 'test-data', 'annotated-examples.json');
const PORT = 3457;

interface TokenizedExample {
  url: string;
  tokenizedHtml: string;
}

interface Annotation {
  ids: string[];
  type: 'function' | 'variable' | 'object';
}

interface AnnotationEntry {
  url: string;
  expectedAnnotations: Annotation[];
}

function loadTokenizedExamples(): TokenizedExample[] {
  if (!existsSync(TOKENIZED_EXAMPLES_PATH)) {
    return [];
  }
  return JSON.parse(readFileSync(TOKENIZED_EXAMPLES_PATH, 'utf-8'));
}

function loadAnnotations(): AnnotationEntry[] {
  if (!existsSync(ANNOTATIONS_PATH)) {
    return [];
  }
  return JSON.parse(readFileSync(ANNOTATIONS_PATH, 'utf-8'));
}

function saveAnnotationsToFile(annotations: AnnotationEntry[]): void {
  writeFileSync(ANNOTATIONS_PATH, JSON.stringify(annotations, null, 2));
}

function addClickHandlersToTokenizedHtml(tokenizedHtml: string, existingAnnotations: Annotation[] = []): string {
  const dom = new JSDOM(`<div id="root">${tokenizedHtml}</div>`);
  const document = dom.window.document;
  const root = document.getElementById('root')!;

  const annotatedIdsWithType = new Map<string, string>();
  existingAnnotations.forEach((ann) => {
    ann.ids.forEach((id) => annotatedIdsWithType.set(id, ann.type));
  });

  const tokensWithIds = root.querySelectorAll('[data-token-id]');

  tokensWithIds.forEach((element) => {
    const tokenId = element.getAttribute('data-token-id');
    if (tokenId) {
      element.classList.add('token');
      element.setAttribute('onclick', `selectToken('${tokenId}', event)`);

      const annotationType = annotatedIdsWithType.get(tokenId);
      if (annotationType) {
        element.classList.add('annotated');
        element.classList.add(`annotated-${annotationType}`);
      }
    }
  });

  return root.innerHTML;
}

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Code Annotation UI</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 1400px;
      margin: 0 auto;
      padding: 20px;
      background: #0d1117;
      color: #c9d1d9;
    }
    h1 { color: #58a6ff; margin-bottom: 8px; }
    .subtitle { color: #8b949e; margin-bottom: 24px; }
    
    .progress {
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 6px;
      padding: 16px;
      margin-bottom: 24px;
    }
    .progress-bar {
      height: 8px;
      background: #30363d;
      border-radius: 4px;
      overflow: hidden;
      margin-top: 8px;
    }
    .progress-fill {
      height: 100%;
      background: #238636;
      transition: width 0.3s;
    }
    
    .nav-buttons {
      display: flex;
      gap: 12px;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }
    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
    }
    .btn-primary { background: #238636; color: white; }
    .btn-primary:hover { background: #2ea043; }
    .btn-secondary { background: #21262d; color: #c9d1d9; border: 1px solid #30363d; }
    .btn-secondary:hover { background: #30363d; }
    .btn-danger { background: #da3633; color: white; }
    .btn-danger:hover { background: #f85149; }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
    
    .main-content {
      display: grid;
      grid-template-columns: 1fr 350px;
      gap: 24px;
    }
    
    .code-section {
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 6px;
      padding: 20px;
    }
    .code-url {
      color: #58a6ff;
      font-size: 14px;
      margin-bottom: 16px;
      word-break: break-all;
    }
    .code-block {
      font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
      font-size: 14px;
      line-height: 1.6;
      white-space: pre-wrap;
      overflow-x: auto;
    }
    .code-block .token {
      cursor: pointer;
      padding: 2px 0;
      border-radius: 2px;
    }
    .code-block .token:hover {
      background: rgba(88, 166, 255, 0.2);
    }
    .code-block .token.selected {
      background: rgba(35, 134, 54, 0.4);
      outline: 1px solid #238636;
    }
    .code-block .token.annotated {
      text-decoration: underline dotted #8b949e;
    }
    .code-block .token.annotated-function {
      background: rgba(163, 113, 247, 0.3);
      text-decoration: underline solid #a371f7;
    }
    .code-block .token.annotated-variable {
      background: rgba(88, 166, 255, 0.3);
      text-decoration: underline solid #58a6ff;
    }
    .code-block .token.annotated-object {
      background: rgba(240, 136, 62, 0.3);
      text-decoration: underline solid #f0883e;
    }
    
    .sidebar {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .panel {
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 6px;
      padding: 16px;
    }
    .panel-title {
      font-weight: 600;
      margin-bottom: 12px;
      color: #c9d1d9;
    }
    
    .current-selection {
      min-height: 60px;
    }
    .selected-tokens {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .selected-token {
      background: #238636;
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-family: monospace;
    }
    
    .type-selector {
      display: flex;
      gap: 8px;
      margin-bottom: 12px;
    }
    .type-btn {
      flex: 1;
      padding: 8px;
      border: 2px solid #30363d;
      background: #21262d;
      color: #8b949e;
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
    }
    .type-btn:hover { border-color: #58a6ff; }
    .type-btn.active { border-color: #238636; color: #c9d1d9; background: rgba(35, 134, 54, 0.2); }
    .type-btn.function.active { border-color: #a371f7; background: rgba(163, 113, 247, 0.2); }
    .type-btn.variable.active { border-color: #58a6ff; background: rgba(88, 166, 255, 0.2); }
    .type-btn.object.active { border-color: #f0883e; background: rgba(240, 136, 62, 0.2); }
    
    .saved-annotations {
      max-height: 300px;
      overflow-y: auto;
    }
    .annotation-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px;
      background: #21262d;
      border-radius: 4px;
      margin-bottom: 8px;
    }
    .annotation-type {
      font-size: 11px;
      padding: 2px 6px;
      border-radius: 3px;
      font-weight: 500;
    }
    .annotation-type.function { background: #a371f7; color: white; }
    .annotation-type.variable { background: #58a6ff; color: white; }
    .annotation-type.object { background: #f0883e; color: white; }
    .annotation-tokens {
      font-family: monospace;
      font-size: 12px;
      color: #8b949e;
      flex: 1;
      margin-left: 8px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .annotation-delete {
      background: none;
      border: none;
      color: #f85149;
      cursor: pointer;
      padding: 4px;
    }
    
    .toast {
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 12px 20px;
      background: #238636;
      color: white;
      border-radius: 6px;
      display: none;
      z-index: 1000;
    }
    .toast.error { background: #da3633; }
    .toast.show { display: block; }
    
    .no-examples {
      text-align: center;
      padding: 40px;
      color: #8b949e;
    }
  </style>
</head>
<body>
  <h1>Code Annotation UI</h1>
  <p class="subtitle">Select tokens that should receive documentation from the LLM</p>
  
  <div class="progress">
    <div>
      <span id="progressText">Loading...</span>
    </div>
    <div class="progress-bar">
      <div class="progress-fill" id="progressFill" style="width: 0%"></div>
    </div>
  </div>
  
  <div class="nav-buttons">
    <button class="btn btn-secondary" onclick="prevExample()" id="prevBtn">← Previous</button>
    <button class="btn btn-secondary" onclick="nextExample()" id="nextBtn">Next →</button>
    <button class="btn btn-secondary" onclick="nextUnannotated()" id="nextUnanBtn">Next Unannotated →</button>
    <button class="btn btn-secondary" onclick="skipNoTokens()">Skip - No tokens</button>
    <button class="btn btn-primary" onclick="saveAndNext()">Save & Next</button>
  </div>
  
  <div class="main-content">
    <div class="code-section">
      <div class="code-url" id="codeUrl"></div>
      <div class="code-block" id="codeBlock"></div>
    </div>
    
    <div class="sidebar">
      <div class="panel current-selection">
        <div class="panel-title">Current Selection</div>
        <div class="selected-tokens" id="selectedTokens">
          <span style="color: #8b949e; font-size: 13px;">Click tokens to select them. Shift+click to add to selection.</span>
        </div>
      </div>
      
      <div class="panel">
        <div class="panel-title">Documentation Type</div>
        <div class="type-selector">
          <button class="type-btn function" onclick="setType('function')">function</button>
          <button class="type-btn variable" onclick="setType('variable')">variable</button>
          <button class="type-btn object" onclick="setType('object')">object</button>
        </div>
        <div style="display: flex; gap: 8px; margin-bottom: 12px;">
          <button class="btn btn-primary" onclick="saveGroup()" style="flex: 1;">Save Group</button>
          <button class="btn btn-secondary" onclick="clearSelection()">Clear</button>
        </div>
        <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; color: #8b949e; cursor: pointer;">
          <input type="checkbox" id="autoAdvance" checked> Auto-advance after save
        </label>
      </div>
      
      <div class="panel saved-annotations">
        <div class="panel-title">Saved Annotations</div>
        <div id="annotationsList"></div>
      </div>
    </div>
  </div>
  
  <div class="toast" id="toast"></div>
  
  <script>
    let examples = [];
    let annotations = {};
    let currentIndex = 0;
    let selectedTokens = [];
    let selectedType = 'function';
    
    async function loadData() {
      const res = await fetch('/api/data');
      const data = await res.json();
      examples = data.examples;
      annotations = data.annotations;
      
      if (examples.length === 0) {
        document.querySelector('.main-content').innerHTML = '<div class="no-examples">No code examples found. Run the scraper first.</div>';
        return;
      }
      
      render();
    }
    
    function getAnnotationsForUrl(url) {
      return annotations[url] || [];
    }
    
    function setAnnotationsForUrl(url, anns) {
      annotations[url] = anns;
    }
    
    function render() {
      const example = examples[currentIndex];
      const url = example.url;
      const anns = getAnnotationsForUrl(url);
      
      document.getElementById('codeUrl').textContent = url;
      
      fetch('/api/tokenize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenizedHtml: example.tokenizedHtml, annotations: anns })
      })
      .then(r => r.json())
      .then(data => {
        document.getElementById('codeBlock').innerHTML = data.html;
      });
      
      updateProgress();
      renderAnnotations();
      clearSelection();
      updateTypeButtons();
    }
    
    function updateProgress() {
      const reviewed = Object.keys(annotations).length;
      const total = examples.length;
      const pct = total > 0 ? (reviewed / total * 100) : 0;
      
      document.getElementById('progressText').textContent = 
        \`Example \${currentIndex + 1} of \${total} (\${reviewed} reviewed)\`;
      document.getElementById('progressFill').style.width = pct + '%';
      
      document.getElementById('prevBtn').disabled = currentIndex === 0;
      document.getElementById('nextBtn').disabled = currentIndex === examples.length - 1;
    }
    
    function renderAnnotations() {
      const url = examples[currentIndex].url;
      const anns = getAnnotationsForUrl(url);
      
      const container = document.getElementById('annotationsList');
      
      if (annotations[url] === undefined) {
        container.innerHTML = '<div style="color: #8b949e; font-size: 13px;">Not reviewed yet</div>';
        return;
      }
      
      if (anns.length === 0) {
        container.innerHTML = '<div style="color: #8b949e; font-size: 13px;">Marked as no tokens needed</div>';
        return;
      }
      
      container.innerHTML = anns.map((ann, i) => {
        const tokenTexts = ann.ids.map(id => {
          const el = document.querySelector(\`[data-token-id="\${id}"]\`);
          return el ? el.textContent : id;
        }).join(' ');
        return \`
        <div class="annotation-item">
          <span class="annotation-type \${ann.type}">\${ann.type}</span>
          <span class="annotation-tokens" title="\${tokenTexts}">\${tokenTexts}</span>
          <button class="annotation-delete" onclick="deleteAnnotation(\${i})">✕</button>
        </div>
      \`;
      }).join('');
    }
    
    function selectToken(tokenId, event) {
      if (event.shiftKey) {
        if (!selectedTokens.includes(tokenId)) {
          selectedTokens.push(tokenId);
        }
      } else {
        selectedTokens = [tokenId];
      }
      
      document.querySelectorAll('.token.selected').forEach(el => el.classList.remove('selected'));
      selectedTokens.forEach(id => {
        const el = document.querySelector(\`[data-token-id="\${id}"]\`);
        if (el) el.classList.add('selected');
      });
      
      updateSelectedDisplay();
    }
    
    function updateSelectedDisplay() {
      const container = document.getElementById('selectedTokens');
      if (selectedTokens.length === 0) {
        container.innerHTML = '<span style="color: #8b949e; font-size: 13px;">Click tokens to select them. Shift+click to add to selection.</span>';
        return;
      }
      
      container.innerHTML = selectedTokens.map(id => {
        const el = document.querySelector(\`[data-token-id="\${id}"]\`);
        const text = el ? el.textContent : id;
        return \`<span class="selected-token">\${text}</span>\`;
      }).join('');
    }
    
    function setType(type) {
      selectedType = type;
      updateTypeButtons();
    }
    
    function updateTypeButtons() {
      document.querySelectorAll('.type-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.classList.contains(selectedType)) {
          btn.classList.add('active');
        }
      });
    }
    
    function clearSelection() {
      selectedTokens = [];
      document.querySelectorAll('.token.selected').forEach(el => el.classList.remove('selected'));
      updateSelectedDisplay();
    }
    
    async function saveGroup() {
      const url = examples[currentIndex].url;
      const anns = getAnnotationsForUrl(url);
      
      if (selectedTokens.length > 0) {
        anns.push({
          ids: [...selectedTokens],
          type: selectedType
        });
      }
      
      setAnnotationsForUrl(url, anns);
      await saveAnnotations();
      
      render();
      showToast('Group saved!');

      if (document.getElementById('autoAdvance').checked) {
        nextUnannotated();
      }
    }
    
    async function deleteAnnotation(index) {
      const url = examples[currentIndex].url;
      const anns = getAnnotationsForUrl(url);
      anns.splice(index, 1);
      setAnnotationsForUrl(url, anns);
      await saveAnnotations();
      render();
      showToast('Annotation deleted');
    }
    
    async function saveAnnotations() {
      await fetch('/api/annotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(annotations)
      });
    }
    
    function prevExample() {
      if (currentIndex > 0) {
        currentIndex--;
        render();
      }
    }
    
    function nextExample() {
      if (currentIndex < examples.length - 1) {
        currentIndex++;
        render();
      }
    }
    
    async function skipNoTokens() {
      const url = examples[currentIndex].url;
      setAnnotationsForUrl(url, []);
      await saveAnnotations();
      showToast('Marked as no tokens needed');
      nextExample();
    }
    
    function nextUnannotated() {
      for (let i = currentIndex + 1; i < examples.length; i++) {
        if (annotations[examples[i].url] === undefined) {
          currentIndex = i;
          render();
          return;
        }
      }
      for (let i = 0; i < currentIndex; i++) {
        if (annotations[examples[i].url] === undefined) {
          currentIndex = i;
          render();
          return;
        }
      }
      showToast('All examples annotated!');
    }
    
    async function saveAndNext() {
      if (selectedTokens.length > 0) {
        await saveGroup();
      } else {
        await saveAnnotations();
        nextExample();
      }
    }
    
    function showToast(message, isError = false) {
      const toast = document.getElementById('toast');
      toast.textContent = message;
      toast.className = 'toast show' + (isError ? ' error' : '');
      setTimeout(() => toast.classList.remove('show'), 3000);
    }
    
    loadData();
  </script>
</body>
</html>`;

const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(HTML);
    return;
  }

  if (req.method === 'GET' && req.url === '/api/data') {
    const examples = loadTokenizedExamples();
    const annotationsList = loadAnnotations();

    const annotationsMap: Record<string, Annotation[]> = {};
    annotationsList.forEach((ann) => {
      annotationsMap[ann.url] = ann.expectedAnnotations || [];
    });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ examples, annotations: annotationsMap }));
    return;
  }

  if (req.method === 'POST' && req.url === '/api/tokenize') {
    let body = '';
    req.on('data', (chunk: Buffer) => (body += chunk));
    req.on('end', () => {
      try {
        const { tokenizedHtml, annotations } = JSON.parse(body);
        const htmlWithHandlers = addClickHandlersToTokenizedHtml(tokenizedHtml, annotations || []);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ html: htmlWithHandlers }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: (e as Error).message }));
      }
    });
    return;
  }

  if (req.method === 'POST' && req.url === '/api/annotations') {
    let body = '';
    req.on('data', (chunk: Buffer) => (body += chunk));
    req.on('end', () => {
      try {
        const annotationsMap: Record<string, Annotation[]> = JSON.parse(body);

        const annotationsList: AnnotationEntry[] = Object.entries(annotationsMap).map(([url, expectedAnnotations]) => ({
          url,
          expectedAnnotations,
        }));

        saveAnnotationsToFile(annotationsList);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: (e as Error).message }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`\n  Code Annotation UI running at:`);
  console.log(`  http://localhost:${PORT}\n`);
  console.log(`  Loading examples from: ${TOKENIZED_EXAMPLES_PATH}`);
  console.log(`  Saving annotations to: ${ANNOTATIONS_PATH}\n`);
});
