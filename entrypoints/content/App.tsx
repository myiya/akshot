import { useState, useEffect } from "react";
import { onMessage, sendMessage } from "@/messaging";
import ScreenShot from "js-web-screen-shot";
import "./style.css";

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
      }
    });
  }, []);

  return (
    <div>
      <div className="akshot-toggle-button" title="查看截图历史" onClick={() => setShowSidebar(!showSidebar)}>📸</div>
      <div className={`akshot-sidebar ${showSidebar ? "open" : ""}`}>
        <div className="akshot-sidebar-header">
          <h3>截图历史</h3>
          <button onClick={() => setShowSidebar(false)}>×</button>
        </div>
        <div className="akshot-tabs">
          <button 
            className={`akshot-tab ${activeTab === 'current' ? 'active' : ''}`}
            onClick={() => handleTabChange('current')}
          >
            当前网站
          </button>
          <button 
            className={`akshot-tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => handleTabChange('all')}
          >
            全部网站
          </button>
        </div>
        <div className="akshot-screenshots-container">
          {screenshots.length === 0 ? (
            <p className="akshot-no-screenshots">暂无截图</p>
          ) : (
            screenshots.map((shot) => (
              <div key={shot.id} className="akshot-screenshot-item">
                <div className="akshot-screenshot-time">
                  {new Date(shot.timestamp).toLocaleString()}
                </div>
                {shot.originalUrl && (
                  <div className="akshot-screenshot-url">
                    <a href={shot.originalUrl} target="_blank" rel="noopener noreferrer">
                      {shot.originalUrl}
                    </a>
                  </div>
                )}
                <img 
                  src={shot.imageData} 
                  alt="Screenshot" 
                  onClick={() => window.open(shot.imageData, "_blank")}
                />
                <div className="akshot-screenshot-actions">
                  <button onClick={() => handleDeleteScreenshot(shot.id)}>
                    删除
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
