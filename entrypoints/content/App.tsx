import { useState, useEffect } from 'react';
import { onMessage, sendMessage } from "@/messaging";
import ScreenShot from "js-web-screen-shot";

// 添加调试日志
console.log("Content script component initialized");

export default () => {
  const [screenshots, setScreenshots] = useState<any[]>([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [activeTab, setActiveTab] = useState<'current' | 'all'>('current'); // 标签页状态
  const currentUrl = window.location.href.split("#")[0].split("?")[0]; // 获取基本URL，不包含查询参数和锚点

  // 加载截图（根据当前标签页）
  const loadScreenshots = async () => {
    try {
      let shots;
      if (activeTab === 'current') {
        shots = await sendMessage('get-screenshots', {
          type: 'GET_SCREENSHOTS',
          payload: { url: currentUrl }
        });
      } else {
        shots = await sendMessage('get-all-screenshots', {
          type: 'GET_ALL_SCREENSHOTS'
        });
      }
      setScreenshots(shots);
      console.log(`Loaded ${activeTab} screenshots:`, shots.length);
    } catch (error) {
      console.error("Failed to load screenshots:", error);
    }
  };

  // 切换标签页
  const handleTabChange = (tab: 'current' | 'all') => {
    setActiveTab(tab);
  };

  // 删除截图
  const handleDeleteScreenshot = async (id: string) => {
    try {
      await sendMessage('delete-screenshot', {
        type: 'DELETE_SCREENSHOT',
        payload: { id }
      });
      await loadScreenshots(); // 重新加载截图列表
    } catch (error) {
      console.error("Failed to delete screenshot:", error);
    }
  };

  useEffect(() => {
    // 初始加载截图
    loadScreenshots();
  }, [activeTab]); // 当标签页切换时重新加载

  useEffect(() => {

    // 监听截图请求
    onMessage("take-to-content", (message: any) => {
      console.log("Content component received screenshot request:", message);
      new ScreenShot({
        enableWebRtc: false,
        level: 99999,
        completeCallback: async ({ base64, cutInfo }) => {
          console.log("Screenshot taken", cutInfo);
          try {
            // 保存截图到IndexedDB
            await sendMessage('save-screenshot', {
              type: 'SAVE_SCREENSHOT',
              payload: { url: currentUrl, imageData: base64 }
            });
            // 重新加载截图列表
            await loadScreenshots();
            // 显示侧边栏
            setShowSidebar(true);
          } catch (error) {
            console.error("Failed to save screenshot:", error);
          }
        },
        closeCallback: () => {
          console.log("截图结束");
        },
      });
    });

    // 监听获取截图请求
    onMessage("get-screenshots", async (message: { type: string; payload?: { url?: string } }) => {
      await loadScreenshots();
      return screenshots;
    });

    // 监听删除截图请求
    onMessage("delete-screenshot", async (message: any) => {
      // 使用类型断言确保类型安全
      const payload = message as { payload?: { id?: string } };
      if (payload.payload?.id) {
        await handleDeleteScreenshot(payload.payload.id);
        return true;
      } else {
        return false;
      }
    });
  }, []);

  return (
    <div>
      {/* Toggle Button */}
      <div 
        className="fixed bottom-5 right-5 w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-[999998]" 
        title="查看截图历史" 
        onClick={() => setShowSidebar(!showSidebar)}
      >
        <span className="text-xl">📸</span>
      </div>
      
      {/* Sidebar */}
      <div className={`fixed top-0 right-0 w-80 h-full bg-white shadow-2xl z-[999999] transition-transform duration-300 ease-in-out flex flex-col font-sans ${
        showSidebar ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 text-white p-5 flex items-center justify-between relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent"></div>
          <div className="absolute -top-2 -right-2 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute -bottom-3 -left-3 w-16 h-16 bg-white/5 rounded-full blur-lg"></div>
          
          <div className="flex items-center space-x-3 relative z-10">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/30">
              <span className="text-xl">📸</span>
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-wide">截图历史</h3>
              <p className="text-blue-100 text-xs font-medium opacity-90">Screenshot History</p>
            </div>
          </div>
          
          <button 
            onClick={() => setShowSidebar(false)}
            className="w-10 h-10 rounded-xl cursor-pointer bg-white/15 hover:bg-white/25 flex items-center justify-center transition-all duration-300 hover:scale-105 backdrop-blur-sm border border-white/20 relative z-10 group"
          >
            <span className="text-white text-xl leading-none group-hover:rotate-90 transition-transform duration-300">×</span>
          </button>
        </div>
        
        {/* Tabs */}
        <div className="flex bg-gray-50 border-b border-gray-200">
          <button 
            className={`flex-1 py-3 px-4 text-sm font-medium transition-all cursor-pointer duration-200 ${
              activeTab === 'current' 
                ? 'bg-white text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
            onClick={() => handleTabChange('current')}
          >
            <div className="flex items-center justify-center space-x-1">
              <span>🌐</span>
              <span>当前网站</span>
            </div>
          </button>
          <button 
            className={`flex-1 py-3 px-4 text-sm font-medium transition-all cursor-pointer duration-200 ${
              activeTab === 'all' 
                ? 'bg-white text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
            onClick={() => handleTabChange('all')}
          >
            <div className="flex items-center justify-center space-x-1">
              <span>📂</span>
              <span>全部网站</span>
            </div>
          </button>
        </div>
        
        {/* Screenshots Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {screenshots.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">📷</span>
              </div>
              <p className="text-sm">暂无截图</p>
              <p className="text-xs text-gray-400 mt-1">开始截图来查看历史记录</p>
            </div>
          ) : (
            screenshots.map((shot) => (
              <div key={shot.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
                {/* Time and URL Info */}
                <div className="p-3 bg-gray-50 border-b border-gray-100">
                  <div className="flex items-center space-x-2 text-xs text-gray-600 mb-1">
                    <span>🕒</span>
                    <span>{new Date(shot.timestamp).toLocaleString()}</span>
                  </div>
                  {shot.originalUrl && (
                    <div className="flex items-start space-x-2">
                      <span className="text-xs text-gray-500 mt-0.5">🔗</span>
                      <a 
                        href={shot.originalUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800 break-all leading-relaxed hover:underline"
                      >
                        {shot.originalUrl}
                      </a>
                    </div>
                  )}
                </div>
                
                {/* Screenshot Image */}
                <div className="relative group">
                  <img 
                    src={shot.imageData} 
                    alt="Screenshot" 
                    className="w-full h-auto cursor-pointer transition-transform duration-200 group-hover:scale-105"
                    onClick={() => window.open(shot.imageData, "_blank")}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 flex items-center justify-center">
                    <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/50 px-2 py-1 rounded text-xs">
                      点击查看大图
                    </span>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="p-3 bg-gray-50 flex justify-end">
                  <button 
                    onClick={() => handleDeleteScreenshot(shot.id)}
                    className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded-md transition-colors duration-200 flex items-center space-x-1"
                  >
                    <span>🗑️</span>
                    <span>删除</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
