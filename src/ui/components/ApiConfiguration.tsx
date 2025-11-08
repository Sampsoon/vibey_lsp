import { useState, useEffect } from 'react';
import { RadioOption } from './RadioOption';
import { Input } from './Input';
import { PasswordInput } from './PasswordInput';
import { CodeExample } from './CodeExample';
import { DEFAULT_MODEL, OPENROUTER_API_URL, deleteAPIKeyConfig, saveAPIKeyConfig } from '../../storage';
import { fieldLabelStyle } from './styles';

async function processOpenRouterConfigChange(openrouterKey: string) {
  if (!openrouterKey) {
    await deleteAPIKeyConfig();
    return;
  }

  await saveAPIKeyConfig({
    key: openrouterKey,
  });
}

async function processCustomConfigChange(customModel: string, customUrl: string, customKey: string) {
  if (!customModel || !customUrl || !customKey) {
    await deleteAPIKeyConfig();
    return;
  }

  await saveAPIKeyConfig({
    model: customModel,
    url: customUrl,
    key: customKey,
  });
}

export function ApiConfiguration() {
  const [selectedProvider, setSelectedProvider] = useState<'openrouter' | 'custom'>('openrouter');

  const [openrouterKey, setOpenrouterKey] = useState('');

  const [customModel, setCustomModel] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [customKey, setCustomKey] = useState('');

  const [showCustomKey, setShowCustomKey] = useState(false);

  const debounceTimeout = 500;

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (selectedProvider === 'openrouter') {
        void processOpenRouterConfigChange(openrouterKey);
      } else {
        void processCustomConfigChange(customModel, customUrl, customKey);
      }
    }, debounceTimeout);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [openrouterKey, customModel, customUrl, customKey, selectedProvider]);

  return (
    <div>
      <RadioOption
        id="openrouter"
        label="OpenRouter"
        selected={selectedProvider === 'openrouter'}
        onSelect={() => {
          setSelectedProvider('openrouter');
        }}
      >
        <div style={{ marginBottom: '12px' }}>
          <label style={fieldLabelStyle}>
            API key{' '}
            <a
              href="https://openrouter.ai/keys"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--primary-color)', textDecoration: 'none' }}
            >
              (click here to get one)
            </a>
          </label>
          <PasswordInput
            placeholder="Your API key"
            value={openrouterKey}
            onChange={(val: string) => {
              setOpenrouterKey(val);
            }}
          />
        </div>
      </RadioOption>

      <RadioOption
        id="custom"
        label="Custom Endpoint"
        selected={selectedProvider === 'custom'}
        onSelect={() => {
          setSelectedProvider('custom');
        }}
      >
        <div style={{ marginBottom: '12px' }}>
          <label style={fieldLabelStyle}>Model</label>
          <Input
            type="text"
            placeholder={DEFAULT_MODEL}
            value={customModel}
            onChange={(val: string) => {
              setCustomModel(val);
            }}
          />
        </div>
        <div style={{ marginBottom: '12px' }}>
          <label style={fieldLabelStyle}>API URL</label>
          <Input
            type="text"
            placeholder={OPENROUTER_API_URL}
            value={customUrl}
            onChange={(val: string) => {
              setCustomUrl(val);
            }}
          />
        </div>
        <div style={{ marginBottom: '12px' }}>
          <label style={fieldLabelStyle}>API Key</label>
          <PasswordInput
            placeholder="Your API key"
            value={customKey}
            onChange={(val: string) => {
              setCustomKey(val);
            }}
            onShowChange={setShowCustomKey}
          />
        </div>
        <CodeExample
          apiKey={showCustomKey ? customKey : customKey ? '•'.repeat(customKey.length) : ''}
          baseURL={customUrl}
          model={customModel}
        />
      </RadioOption>
    </div>
  );
}
