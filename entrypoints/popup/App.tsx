import { useState } from 'react';
import reactLogo from '@/assets/react.svg';
import wxtLogo from '/wxt.svg';
import { sendMessageToContent } from '@/messaging';
import type { Message } from '@/messaging/types';
// 添加调试日志
console.log('Popup initialized');
import './App.css';

function App() {
  const [count, setCount] = useState(0);
  
  // 发送增加计数消息到content script
  const sendIncrementMessage = async () => {
    console.log('Preparing to send INCREMENT_COUNT message');
    const message: Message = {
      type: 'INCREMENT_COUNT',
    };
    try {
      const response = await sendMessageToContent(message);
      console.log('Increment message sent successfully, response:', response);
    } catch (error) {
      console.error('Failed to send increment message:', error);
    }
  };
  
  // 发送重置计数消息到content script
  const sendResetMessage = async () => {
    console.log('Preparing to send RESET_COUNT message');
    const message: Message = {
      type: 'RESET_COUNT',
    };
    try {
      const response = await sendMessageToContent(message);
      console.log('Reset message sent successfully, response:', response);
    } catch (error) {
      console.error('Failed to send reset message:', error);
    }
  };

  return (
    <>
      <div>
        <a href="https://wxt.dev" target="_blank">
          <img src={wxtLogo} className="logo" alt="WXT logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>WXT + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <button onClick={sendIncrementMessage}>
          增加Content中的计数
        </button>
        <button onClick={sendResetMessage}>
          重置Content中的计数
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the WXT and React logos to learn more
      </p>
    </>
  );
}

export default App;
