import { useState, useEffect, useRef } from "react";
import type { Message } from "@/messaging/types";

// 声明全局window对象上的方法类型
declare global {
  interface Window {
    akshotSendMessageToReact: (message: Message) => void;
  }
}

// 创建一个自定义事件系统用于在content script和React组件之间传递消息
const messageEventName = 'akshot-content-message';

// 在全局window对象上添加一个方法，用于从content script向React组件发送消息
window.akshotSendMessageToReact = (message: Message) => {
  console.log('Dispatching message to React component:', message);
  const event = new CustomEvent(messageEventName, { detail: message });
  document.dispatchEvent(event);
};

// 添加调试日志
console.log('Content script component initialized');

export default () => {
  const [count, setCount] = useState(1);
  // 使用ref跟踪最新的count值
  const countRef = useRef(count);
  
  // 更新ref值
  useEffect(() => {
    countRef.current = count;
  }, [count]);
  
  const increment = () => setCount((count) => count + 1);
  
  // 处理来自popup的消息
  useEffect(() => {
    console.log('Setting up custom event listener in content component');
    
    // 处理消息的函数
    const handleMessage = (event: CustomEvent<Message>) => {
      const message = event.detail;
      console.log('Content component received message via custom event:', message);
      
      try {
        switch (message.type) {
          case 'INCREMENT_COUNT':
            console.log('Incrementing count from', countRef.current);
            increment();
            break;
          case 'RESET_COUNT':
            console.log('Resetting count to 0');
            setCount(0);
            break;
          default:
            console.log('Unknown message type:', message.type);
        }
      } catch (error) {
        console.error('Error handling message in content component:', error);
      }
    };
    
    // 添加自定义事件监听器
    document.addEventListener(messageEventName, handleMessage as EventListener);
    
    // 组件卸载时移除事件监听器
    return () => {
      console.log('Cleaning up custom event listener in content component');
      document.removeEventListener(messageEventName, handleMessage as EventListener);
    };
  }, []); // 移除count依赖，避免不必要的重新订阅

  return (
    <div>
      <p style={{ color: '#FFF' }}>This is React. {count}</p>
      <button onClick={increment}>Increment</button>
    </div>
  );
};
