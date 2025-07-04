import { useState, useEffect } from 'react';
import { sendMessage, sendActMessage } from '@/messaging';

// 添加调试日志
console.log('Popup initialized');

function App() {
  const [isScreenshotting, setIsScreenshotting] = useState(false);
  const [status, setStatus] = useState('');
  const [canScreenshot, setCanScreenshot] = useState(true);
  const [currentUrl, setCurrentUrl] = useState('');

  // 检测当前页面是否支持截图
  useEffect(() => {
    const checkPageSupport = async () => {
      try {
        const tabs = await browser.tabs.query({ active: true, currentWindow: true });
        if (tabs.length === 0 || !tabs[0].url) {
          setCanScreenshot(false);
          setStatus('无法获取当前页面信息');
          return;
        }

        const url = tabs[0].url;
        setCurrentUrl(url);

        // 检查是否为不支持的页面
        const unsupportedPatterns = [
          /^chrome:\/\//,
          /^chrome-extension:\/\//,
          /^moz-extension:\/\//,
          /^about:/,
          /^edge:\/\//,
          /^opera:\/\//,
          /^brave:\/\//,
          /^file:\/\//
        ];

        const isUnsupported = unsupportedPatterns.some(pattern => pattern.test(url));
        
        if (isUnsupported) {
          setCanScreenshot(false);
          setStatus('当前页面不支持截图功能');
        } else {
          setCanScreenshot(true);
          setStatus('');
        }
      } catch (error) {
        console.error('检查页面支持失败:', error);
        setCanScreenshot(false);
        setStatus('检查页面支持失败');
      }
    };

    checkPageSupport();
  }, []);

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
      window.close();
    } catch (error: any) {
      console.error('截图失败:', error.message || error);
      setStatus(`截图失败: ${error.message || '未知错误'}`);
    } finally {
      setIsScreenshotting(false);
    }
  };

  // 处理打开侧边栏
  const handleToggleSidebar = async () => {
    try {
      setStatus('正在打开截图历史...');
      
      // 发送切换侧边栏请求到content script
      await sendMessage('toggle-sidebar', { 
        type: 'TOGGLE_SIDEBAR', 
        payload: { timestamp: Date.now() }
      });
      
      setStatus('截图历史已打开');
      // 关闭popup窗口
      window.close();
    } catch (error: any) {
      console.error('打开侧边栏失败:', error.message || error);
      setStatus(`打开失败: ${error.message || '未知错误'}`);
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
        {/* Action Buttons */}
        <div className="flex flex-col items-center space-y-4">
          <button 
            className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 transform ${
              isScreenshotting || !canScreenshot
                ? 'bg-gray-400 cursor-not-allowed text-gray-400' 
                : 'bg-gradient-to-r from-blue-500 text-white to-indigo-600 hover:from-blue-600 hover:to-indigo-700 hover:scale-105 shadow-lg hover:shadow-xl'
            }`}
            onClick={handleScreenshot}
            disabled={isScreenshotting || !canScreenshot}
            title={!canScreenshot ? '当前页面不支持截图功能' : '开始截图'}
          >
            <div className="flex items-center justify-center space-x-2">
              <span className="text-lg">
                {isScreenshotting ? '⏳' : !canScreenshot ? '🚫' : '📷'}
              </span>
              <span>
                {isScreenshotting ? '截图中...' : !canScreenshot ? '不支持截图' : '开始截图'}
              </span>
            </div>
          </button>
          
          <button 
            className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 transform ${
              isScreenshotting || !canScreenshot
                ? 'text-gray-400 bg-gray-100 border-2 border-gray-200 cursor-not-allowed' 
                : 'text-indigo-600 bg-white border-2 border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300 hover:scale-105 shadow-md hover:shadow-lg'
            }`}
            onClick={handleToggleSidebar}
            disabled={isScreenshotting || !canScreenshot}
            title={!canScreenshot ? '当前页面不支持查看截图历史' : '查看截图历史'}
          >
            <div className="flex items-center justify-center space-x-2">
              <span className="text-lg">
                {!canScreenshot ? '🚫' : '📋'}
              </span>
              <span>查看截图历史</span>
            </div>
          </button>
          
          {status && (
            <div className={`w-full p-3 rounded-lg ${
              !canScreenshot 
                ? 'bg-red-50 border border-red-200' 
                : 'bg-blue-50 border border-blue-200'
            }`}>
              <p className={`text-sm text-center font-medium ${
                !canScreenshot ? 'text-red-700' : 'text-blue-700'
              }`}>
                {status}
              </p>
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
              <p>点击"查看截图历史"打开侧边栏浏览</p>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-blue-500 mt-0.5">4.</span>
              <p>截图自动保存，可随时查看和管理</p>
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
