import { DEFAULT_MODEL, DEFAULT_API_URL, DEFAULT_API_KEY } from '../apiDefaults';

interface CodeExampleProps {
  apiKey: string;
  baseURL: string;
  model: string;
}

// Syntax highlighting colors that work for both light and dark modes
const syntaxColors = {
  light: {
    keyword: '#AF00DB',
    variable: '#001080',
    operator: '#000000',
    className: '#267F99',
    string: '#A31515',
    comment: '#008000',
    background: '#f5f5f5',
  },
  dark: {
    keyword: '#C586C0',
    variable: '#9CDCFE',
    operator: '#D4D4D4',
    className: '#4EC9B0',
    string: '#CE9178',
    comment: '#6A9955',
    background: '#1e1e1e',
  },
};

export function CodeExample({ apiKey, baseURL, model }: CodeExampleProps) {
  const displayKey = apiKey || DEFAULT_API_KEY;
  const displayURL = baseURL || DEFAULT_API_URL;
  const displayModel = model || DEFAULT_MODEL;

  // Detect if user prefers dark mode
  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const colors = isDark ? syntaxColors.dark : syntaxColors.light;

  return (
    <div
      style={{
        marginTop: '12px',
        marginBottom: '0px',
        padding: '0px',
        backgroundColor: 'var(--card-bg-active)',
        borderRadius: '8px',
        overflowX: 'auto',
      }}
    >
      <pre
        style={{
          margin: 0,
          padding: '12px',
          backgroundColor: colors.background,
          borderRadius: '6px',
          overflow: 'auto',
          fontSize: '12px',
          lineHeight: '1.4',
        }}
      >
        <code>
          <span style={{ color: colors.keyword }}>const</span> <span style={{ color: colors.variable }}>client</span>{' '}
          <span style={{ color: colors.operator }}>=</span> <span style={{ color: colors.keyword }}>new</span>{' '}
          <span style={{ color: colors.className }}>OpenAI</span>
          <span style={{ color: colors.operator }}>(&#123;</span>
          {'\n'}
          {'  '}
          <span style={{ color: colors.variable }}>apiKey</span>
          <span style={{ color: colors.operator }}>:</span>{' '}
          <span style={{ color: colors.string }}>&apos;{displayKey}&apos;</span>
          <span style={{ color: colors.operator }}>,</span>
          {'\n'}
          {'  '}
          <span style={{ color: colors.variable }}>baseURL</span>
          <span style={{ color: colors.operator }}>:</span>{' '}
          <span style={{ color: colors.string }}>&apos;{displayURL}&apos;</span>
          <span style={{ color: colors.operator }}>,</span>
          {'\n'}
          <span style={{ color: colors.operator }}>&#125;);</span>
          {'\n\n'}
          <span style={{ color: colors.keyword }}>const</span> <span style={{ color: colors.variable }}>params</span>{' '}
          <span style={{ color: colors.operator }}>=</span> <span style={{ color: colors.operator }}>&#123;</span>
          {'\n'}
          {'  '}
          <span style={{ color: colors.variable }}>model</span>
          <span style={{ color: colors.operator }}>:</span>{' '}
          <span style={{ color: colors.string }}>&apos;{displayModel}&apos;</span>
          <span style={{ color: colors.operator }}>,</span>
          {'\n'}
          {'  '}
          <span style={{ color: colors.comment }}>{'// ... other parameters'}</span>
          {'\n'}
          <span style={{ color: colors.operator }}>&#125;;</span>
        </code>
      </pre>
    </div>
  );
}
