import { useState, useEffect } from 'react';
import reactLogo from '@/assets/react.svg';
import wxtLogo from '/wxt.svg';
import { sendMessage, sendActMessage } from '@/messaging';
import './App.css';

// 添加调试日志
console.log('Popup initialized');

function App() {
  const [count, setCount] = useState(1);
  const [isScreenshotting, setIsScreenshotting] = useState(false);
  const [status, setStatus] = useState('');

  // 处理截图
  const handleScreenshot = async () => {
    try {
      setIsScreenshotting(true);
      setStatus('正在准备截图...');
      
      // 发送截图请求到content script
      await sendActMessage('take-to-content', { 
        type: 'TAKE_SCREENSHOT', 
        payload: { timestamp: Date.now() }
      });
      
      setStatus('开始截图...');
      // 关闭popup窗口
      setTimeout(() => {
        window.close();
      }, 500);
    } catch (error: any) {
      console.error('截图失败:', error.message || error);
      setStatus(`截图失败: ${error.message || '未知错误'}`);
    } finally {
      setIsScreenshotting(false);
    }
  };

  return (
    <>
      <div className="header">
        <h1>AkShot 截图工具</h1>
      </div>
      
      <div className="screenshot-container">
        <button 
          className={`screenshot-button bg-red-500 rounded-2xl border-amber-100 ${isScreenshotting ? 'disabled' : ''}`}
          onClick={handleScreenshot}
          disabled={isScreenshotting}
        >
          {isScreenshotting ? '截图中...' : '开始截图'}
        </button>
        
        {status && <p className="status-message">{status}</p>}
        
        <div className="instructions">
          <p>点击"开始截图"按钮，然后在网页上选择要截取的区域。</p>
          <p>截图将自动保存，可以通过网页右下角的📸按钮查看历史截图。</p>
        </div>
      </div>
      
      <div className="footer">
        <p>AkShot - 网页截图工具</p>
      </div>
    </>
  );
}

export default App;
