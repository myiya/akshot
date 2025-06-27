import { useState } from 'react';
import reactLogo from '@/assets/react.svg';
import wxtLogo from '/wxt.svg';
import { sendMessage, sendActMessage } from '@/messaging';
// 添加调试日志
console.log('Popup initialized');
import './App.css';

function App() {
  const [count, setCount] = useState(1);

  const handleTest = async () => {
    const res = await sendActMessage('someMessage', { type: 'TEST_CONTENT', payload: 'Hello from content script' });
    console.log('Response from content script:', res);
    setCount(res);
  }

  const handleTest2 = async () => {
     const res = await sendMessage('test-to-content', { type: 'TEST_CONTENT', payload: 'Hello from content script' });
     console.log('Response from content script:', res);
  }
  
  // 使用封装的sendActMessage函数发送消息到当前活动标签页
  const handleTestAct = async () => {
    try {
      const res = await sendActMessage<number>('someMessage', { 
        type: 'TEST_CONTENT', 
        payload: 'Hello from active tab using sendActMessage' 
      });
      console.log('Response from active tab:', res);
      setCount(res);
    } catch (error: any) {
      console.error('Error sending message to active tab:', error.message || error);
      alert(`发送消息失败: ${error.message || '未知错误'}`);
    }
  }


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
        <button onClick={handleTest}>
          test
        </button>
        <button onClick={handleTest2}>
          test2
        </button>
        <button onClick={handleTestAct}>
          测试当前标签页
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
