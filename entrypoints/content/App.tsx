import { useState, useEffect } from 'react';
import { onMessage, sendMessage } from "@/messaging";
import ScreenShot from "js-web-screen-shot";
import './style.css';

// 添加调试日志
console.log("Content script component initialized");

// 网站分类接口
interface WebsiteCategory {
  domain: string;
  name: string;
  icon: string;
  count: number;
  screenshots: any[];
}

// 从URL提取域名
const getDomainFromUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return 'unknown';
  }
};

// 获取网站图标
const getWebsiteIcon = (domain: string): string => {
  const iconMap: { [key: string]: string } = {
    'baidu.com': '🔍',
    'google.com': '🌐',
    'github.com': '🐙',
    'stackoverflow.com': '📚',
    'youtube.com': '📺',
    'twitter.com': '🐦',
    'facebook.com': '📘',
    'linkedin.com': '💼',
    'instagram.com': '📷',
    'reddit.com': '🤖',
    'wikipedia.org': '📖',
    'amazon.com': '🛒',
    'netflix.com': '🎬',
    'spotify.com': '🎵',
    'default': '🌍'
  };
  
  for (const [key, icon] of Object.entries(iconMap)) {
    if (domain.includes(key)) return icon;
  }
  return iconMap.default;
};

// 获取网站名称
const getWebsiteName = (domain: string): string => {
  const nameMap: { [key: string]: string } = {
    'baidu.com': '百度',
    'google.com': 'Google',
    'github.com': 'GitHub',
    'stackoverflow.com': 'Stack Overflow',
    'youtube.com': 'YouTube',
    'twitter.com': 'Twitter',
    'facebook.com': 'Facebook',
    'linkedin.com': 'LinkedIn',
    'instagram.com': 'Instagram',
    'reddit.com': 'Reddit',
    'wikipedia.org': 'Wikipedia',
    'amazon.com': 'Amazon',
    'netflix.com': 'Netflix',
    'spotify.com': 'Spotify'
  };
  
  for (const [key, name] of Object.entries(nameMap)) {
    if (domain.includes(key)) return name;
  }
  return domain;
};

export default () => {
  const [screenshots, setScreenshots] = useState<any[]>([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [activeTab, setActiveTab] = useState<'current' | 'all'>('current');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [websiteCategories, setWebsiteCategories] = useState<WebsiteCategory[]>([]);
  const currentUrl = window.location.href.split("#")[0].split("?")[0];

  // 加载截图并分类
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
      
      // 按网站分类
      const categoryMap = new Map<string, WebsiteCategory>();
      
      shots.forEach((shot: any) => {
        const domain = getDomainFromUrl(shot.originalUrl || shot.url || '');
        
        if (!categoryMap.has(domain)) {
          categoryMap.set(domain, {
            domain,
            name: getWebsiteName(domain),
            icon: getWebsiteIcon(domain),
            count: 0,
            screenshots: []
          });
        }
        
        const category = categoryMap.get(domain)!;
        category.count++;
        category.screenshots.push(shot);
      });
      
      const categories = Array.from(categoryMap.values()).sort((a, b) => b.count - a.count);
      setWebsiteCategories(categories);
      setScreenshots(shots);
      
      console.log(`Loaded ${activeTab} screenshots:`, shots.length, 'categories:', categories.length);
    } catch (error) {
      console.error("Failed to load screenshots:", error);
    }
  };

  // 获取过滤后的截图
  const getFilteredScreenshots = () => {
    if (selectedCategory === 'all') {
      return screenshots;
    }
    
    const category = websiteCategories.find(cat => cat.domain === selectedCategory);
    return category ? category.screenshots : [];
  };

  // 切换标签页
  const handleTabChange = (tab: 'current' | 'all') => {
    setActiveTab(tab);
    setSelectedCategory('all'); // 重置分类选择
  };
  
  // 选择网站分类
  const handleCategorySelect = (domain: string) => {
    setSelectedCategory(domain);
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
        
        {/* Main Content Area */}
        <div className="akshot-main-content">
          {/* Website Category Sidebar */}
          {activeTab === 'all' && websiteCategories.length > 0 && (
            <div className="akshot-category-sidebar">
              <div className="akshot-category-header">
                <h3>网站分类</h3>
              </div>
              <div className="akshot-category-list">
                <button 
                  className={`akshot-category-item ${selectedCategory === 'all' ? 'akshot-category-active' : ''}`}
                  onClick={() => handleCategorySelect('all')}
                >
                  <span className="akshot-category-icon">🌐</span>
                  <span className="akshot-category-name">全部网站</span>
                  <span className="akshot-category-count">{screenshots.length}</span>
                </button>
                {websiteCategories.map((category) => (
                  <button 
                    key={category.domain}
                    className={`akshot-category-item ${selectedCategory === category.domain ? 'akshot-category-active' : ''}`}
                    onClick={() => handleCategorySelect(category.domain)}
                  >
                    <span className="akshot-category-icon">{category.icon}</span>
                    <span className="akshot-category-name">{category.name}</span>
                    <span className="akshot-category-count">{category.count}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Screenshots Content Area */}
          <div className="akshot-content-area">
            {selectedCategory !== 'all' && (
              <div className="akshot-category-breadcrumb">
                <button 
                  className="akshot-breadcrumb-back"
                  onClick={() => handleCategorySelect('all')}
                >
                  ← 返回全部
                </button>
                <span className="akshot-breadcrumb-current">
                  {websiteCategories.find(cat => cat.domain === selectedCategory)?.icon} 
                  {websiteCategories.find(cat => cat.domain === selectedCategory)?.name}
                </span>
              </div>
            )}
            
            <div className="akshot-screenshots-grid">
              {getFilteredScreenshots().length === 0 ? (
                <div className="akshot-empty-state">
                  <div className="akshot-empty-icon">
                    <span className="akshot-empty-emoji">📷</span>
                  </div>
                  <div className="akshot-empty-text">
                    <h3 className="akshot-empty-title">暂无截图</h3>
                    <p className="akshot-empty-subtitle">
                      {activeTab === 'current' 
                        ? '当前页面还没有截图' 
                        : selectedCategory === 'all' 
                          ? '还没有保存任何截图'
                          : '该网站还没有截图'}
                    </p>
                  </div>
                </div>
              ) : (
                getFilteredScreenshots().map((shot, index) => (
                  <div key={`${shot.timestamp}-${index}`} className="akshot-screenshot-card">
                    <div className="akshot-card-image-container">
                      <img 
                        src={shot.dataUrl || shot.imageData} 
                        alt="Screenshot" 
                        className="akshot-card-image"
                        onClick={() => window.open(shot.dataUrl || shot.imageData, '_blank')}
                      />
                      <div className="akshot-card-overlay">
                        <button 
                          className="akshot-card-view-btn"
                          onClick={() => window.open(shot.dataUrl || shot.imageData, '_blank')}
                          title="查看大图"
                        >
                          🔍
                        </button>
                        <button 
                          className="akshot-card-delete-btn"
                          onClick={() => {
                            if (shot.id) {
                              deleteScreenshot(shot.id);
                            }
                          }}
                          title="删除截图"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    <div className="akshot-card-info">
                      <div className="akshot-card-website">
                        <span className="akshot-card-website-icon">
                          {getWebsiteIcon(getDomainFromUrl(shot.originalUrl || shot.url || ''))}
                        </span>
                        <span className="akshot-card-website-name">
                          {getWebsiteName(getDomainFromUrl(shot.originalUrl || shot.url || ''))}
                        </span>
                      </div>
                      <div className="akshot-card-url" title={shot.originalUrl || shot.url}>
                        {(shot.originalUrl || shot.url || '').length > 40 
                          ? (shot.originalUrl || shot.url || '').substring(0, 40) + '...' 
                          : (shot.originalUrl || shot.url || '')}
                      </div>
                      <div className="akshot-card-time">
                        {new Date(shot.timestamp).toLocaleString('zh-CN', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
