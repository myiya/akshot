import { useState, useEffect } from 'react';
import { onMessage, sendMessage } from "@/messaging";
import ScreenShot from "js-web-screen-shot";
import './style.css';

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
    // 同时保留原有的onMessage监听（用于其他消息）
    onMessage("take-to-content", (message: any) => {
      console.log("Content component received screenshot request via onMessage:", message);
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
        className="akshot-toggle-button" 
        title="查看截图历史" 
        onClick={() => setShowSidebar(!showSidebar)}
      >
        <span className="akshot-toggle-icon">📸</span>
      </div>
      
      {/* Sidebar */}
      <div className={`akshot-sidebar ${
        showSidebar ? 'akshot-sidebar-open' : ''
      }`}>
        {/* Header */}
        <div className="akshot-sidebar-header">
          {/* Background decoration */}
          <div className="akshot-header-bg-1"></div>
          <div className="akshot-header-bg-2"></div>
          <div className="akshot-header-bg-3"></div>
          
          <div className="akshot-header-content">
            <div className="akshot-header-icon">
              <span className="akshot-header-icon-emoji">📸</span>
            </div>
            <div>
              <h3 className="akshot-header-title">截图历史</h3>
              <p className="akshot-header-subtitle">Screenshot History</p>
            </div>
          </div>
          
          <button 
            onClick={() => setShowSidebar(false)}
            className="akshot-header-close"
          >
            <span className="akshot-header-close-icon">×</span>
          </button>
        </div>
        
        {/* Tabs */}
        <div className="akshot-tabs">
          <button 
            className={`akshot-tab ${
              activeTab === 'current' ? 'akshot-tab-active' : ''
            }`}
            onClick={() => handleTabChange('current')}
          >
            <div className="akshot-tab-content">
              <span>🌐</span>
              <span>当前网站</span>
            </div>
          </button>
          <button 
            className={`akshot-tab ${
              activeTab === 'all' ? 'akshot-tab-active' : ''
            }`}
            onClick={() => handleTabChange('all')}
          >
            <div className="akshot-tab-content">
              <span>📂</span>
              <span>全部网站</span>
            </div>
          </button>
        </div>
        
        {/* Screenshots Container */}
        <div className="akshot-screenshots-container">
          {screenshots.length === 0 ? (
            <div className="akshot-empty-state">
              <div className="akshot-empty-icon">
                <span className="akshot-empty-emoji">📷</span>
              </div>
              <p className="akshot-empty-title">暂无截图</p>
              <p className="akshot-empty-subtitle">开始截图来查看历史记录</p>
            </div>
          ) : (
            screenshots.map((shot) => (
              <div key={shot.id} className="akshot-screenshot-item">
                {/* Time and URL Info */}
                <div className="akshot-screenshot-header">
                  <div className="akshot-screenshot-time">
                    <span>🕒</span>
                    <span>{new Date(shot.timestamp).toLocaleString()}</span>
                  </div>
                  {shot.originalUrl && (
                    <div className="akshot-screenshot-url-container">
                      <span className="akshot-screenshot-url-icon">🔗</span>
                      <a 
                        href={shot.originalUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="akshot-screenshot-url-link"
                      >
                        {shot.originalUrl}
                      </a>
                    </div>
                  )}
                </div>
                
                {/* Screenshot Image */}
                <div className="akshot-screenshot-image-wrapper">
                  <img 
                    src={shot.imageData} 
                    alt="Screenshot" 
                    className="akshot-screenshot-image"
                    onClick={() => window.open(shot.imageData, "_blank")}
                  />
                  <div className="akshot-screenshot-overlay">
                    <span className="akshot-screenshot-overlay-text">
                      点击查看大图
                    </span>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="akshot-screenshot-actions">
                  <button 
                    onClick={() => handleDeleteScreenshot(shot.id)}
                    className="akshot-screenshot-delete-button"
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
