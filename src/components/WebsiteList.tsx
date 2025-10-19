import { useState } from 'react';
import { typography } from '../config/theme';
import { ToggleSwitch, InfoBox, Input, Button } from './ui';

export function WebsiteList() {
  const [filterMode, setFilterMode] = useState<'block-all' | 'allow-all'>('allow-all');
  const [patterns, setPatterns] = useState<string[]>([]);
  const [newPattern, setNewPattern] = useState('');

  const addPattern = () => {
    if (newPattern.trim()) {
      setPatterns([...patterns, newPattern.trim()]);
      setNewPattern('');
    }
  };

  const removePattern = (index: number) => {
    setPatterns(patterns.filter((_, i) => i !== index));
  };

  const description =
    filterMode === 'block-all'
      ? 'Block all sites except those matching these patterns'
      : 'Allow all sites except those matching these patterns';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '0 8px' }}>
      <div style={{ marginBottom: '16px' }}>
        <ToggleSwitch
          value={filterMode}
          onChange={setFilterMode}
          options={['allow-all', 'block-all']}
          labels={['Allow run on all websites', 'Block all websites']}
        />
      </div>

      <InfoBox>{description}</InfoBox>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Input
            value={newPattern}
            onChange={setNewPattern}
            onSubmit={addPattern}
            placeholder="example\.com|test\.org"
          />
          <Button variant="success" onClick={addPattern}>
            <span style={{ fontSize: '1.5em' }}>✓</span>
          </Button>
        </div>
      </div>

      {patterns.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            maxHeight: '400px',
            overflowY: 'auto',
            padding: '8px',
            border: '1.5px solid var(--border-color)',
            borderRadius: '8px',
            backgroundColor: 'var(--card-bg-inactive)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          {patterns.map((pattern, index) => (
            <div key={index} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div
                style={{
                  border: '1.5px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  boxShadow: 'var(--shadow-sm)',
                  flex: 1,
                }}
              >
                <span style={{ ...typography.smallLabel, fontFamily: 'monospace', wordBreak: 'break-word' }}>
                  {pattern}
                </span>
              </div>
              <Button
                variant="ghost"
                onClick={() => {
                  removePattern(index);
                }}
              >
                <span style={{ fontSize: '1.5em', color: 'var(--alert-color)' }}>✕</span>
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
