// 定义消息类型
export type MessageType = 
  | 'INCREMENT_COUNT' 
  | 'RESET_COUNT' 
  | 'TEST_CONTENT'
  | 'TAKE_SCREENSHOT'
  | 'DOWNLOAD_SCREENSHOT'
  | 'SAVE_SCREENSHOT'
  | 'GET_SCREENSHOTS'
  | 'GET_ALL_SCREENSHOTS'
  | 'DELETE_SCREENSHOT'
  | 'CLEAR_SCREENSHOTS_BY_URL'
  | 'OPEN_OPTIONS_PAGE'
  | 'TOGGLE_SIDEBAR';

// 定义消息接口
export interface Message {
  type: MessageType;
  payload?: any;
}