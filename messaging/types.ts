// 定义消息类型
export type MessageType = 'INCREMENT_COUNT' | 'RESET_COUNT';

// 定义消息接口
export interface Message {
  type: MessageType;
  payload?: any;
}