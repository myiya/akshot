// 定义消息类型
export type MessageType = 
  | 'INCREMENT_COUNT' 
  | 'RESET_COUNT' 
  | 'TEST_CONTENT'
  | 'TAKE_SCREENSHOT'
  | 'SAVE_SCREENSHOT'
  | 'GET_SCREENSHOTS'
  | 'DELETE_SCREENSHOT';

// 定义消息接口
export interface Message {
  type: MessageType;
  payload?: any;
}