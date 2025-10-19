import { useState } from 'react';
import { ApiConfiguration } from './components/ApiConfiguration';
import { SettingsMenu } from './components/SettingsMenu';
import { WebsiteList } from './components/WebsiteList';
import { ContactSection } from './components/ContactSection';

function App() {
  const [selectedTab, setSelectedTab] = useState<'api' | 'websites' | 'contact'>('api');

  return (
    <div style={{ width: '600px', minHeight: '500px', padding: '20px 16px', display: 'flex', gap: '16px' }}>
      <SettingsMenu selected={selectedTab} onSelect={setSelectedTab} />
      <div style={{ flex: 1 }}>
        {selectedTab === 'api' && <ApiConfiguration />}
        {selectedTab === 'websites' && <WebsiteList />}
        {selectedTab === 'contact' && <ContactSection />}
      </div>
    </div>
  );
}

export default App;
