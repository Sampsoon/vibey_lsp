import { useEffect } from 'react';
import './App.css';
import { detectKeyPress } from './userActionDetection';

function App() {
  useEffect(() => {
    const cleanupY = detectKeyPress(() => {
      console.log('Y key was pressed!');
      if (chrome.runtime && chrome.runtime.sendMessage) {
        console.log('Sending message to service worker');
        chrome.runtime.sendMessage({ action: 'activate' });
      }
    }, 'y');

    return () => {
      cleanupY();
    };
  }, []);

  return (
    <>
      <div>hello Scribe app</div>
      <div>
        <p>Press the 'y' key to activate the service worker</p>
      </div>
    </>
  );
}

export default App;
