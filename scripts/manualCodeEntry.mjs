/**
 * Manual Code Entry Server
 * 
 * AI-generated code (Claude)
 * 
 * A local web server with a UI for manually adding code examples to the test dataset.
 * Use this to add examples from sites that can't be automatically scraped (e.g., AI chat
 * shares, sites with bot detection, or pages requiring authentication).
 * 
 * What it does:
 * - Serves a web UI at http://localhost:3456
 * - Lets you paste a URL and <code> block HTML
 * - Saves directly to test-data/code-examples.json on each add/delete
 * - Shows all current examples with their character counts
 * 
 * Usage:
 *   node scripts/manualCodeEntry.mjs
 *   # Then open http://localhost:3456 in your browser
 * 
 * How to add an example:
 *   1. Navigate to a page with code blocks
 *   2. Right-click the code block → Inspect
 *   3. Copy the <code>...</code> element's outer HTML
 *   4. Paste the URL and HTML into the form
 *   5. Click "Add Example" - saves immediately to file
 * 
 * Output: test-data/code-examples.json
 */

import { createServer } from 'http';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(__dirname, '..', 'test-data', 'code-examples.json');
const PORT = 3456;

function ensureDataFile() {
  const dir = dirname(DATA_PATH);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  if (!existsSync(DATA_PATH)) {
    writeFileSync(DATA_PATH, '[]');
  }
}

function readExamples() {
  ensureDataFile();
  return JSON.parse(readFileSync(DATA_PATH, 'utf-8'));
}

function writeExamples(examples) {
  ensureDataFile();
  writeFileSync(DATA_PATH, JSON.stringify(examples, null, 2));
}

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Manual Code Block Entry</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background: #0d1117;
      color: #c9d1d9;
    }
    h1 { color: #58a6ff; margin-bottom: 8px; }
    .subtitle { color: #8b949e; margin-bottom: 24px; }
    .form-group { margin-bottom: 16px; }
    label { display: block; margin-bottom: 6px; color: #8b949e; font-size: 14px; }
    input, textarea {
      width: 100%;
      padding: 12px;
      border: 1px solid #30363d;
      border-radius: 6px;
      background: #161b22;
      color: #c9d1d9;
      font-family: inherit;
    }
    textarea {
      font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
      font-size: 13px;
      min-height: 200px;
      resize: vertical;
    }
    input:focus, textarea:focus {
      outline: none;
      border-color: #58a6ff;
    }
    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
    }
    .btn-primary {
      background: #238636;
      color: white;
    }
    .btn-primary:hover { background: #2ea043; }
    .btn-secondary {
      background: #21262d;
      color: #c9d1d9;
      border: 1px solid #30363d;
    }
    .btn-secondary:hover { background: #30363d; }
    .btn-danger {
      background: #da3633;
      color: white;
    }
    .btn-danger:hover { background: #f85149; }
    .actions { display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; }
    .stats {
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 6px;
      padding: 16px;
      margin-bottom: 24px;
    }
    .stats-row { display: flex; gap: 32px; }
    .stat { text-align: center; }
    .stat-value { font-size: 32px; font-weight: bold; color: #58a6ff; }
    .stat-label { color: #8b949e; font-size: 14px; }
    .examples-list {
      border: 1px solid #30363d;
      border-radius: 6px;
      overflow: hidden;
      max-height: 400px;
      overflow-y: auto;
    }
    .example-item {
      padding: 12px 16px;
      border-bottom: 1px solid #30363d;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .example-item:last-child { border-bottom: none; }
    .example-item:hover { background: #161b22; }
    .example-url {
      color: #58a6ff;
      text-decoration: none;
      font-size: 14px;
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .example-url:hover { text-decoration: underline; }
    .example-size { color: #8b949e; font-size: 12px; margin-left: 16px; }
    .example-delete {
      background: none;
      border: none;
      color: #f85149;
      cursor: pointer;
      padding: 4px 8px;
      margin-left: 8px;
    }
    .example-delete:hover { background: rgba(248, 81, 73, 0.1); border-radius: 4px; }
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
    .saving { opacity: 0.5; pointer-events: none; }
    .file-path {
      background: #161b22;
      padding: 8px 12px;
      border-radius: 4px;
      font-family: monospace;
      font-size: 12px;
      color: #8b949e;
      margin-bottom: 16px;
    }
  </style>
</head>
<body>
  <h1>Manual Code Block Entry</h1>
  <p class="subtitle">Add code examples to the test dataset - saves directly to file</p>
  <div class="file-path">Saving to: test-data/code-examples.json</div>

  <div class="stats">
    <div class="stats-row">
      <div class="stat">
        <div class="stat-value" id="totalCount">0</div>
        <div class="stat-label">Total Examples</div>
      </div>
    </div>
  </div>

  <div class="form-group">
    <label for="urlInput">Source URL</label>
    <input type="url" id="urlInput" placeholder="https://example.com/docs/api">
  </div>

  <div class="form-group">
    <label for="htmlInput">Code Block HTML (paste the &lt;code&gt; element)</label>
    <textarea id="htmlInput" placeholder='<code class="language-js"><span class="token keyword">const</span> x = 1;</code>'></textarea>
  </div>

  <div class="actions">
    <button class="btn btn-primary" onclick="addExample()">Add Example</button>
    <button class="btn btn-secondary" onclick="loadExamples()">Refresh</button>
  </div>

  <h2 style="margin-top: 32px; color: #c9d1d9;">Current Examples</h2>
  <div class="examples-list" id="examplesList"></div>

  <div class="toast" id="toast"></div>

  <script>
    let examples = [];

    async function loadExamples() {
      try {
        const res = await fetch('/api/examples');
        examples = await res.json();
        render();
      } catch (e) {
        showToast('Failed to load examples', true);
      }
    }

    async function saveExamples() {
      try {
        await fetch('/api/examples', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(examples)
        });
      } catch (e) {
        showToast('Failed to save', true);
      }
    }

    function render() {
      document.getElementById('totalCount').textContent = examples.length;
      
      const list = document.getElementById('examplesList');
      if (examples.length === 0) {
        list.innerHTML = '<div class="example-item" style="color: #8b949e;">No examples yet. Add one above!</div>';
        return;
      }
      
      list.innerHTML = examples.map((ex, i) => \`
        <div class="example-item">
          <a class="example-url" href="\${ex.url}" target="_blank">\${ex.url}</a>
          <span class="example-size">\${ex.html.length} chars</span>
          <button class="example-delete" onclick="deleteExample(\${i})">✕</button>
        </div>
      \`).join('');
    }

    async function addExample() {
      const url = document.getElementById('urlInput').value.trim();
      const html = document.getElementById('htmlInput').value.trim();

      if (!url) {
        showToast('Please enter a URL', true);
        return;
      }
      if (!html) {
        showToast('Please paste the HTML code block', true);
        return;
      }

      if (examples.some(ex => ex.url === url)) {
        showToast('This URL already exists', true);
        return;
      }

      examples.push({ url, html });
      await saveExamples();
      render();

      document.getElementById('urlInput').value = '';
      document.getElementById('htmlInput').value = '';
      showToast('Example added and saved!');
    }

    async function deleteExample(index) {
      examples.splice(index, 1);
      await saveExamples();
      render();
      showToast('Example deleted');
    }

    function showToast(message, isError = false) {
      const toast = document.getElementById('toast');
      toast.textContent = message;
      toast.className = 'toast show' + (isError ? ' error' : '');
      setTimeout(() => toast.classList.remove('show'), 3000);
    }

    loadExamples();
  </script>
</body>
</html>`;

const server = createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(HTML);
    return;
  }

  if (req.method === 'GET' && req.url === '/api/examples') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(readExamples()));
    return;
  }

  if (req.method === 'POST' && req.url === '/api/examples') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const examples = JSON.parse(body);
        writeExamples(examples);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`\n  Manual Code Entry UI running at:`);
  console.log(`  http://localhost:${PORT}\n`);
  console.log(`  Saving to: ${DATA_PATH}\n`);
});

