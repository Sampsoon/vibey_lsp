chrome.runtime.onInstalled.addListener(() => {
  console.log('LLM API Service Worker installed');
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  console.log('Message received:', message);
  sendResponse({ received: true });
});
