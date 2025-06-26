import { defineExtensionMessaging } from '@webext-core/messaging';
import type { Message } from './types';

// 定义消息协议
interface MessagingProtocol {
  // 从popup发送到content的消息
  'popup-to-content': Message;
  // 从content发送到popup的消息
  'content-to-popup': Message;
  // 测试消息
  'test-to-content': Message;
  // 测试promise消息
  someMessage(message: Message): Promise<string>; 
}

// 创建消息服务
export const { sendMessage, onMessage } = defineExtensionMessaging<MessagingProtocol>();

/**
 * @description 获取当前活动tab的id
 * @returns 当前活动tab的id
 */
export const getActTabId = async () => {
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  if (tabs.length === 0 || !tabs[0].id) throw new Error('No active tab found');
  return tabs[0].id;
}

// 发送消息到content script（通过background转发）
export const sendMessageToContent = async (message: Message) => {
  console.log('Sending message to content script via background:', message);
  try {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    if (tabs.length === 0 || !tabs[0].id) throw new Error('No active tab found');
    return new Promise((resolve, reject) => {
      browser.runtime.sendMessage({
        type: 'popup-to-content',
        data: message,
        tabId: tabs[0].id
      }, (response) => {
        if (browser.runtime.lastError) {
          console.error('Error in sendMessage:', browser.runtime.lastError);
          reject(browser.runtime.lastError);
        } else {
          console.log('Received response from background/content script:', response);
          resolve(response);
        }
      });
    });
  } catch (error) {
    console.error('Error sending message to content:', error);
    throw error;
  }
};

// 发送消息到popup
export const sendMessageToPopup = (message: Message) => {
  console.log('content-to-popup', message);
  return sendMessage('content-to-popup', message);
};

// 监听来自popup的消息
export const onMessageFromPopup = (callback: (message: Message) => void) => {
  console.log('Registering onMessageFromPopup listener');
  try {
    const unsubscribe = onMessage('popup-to-content', (message) => {
      console.log('onMessageFromPopup received:', message);
      callback(message.data);
    });
    return unsubscribe;
  } catch (error) {
    console.error('Error registering popup message listener:', error);
    // 返回一个空函数作为unsubscribe，以防止错误
    return () => {};
  }
};

// 监听来自content的消息
export const onMessageFromContent = (callback: (message: Message) => void) => {
  return onMessage('content-to-popup', (message) => {
    console.log('onMessageFromContent', message);
    callback(message.data);
  });
};