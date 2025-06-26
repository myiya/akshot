export default defineBackground(() => {
  console.log('Background script initialized', { id: browser.runtime.id });
  
  // 显式监听runtime消息事件，用于调试
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Background received message:', message, 'from:', sender);
    // 返回true表示将异步发送响应
    return true;
  });
});
