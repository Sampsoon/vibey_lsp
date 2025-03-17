chrome.runtime.onInstalled.addListener(() => {
  console.log('Service worker installed');
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  console.log('Service worker received message:', message);

  if (message.action === 'activate') {
    console.log('Service worker activated');
    sendResponse({ status: 'activated' });
  }

  return true;
});
