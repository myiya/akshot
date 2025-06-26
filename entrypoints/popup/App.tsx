import { useState } from 'react';
import reactLogo from '@/assets/react.svg';
import wxtLogo from '/wxt.svg';
import { sendMessage } from '@/messaging';
// 添加调试日志
console.log('Popup initialized');
import './App.css';

function App() {
  const [count, setCount] = useState(0);

  const handleTest = async () => {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    if (tabs.length === 0 || !tabs[0].id) throw new Error('No active tab found');
     const res = await sendMessage('someMessage', { type: 'TEST_CONTENT', payload: 'Hello from content script' }, tabs[0].id);
     console.log('Response from content script:', res);
  }

  const handleTest2 = async () => {
     const res = await sendMessage('test-to-content', { type: 'TEST_CONTENT', payload: 'Hello from content script' });
     console.log('Response from content script:', res);
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
