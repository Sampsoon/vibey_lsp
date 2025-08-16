export const RETRIEVAL_HOVER_HINTS_PROMPT = `
Analyze the provided HTML code blocks and produce hover hints for relevant code elements.

For each relevant code element:
- Identify all occurrences that refer to the same underlying entity and collect their span data--element-id values.
- Provide concise, high-signal documentation including the element's signature, purpose/behavior, key parameters and return values (if applicable), and notable usage notes.

Include documentation for:
- Classes, functions, methods, variables, types, properties
- Standard library functions (print, open, Math.max, etc.)
- User-defined elements

Exclude:
- Language keywords (def, class, if, return, etc.)
- Built-in types (str, int, float, etc.)
- Common syntax elements
- Elements that are obvious to the user such as \`const hello = "hello"\` or types in a JSON object

Format all output content as plain text only. Do not use HTML tags or markdown under any circumstances.

Type mapping and fields:
- Use lowercase category identifiers for the documentation type: function, object, variable.
- Map elements: functions and methods → function; classes and objects → object; variables/constants → variable.
- For type function, include fields: docString, functionSignature, documentation (all plain text).
- For type object or variable, include field: docInHtml (plain text only).
`;
