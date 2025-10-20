import { DEFAULT_MODEL, DEFAULT_API_URL, DEFAULT_API_KEY } from '../apiDefaults';

interface CodeExampleProps {
  apiKey: string;
  baseURL: string;
  model: string;
}

export function CodeExample({ apiKey, baseURL, model }: CodeExampleProps) {
  const displayKey = apiKey || DEFAULT_API_KEY;
  const displayURL = baseURL || DEFAULT_API_URL;
  const displayModel = model || DEFAULT_MODEL;

  return (
    <div
      style={{
        marginTop: '12px',
        marginBottom: '0px',
        padding: '0px',
        backgroundColor: 'var(--card-bg)',
        borderRadius: '8px',
        overflowX: 'auto',
      }}
    >
      <pre
        style={{
          margin: 0,
          padding: '12px',
          backgroundColor: '#f5f5f5',
          borderRadius: '6px',
          overflow: 'auto',
          fontSize: '12px',
          lineHeight: '1.4',
        }}
      >
        <code>
          <span style={{ color: '#AF00DB' }}>const</span> <span style={{ color: '#001080' }}>client</span>{' '}
          <span style={{ color: '#000000' }}>=</span> <span style={{ color: '#AF00DB' }}>new</span>{' '}
          <span style={{ color: '#267F99' }}>OpenAI</span>
          <span style={{ color: '#000000' }}>(&#123;</span>
          {'\n'}
          {'  '}
          <span style={{ color: '#001080' }}>apiKey</span>
          <span style={{ color: '#000000' }}>:</span> <span style={{ color: '#A31515' }}>&apos;{displayKey}&apos;</span>
          <span style={{ color: '#000000' }}>,</span>
          {'\n'}
          {'  '}
          <span style={{ color: '#001080' }}>baseURL</span>
          <span style={{ color: '#000000' }}>:</span> <span style={{ color: '#A31515' }}>&apos;{displayURL}&apos;</span>
          <span style={{ color: '#000000' }}>,</span>
          {'\n'}
          <span style={{ color: '#000000' }}>&#125;);</span>
          {'\n\n'}
          <span style={{ color: '#AF00DB' }}>const</span> <span style={{ color: '#001080' }}>params</span>{' '}
          <span style={{ color: '#000000' }}>=</span> <span style={{ color: '#000000' }}>&#123;</span>
          {'\n'}
          {'  '}
          <span style={{ color: '#001080' }}>model</span>
          <span style={{ color: '#000000' }}>:</span>{' '}
          <span style={{ color: '#A31515' }}>&apos;{displayModel}&apos;</span>
          <span style={{ color: '#000000' }}>,</span>
          {'\n'}
          {'  '}
          <span style={{ color: '#008000' }}>{'// ... other parameters'}</span>
          {'\n'}
          <span style={{ color: '#000000' }}>&#125;;</span>
        </code>
      </pre>
    </div>
  );
}
