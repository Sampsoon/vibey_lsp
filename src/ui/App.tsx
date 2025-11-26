import { useState, useEffect } from 'react';
import { ApiConfiguration, SettingsMenu, WebsiteList, ContactSection } from './components';
import { storage, SettingsTab } from '../storage';

function App() {
  const [selectedTab, setSelectedTab] = useState<SettingsTab>('api');
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    void storage.selectedTab.get().then((tab) => {
      if (tab) {
        setSelectedTab(tab);
      }
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnimate(true);
        });
      });
    });
  }, []);

  const handleTabSelect = (tab: SettingsTab) => {
    setSelectedTab(tab);
    void storage.selectedTab.set(tab);
  };

  return (
    <div
      style={{
        width: '800px',
        height: '600px',
        padding: '20px 16px',
        display: 'flex',
        gap: '16px',
        overflow: 'hidden',
      }}
    >
      <SettingsMenu selected={selectedTab} onSelect={handleTabSelect} animate={animate} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {selectedTab === 'api' && <ApiConfiguration />}
        {selectedTab === 'websites' && <WebsiteList />}
        {selectedTab === 'contact' && <ContactSection />}
      </div>
    </div>
  );
}

export default App;
