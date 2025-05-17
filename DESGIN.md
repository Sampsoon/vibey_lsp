# Current Design Thoughts

## Background
The following design is for a Chrome extension that will identify code blocks in HTML and provide an editor-like experience for them. The primary feature it will support is providing definitions for parts of code, such as classes or functions, when hovered over. This experience will be similar to what you get in an editor like VSCode, but without the need for an LSP or editor—hence the name Vibey LSP.

## Design
A solution would involve a function that accepts raw HTML and identifies which words require definitions. It would then asynchronously stream the definitions back. Each definition would include the text of the explanation and a method for attaching it to the appropriate location in the DOM. In cases where the LLM determines no definition is necessary, it should return a no-op definition.

### General Flow
```typescript
// Note: will need to come up with better names

type Attach = (element: HTMLElement) => void;

type NoOpDefinition = {
    type: 'noop';
    attach: Attach;
};

type ActionableDefinition = {
    type: 'actionable';
    attach: Attach;
    text: string;
};

type Definition = NoOpDefinition | ActionableDefinition;

async function getCodeBlock(html: string): Promise<string> {
    // Implementation to extract code block from HTML
}

async function* keyWordsToLookup(codeBlock: string): AsyncIterable<string> {
    // Implementation to yield keywords from code block
}

async function getDefinition(keyword: string, codeBlock: string): Promise<Definition> {
    // Implementation to get definition for a keyword
}

async function* streamDefinitions(codeBlock: string): AsyncIterable<Definition> {
    for await (const keyword of keyWordsToLookup(codeBlock)) {
        yield await getDefinition(keyword, codeBlock);
    }
}

async function updateDomWithDefinition(definition: Definition): Promise<void> {
    // Implementation to update DOM with definition
}

async function processHtml(html: string): Promise<void> {
    const codeBlock = await getCodeBlock(html);
    const definitionStream = streamDefinitions(codeBlock);

    for await (const definition of definitionStream) {
        await updateDomWithDefinition(definition);
    }
}
```


### MVP Solution
To get an MVP, one option would be to process the raw HTML in one go rather than parsing it and then asynchronously processing it. It would be best to start with this. This would generally look like:

```typescript
// We can change the name and signature of this function later if we want to process a stream later on. I don't want to do it prematurely if we find a better way to do it.
async function getDefinitions(codeBlock: SomeHTMLRepresentation): Promise<Definition[]> {
  // Just throw the raw code with prompt into the LLM and have it return structured JSON
    // Parse the JSON and return the definitions
}

async function processHtml(html: SomeHTMLRepresentation) {
    const codeBlock = getCodeBlock(html);
    const definitions = await getDefinitions(codeBlock);

    definitions.forEach(definition => {
        updateDomWithDefinition(definition /*, ...other stuff if needed */);
    });
}
    
```


## On Taking Advantage of OpenAI's Code Parsing
OpenAI has already done substantial work parsing code into functions and methods. However, solely relying on this approach doesn't scale well to other websites and is brittle to changes.

## HTML Examples on ChatGPT

### Markdown
```html
<code class="whitespace-pre! language-python">
<span>
    <span class="hljs-keyword">def</span>
    <span> </span>
    <span class="hljs-title function_">main</span>
    <span>():</span>
</span>
<br>
<span>
    <span>  </span>
    <span class="hljs-built_in">print</span>
    <span>(</span>
    <span class="hljs-string">"Hello, World!"</span>
    <span>)</span>
</span>
<br>
<br>
<span>
    <span class="hljs-keyword">if</span>
    <span> __name__ == </span>
    <span class="hljs-string">"__main__"</span>
    <span>:</span>
</span>
<br>
<span>
    <span>  main()</span>
</span>
</code>
```


### Canvas
```html
<div spellcheck="true" autocorrect="true" autocapitalize="off" translate="no" contenteditable="false" style="tab-size: 4;" class="cm-content" role="textbox" aria-multiline="true" aria-readonly="true" data-language="python" aria-autocomplete="list">
<div class="cm-line">
    <span class="ͼ28">def</span>
    <span> </span>
    <span class="ͼ2d">main</span>
    <span class="ͼ2f">(</span>
    <span class="ͼ2f">)</span>
    <span class="ͼ2f">:</span>
</div>
<div class="cm-line">
    <span>    </span>
    <span class="ͼ2d">print</span>
    <span class="ͼ2f">(</span>
    <span class="ͼ2h">"Hello, World!"</span>
    <span class="ͼ2f">)</span>
</div>
<div class="cm-line"><br></div>
<div class="cm-line">
    <span class="ͼ29">if</span>
    <span> </span>
    <span class="ͼ2a">__name__</span>
    <span> </span>
    <span class="ͼ2f">==</span>
    <span> </span>
    <span class="ͼ2h">"__main__"</span>
    <span>:</span>
</div>
<div class="cm-line">
    <span>    </span>
    <span class="ͼ2d">main</span>
    <span class="ͼ2f">(</span>
    <span class="ͼ2f">)</span>
</div>
<div class="cm-line"><br></div>
</div>
```
  