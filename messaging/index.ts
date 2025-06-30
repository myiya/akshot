import { defineExtensionMessaging } from '@webext-core/messaging';
import type { Message, MessageType } from './types';

// 定义消息协议
interface MessagingProtocol {
  // 从popup发送到content的消息
  'popup-to-content': Message;
  // 从content发送到popup的消息
  'content-to-popup': Message;
  // 测试消息
  'test-to-content': Message;

  /**
   * @description 截取当前可见标签页的屏幕截图
   */
  'capture-visible-tab'(): Promise<string>;

  /**
   * @description 发送当前标签页的截图到content
   */
  'send-screenshot-to-content'(message: Message): void;

  /**
   * @description 触发截图操作
   * @param message 包含截图操作的相关信息
   */
  'take-screenshot'(message: { type: MessageType; payload?: { timestamp?: number } }): void;

  /**
   * @description 保存截图到IndexedDB
   * @param message 包含要保存的截图数据
   */
  'save-screenshot'(message: { type: MessageType; payload: { url: string; imageData: string } }): Promise<string>;

  /**
   * @description 获取当前网站的所有截图
   * @param message 包含查询条件
   */
  'get-screenshots'(message: { type: MessageType; payload?: { url?: string } }): Promise<any[]>;

  /**
   * @description 删除指定截图
   * @param message 包含要删除的截图ID
   */
  'delete-screenshot'(message: { type: MessageType; payload: { id: string } }): Promise<void>;

  // 测试promise消息
  someMessage(message: Message): void; 
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

/**
 * 向当前活动标签页发送消息
 * @template T - 消息响应的类型
 * @param {keyof MessagingProtocol} channel - 消息通道，必须是在 MessagingProtocol 中定义的键
 * @param {Message} message - 消息内容，包含 type 和可选的 payload
 * @returns {Promise<T>} 消息响应的 Promise
 * @throws {Error} 如果没有找到活动标签页或消息发送失败
 */
export const sendActMessage = async <T = any>(channel: keyof MessagingProtocol, message: Message): Promise<T> => {
  try {
    // 获取当前活动标签页ID
    const tabId = await getActTabId();
    // 发送消息并返回结果
    return await sendMessage(channel, message, tabId) as T;
  } catch (error: any) {
    console.error(`Failed to send message to active tab: ${error.message || error}`);
    throw error;
  }
}
