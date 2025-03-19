import { detectKeyUpDown } from '../userActionDetection/userActionDetection';

const cleanup = detectKeyUpDown(
  () => {
    console.log('[Content Script] Y key was pressed down!');
    if (chrome.runtime && chrome.runtime.sendMessage) {
      console.log('[Content Script] Sending activate message to service worker');
      chrome.runtime.sendMessage({ action: 'activate' }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('[Content Script] Error:', chrome.runtime.lastError);
          return;
        }

        if (response && response.status === 'activated') {
          console.log('[Content Script] Service worker confirmed activation');
        }
      });
    }
  },
  () => {
    console.log('[Content Script] Y key was released!');
    if (chrome.runtime && chrome.runtime.sendMessage) {
      console.log('[Content Script] Sending deactivate message to service worker');
      chrome.runtime.sendMessage({ action: 'deactivate' });
    }
  },
  'y',
);

console.log('[Content Script] Key listener loaded');

window.addEventListener('unload', () => {
  cleanup();
});
