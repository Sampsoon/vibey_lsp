# Vibey LSP

This is a Chrome extension that adds LSP-style documentation to any code on the internet. This project is nearing completion but still has a little way to go.

## Scripts

- `pnpm dev` — Start development server
- `pnpm build` — Type-check, build, and lint for production
- `pnpm lint` — Run ESLint
- `pnpm format` — Format code with Prettier

## Requirements

- Node.js ≥ 18
- pnpm


#### API Key Setup

- Create a `.env` file in the project root.
- Add the following API key(s) with the Vite prefix:

```
VITE_OPEN_ROUTER_API_KEY=your-openrouter-key-here
```

Access the key(s) in code go to `src/keys/index.ts`
