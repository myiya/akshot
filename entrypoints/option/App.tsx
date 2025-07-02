import { useState, useEffect } from 'react';
import { sendMessage } from "@/messaging";
import './style.css';

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

export default function App() {
  const [screenshots, setScreenshots] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [websiteCategories, setWebsiteCategories] = useState<WebsiteCategory[]>([]);
  const [currentView, setCurrentView] = useState<'categories' | 'screenshots'>('categories');

  // 加载所有截图并分类
  const loadScreenshots = async () => {
    try {
      const shots = await sendMessage('get-all-screenshots', {
        type: 'GET_ALL_SCREENSHOTS'
      });
      
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
      
      // 按截图数量排序
      const categories = Array.from(categoryMap.values()).sort((a, b) => b.count - a.count);
      setWebsiteCategories(categories);
      setScreenshots(shots);
      
      console.log(`Loaded screenshots:`, shots.length, 'categories:', categories.length);
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

  // 选择网站分类
  const handleCategorySelect = (domain: string) => {
    setSelectedCategory(domain);
    setCurrentView('screenshots');
  };

  // 返回分类页面
  const handleBackToCategories = () => {
    setCurrentView('categories');
    setSelectedCategory('all');
  };

  // 删除截图
  const deleteScreenshot = async (id: string) => {
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
    loadScreenshots();
  }, []);

  return (
    <div className="akshot-option-container">
      {/* Header */}
      <div className="akshot-option-header">
        <div className="akshot-header-content">
          <div className="akshot-header-icon">
            <span className="akshot-header-icon-emoji">📸</span>
          </div>
          <div>
            <h1 className="akshot-header-title">AkShot 网站管理</h1>
            <p className="akshot-header-subtitle">管理您的截图和网站分类</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="akshot-option-main">
        {currentView === 'categories' ? (
          // 网站分类页面
          <div className="akshot-categories-page">
            <div className="akshot-page-header">
              <h2>网站分类</h2>
              <p>共 {websiteCategories.length} 个网站，{screenshots.length} 张截图</p>
            </div>
            
            {websiteCategories.length === 0 ? (
              <div className="akshot-empty-state">
                <div className="akshot-empty-icon">
                  <span className="akshot-empty-emoji">📷</span>
                </div>
                <div className="akshot-empty-text">
                  <h3 className="akshot-empty-title">暂无截图</h3>
                  <p className="akshot-empty-subtitle">还没有保存任何截图</p>
                </div>
              </div>
            ) : (
              <div className="akshot-categories-grid">
                {websiteCategories.map((category) => {
                  const latestScreenshot = category.screenshots[category.screenshots.length - 1];
                  return (
                    <div 
                      key={category.domain} 
                      className="akshot-category-card"
                      onClick={() => handleCategorySelect(category.domain)}
                    >
                      <div className="akshot-category-preview">
                        {latestScreenshot ? (
                          <img 
                            src={latestScreenshot.dataUrl || latestScreenshot.imageData} 
                            alt={`${category.name} 截图`}
                            className="akshot-category-image"
                          />
                        ) : (
                          <div className="akshot-category-placeholder">
                            <span className="akshot-category-placeholder-icon">{category.icon}</span>
                          </div>
                        )}
                        <div className="akshot-category-count-badge">
                          {category.count}
                        </div>
                      </div>
                      <div className="akshot-category-info">
                        <div className="akshot-category-header">
                          <span className="akshot-category-icon">{category.icon}</span>
                          <span className="akshot-category-name">{category.name}</span>
                        </div>
                        <div className="akshot-category-domain">{category.domain}</div>
                        <div className="akshot-category-meta">
                          <span>{category.count} 张截图</span>
                          {latestScreenshot && (
                            <span className="akshot-category-time">
                              {new Date(latestScreenshot.timestamp).toLocaleDateString('zh-CN')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          // 分类截图页面
          <div className="akshot-screenshots-page">
            <div className="akshot-category-breadcrumb">
              <button 
                className="akshot-breadcrumb-back"
                onClick={handleBackToCategories}
              >
                ← 返回分类
              </button>
              <span className="akshot-breadcrumb-current">
                {websiteCategories.find(cat => cat.domain === selectedCategory)?.icon} 
                {websiteCategories.find(cat => cat.domain === selectedCategory)?.name}
              </span>
            </div>
            
            <div className="akshot-screenshots-grid">
              {getFilteredScreenshots().length === 0 ? (
                <div className="akshot-empty-state">
                  <div className="akshot-empty-icon">
                    <span className="akshot-empty-emoji">📷</span>
                  </div>
                  <div className="akshot-empty-text">
                    <h3 className="akshot-empty-title">暂无截图</h3>
                    <p className="akshot-empty-subtitle">该网站还没有截图</p>
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
        )}
      </div>
    </div>
  );
}