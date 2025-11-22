import { useState, useEffect } from 'react';
import { Input, PasswordInput, fieldLabelStyle, TextArea } from '../common';
import { CodeExample } from './CodeExample';
import { DEFAULT_MODEL, OPEN_ROUTER_API_URL, storage } from '../../../storage';
import { createDebounce } from '../../utils';
import { Json } from '../../../shared';

function formatJson(json: Json | undefined): string {
  if (!json) {
    return '';
  }
  return JSON.stringify(json, null, 2);
}

function parseJsonOrUndefined(value: string): Json | undefined {
  try {
    return JSON.parse(value) as Json;
  } catch {
    return undefined;
  }
}

async function processCustomConfigChange(
  customModel: string,
  customUrl: string,
  customKey: string,
  customArguments: Json | undefined,
) {
  await storage.customApiConfig.set({
    model: customModel,
    url: customUrl,
    key: customKey,
    additionalArguments: customArguments,
  });
}

export function CustomEndpointConfiguration() {
  const [customModel, setCustomModel] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [customKey, setCustomKey] = useState('');
  const [customArguments, setCustomArguments] = useState<Json>({});
  const [argumentsString, setArgumentsString] = useState('');
  const [showCustomKey, setShowCustomKey] = useState(false);

  useEffect(() => {
    const loadConfig = async () => {
      const customApiConfig = await storage.customApiConfig.get();

      if (customApiConfig) {
        setCustomModel(customApiConfig.model);
        setCustomUrl(customApiConfig.url);
        setCustomKey(customApiConfig.key);

        const additionalArguments = customApiConfig.additionalArguments ?? {};
        setCustomArguments(additionalArguments);
        setArgumentsString(formatJson(additionalArguments));
      }
    };
    void loadConfig();
  }, []);

  useEffect(() => {
    return createDebounce(() => processCustomConfigChange(customModel, customUrl, customKey, customArguments));
  }, [customModel, customUrl, customKey, customArguments]);

  const handleArgumentsChange = (value: string) => {
    const parsed = parseJsonOrUndefined(value);

    if (!parsed) {
      setCustomArguments({});
      setArgumentsString(value);
      return;
    }

    setCustomArguments(parsed);

    // The check for the number of keys is necessary because we don't want to auto format an empty object as
    // this will result in the string "{}".
    setArgumentsString(Object.keys(parsed).length > 0 ? formatJson(parsed) : value);
  };

  return (
    <div>
      <div style={{ marginBottom: '12px' }}>
        <label style={fieldLabelStyle}>Model</label>
        <Input
          type="text"
          placeholder={DEFAULT_MODEL}
          value={customModel}
          onChange={(value: string) => {
            setCustomModel(value);
          }}
        />
      </div>
      <div style={{ marginBottom: '12px' }}>
        <label style={fieldLabelStyle}>API URL</label>
        <Input
          type="text"
          placeholder={OPEN_ROUTER_API_URL}
          value={customUrl}
          onChange={(value: string) => {
            setCustomUrl(value);
          }}
        />
      </div>
      <div style={{ marginBottom: '12px' }}>
        <label style={fieldLabelStyle}>API Key</label>
        <PasswordInput
          placeholder="Your API key"
          value={customKey}
          onChange={(value: string) => {
            setCustomKey(value);
          }}
          onShowChange={setShowCustomKey}
        />
      </div>
      <div style={{ marginBottom: '12px' }}>
        <label style={fieldLabelStyle}>Additional Arguments</label>
        <TextArea
          placeholder={formatJson({ temperature: 0.7 })}
          value={argumentsString}
          onChange={handleArgumentsChange}
        />
      </div>
      <CodeExample
        apiKey={showCustomKey ? customKey : customKey ? '•'.repeat(customKey.length) : ''}
        baseURL={customUrl}
        model={customModel}
      />
    </div>
  );
}
