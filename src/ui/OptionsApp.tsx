import { useEffect, useState } from 'react';
import { ApiConfiguration, SettingsMenu, WebsiteList } from './components';
import { storage, type SettingsTab } from '../storage';

function OptionsApp() {
  const [selectedTab, setSelectedTab] = useState<SettingsTab>('api');
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    void storage.selectedTab.get().then((tab) => {
      if (tab === 'api' || tab === 'websites') {
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
        display: 'flex',
        minHeight: '100vh',
      }}
    >
      <SettingsMenu selected={selectedTab} onSelect={handleTabSelect} animate={animate} />

      <main
        style={{
          flex: 1,
          padding: '32px 48px',
          maxWidth: '900px',
        }}
      >
        <h1 style={{ color: 'var(--text-primary)', margin: '0 0 20px 0', fontSize: '22px' }}>
          {selectedTab === 'api' ? 'API Configuration' : 'Website Settings'}
        </h1>
        {selectedTab === 'api' && <ApiConfiguration />}
        {selectedTab === 'websites' && <WebsiteList />}
      </main>
    </div>
  );
}

export default OptionsApp;
