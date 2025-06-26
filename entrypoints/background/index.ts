import { onMessage } from "@/messaging";

export default defineBackground(() => {
  console.log('Background script initialized', { id: browser.runtime.id });

  onMessage('test-to-content', async message => {
    console.log('Background received message:', message);
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    if (tabs.length === 0 || !tabs[0].id) throw new Error('No active tab found');
    console.log('Sending message to content script:')
  });
});
