import { useState } from 'react';
import { sendMessage, sendActMessage } from '@/messaging';

// 添加调试日志
console.log('Popup initialized');

function App() {
  const [isScreenshotting, setIsScreenshotting] = useState(false);
  const [status, setStatus] = useState('');

  // 处理截图
  const handleScreenshot = async () => {
    try {
      setIsScreenshotting(true);
      setStatus('正在准备截图...');
      
      // 发送截图请求到content script
      await sendMessage('take-to-content', { 
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
    <div className="w-80 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-[400px] font-sans">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-4">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-lg font-bold">📸</span>
          </div>
          <h1 className="text-xl font-bold text-gray-800">AkShot</h1>
        </div>
        <p className="text-sm text-gray-600 text-center mt-1">智能网页截图工具</p>
      </div>
      
      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Screenshot Button */}
        <div className="flex flex-col items-center space-y-4">
          <button 
            className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 transform ${
              isScreenshotting 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 hover:scale-105 shadow-lg hover:shadow-xl'
            }`}
            onClick={handleScreenshot}
            disabled={isScreenshotting}
          >
            <div className="flex items-center justify-center space-x-2">
              <span className="text-lg">{isScreenshotting ? '⏳' : '📷'}</span>
              <span>{isScreenshotting ? '截图中...' : '开始截图'}</span>
            </div>
          </button>
          
          {status && (
            <div className="w-full p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700 text-center font-medium">{status}</p>
            </div>
          )}
        </div>
        
        {/* Instructions */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
            <span className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mr-2">
              <span className="text-blue-600 text-xs">💡</span>
            </span>
            使用说明
          </h3>
          <div className="space-y-2 text-xs text-gray-600 leading-relaxed">
            <div className="flex items-start space-x-2">
              <span className="text-blue-500 mt-0.5">1.</span>
              <p>点击"开始截图"按钮启动截图工具</p>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-blue-500 mt-0.5">2.</span>
              <p>在网页上拖拽选择要截取的区域</p>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-blue-500 mt-0.5">3.</span>
              <p>截图自动保存，点击右下角📸查看历史</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="border-t border-gray-200 bg-white p-3">
        <p className="text-xs text-gray-500 text-center">AkShot v1.0 - 让截图更简单</p>
      </div>
    </div>
  );
}

export default App;
