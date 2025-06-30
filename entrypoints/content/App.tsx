import { useEffect, useState } from "react";
import { onMessage } from "@/messaging";
import ScreenShot from "js-web-screen-shot";
import { saveScreenshot, getScreenshotsByUrl, deleteScreenshot } from "@/utils/db";
import "./style.css";

// 添加调试日志
console.log("Content script component initialized");

export default () => {
  const [screenshots, setScreenshots] = useState<any[]>([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const currentUrl = window.location.href.split("#")[0].split("?")[0]; // 获取基本URL，不包含查询参数和锚点

  // 加载当前网站的截图
  const loadScreenshots = async () => {
    try {
      const shots = await getScreenshotsByUrl(currentUrl);
      setScreenshots(shots);
      console.log("Loaded screenshots:", shots.length);
    } catch (error) {
      console.error("Failed to load screenshots:", error);
    }
  };

  // 删除截图
  const handleDeleteScreenshot = async (id: string) => {
    try {
      await deleteScreenshot(id);
      await loadScreenshots(); // 重新加载截图列表
    } catch (error) {
      console.error("Failed to delete screenshot:", error);
    }
  };

  useEffect(() => {
    // 初始加载截图
    loadScreenshots();

    // 监听截图请求
    onMessage("test-to-content", (message: any) => {
      console.log("Content component received screenshot request:", message);
      new ScreenShot({
        enableWebRtc: false,
        level: 99999,
        completeCallback: async ({ base64, cutInfo }) => {
          console.log("Screenshot taken", cutInfo);
          try {
            // 保存截图到IndexedDB
            await saveScreenshot(currentUrl, base64);
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

    // 创建侧边栏切换按钮
    const toggleButton = document.createElement("div");
    toggleButton.className = "akshot-toggle-button";
    toggleButton.innerHTML = "📸";
    toggleButton.title = "查看截图历史";
    toggleButton.onclick = () => setShowSidebar(!showSidebar);
    document.body.appendChild(toggleButton);

    return () => {
      // 清理
      document.body.removeChild(toggleButton);
    };
  }, []);

  // 如果没有截图，不显示侧边栏
  if (screenshots.length === 0 && !showSidebar) {
    return null;
  }

  return (
    <div className={`akshot-sidebar ${showSidebar ? "open" : ""}`}>
      <div className="akshot-sidebar-header">
        <h3>截图历史</h3>
        <button onClick={() => setShowSidebar(false)}>×</button>
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
  );
};
