import React, { useState, useEffect } from 'react';
import { getAllScreenshots, deleteScreenshot as deleteScreenshotFromDB } from '../../utils/db';
import { sendMessage } from '../../messaging';
import JSZip from 'jszip';
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
  const [currentView, setCurrentView] = useState<'categories' | 'screenshots' | 'detail'>('categories');
  const [selectedScreenshot, setSelectedScreenshot] = useState<any>(null);

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

  // 下载所有截图
  const downloadAllScreenshots = async (categoryDomain: string) => {
    try {
      // 根据域名过滤截图
      const categoryScreenshots = screenshots.filter(shot => {
        const domain = getDomainFromUrl(shot.originalUrl || shot.url || '');
        return domain === categoryDomain;
      });
      
      if (categoryScreenshots.length === 0) {
        alert('没有可下载的截图');
        return;
      }

      const zip = new JSZip();
      const categoryName = websiteCategories.find(cat => cat.domain === categoryDomain)?.name || categoryDomain;
      
      categoryScreenshots.forEach((shot, index) => {
        const imageData = shot.dataUrl || shot.imageData;
        if (imageData) {
          // 移除 data:image/png;base64, 前缀
          const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
          const timestamp = new Date(shot.timestamp).toISOString().replace(/[:.]/g, '-');
          const filename = `${categoryName}_${timestamp}_${index + 1}.png`;
          zip.file(filename, base64Data, { base64: true });
        }
      });

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${categoryName}_screenshots.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('下载截图失败:', error);
      alert('下载失败，请重试');
    }
  };

  // 检查URL参数并处理直接跳转到图片详情
  const checkUrlParams = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const screenshotId = urlParams.get('screenshotId');
    
    if (screenshotId) {
      // 找到对应的截图并跳转到详情页面
      const screenshot = screenshots.find(shot => shot.id === screenshotId);
      if (screenshot) {
        setSelectedScreenshot(screenshot);
        setCurrentView('detail');
      }
    }
  };

  useEffect(() => {
    loadScreenshots();
  }, []);

  useEffect(() => {
    if (screenshots.length > 0) {
      checkUrlParams();
    }
  }, [screenshots]);

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
        {currentView === 'detail' ? (
          // 图片详情页面
          <div className="akshot-detail-page">
            <div className="akshot-detail-breadcrumb">
              <button 
                className="akshot-breadcrumb-back"
                onClick={handleBackToCategories}
              >
                ← 返回分类
              </button>
              <span className="akshot-breadcrumb-current">
                图片详情
              </span>
            </div>
            
            {selectedScreenshot && (
              <div className="akshot-detail-content">
                <div className="akshot-detail-image-section">
                  <img 
                    src={selectedScreenshot.imageData} 
                    alt="Screenshot Detail" 
                    className="akshot-detail-image"
                  />
                  <div className="akshot-detail-actions">
                    <button 
                      className="akshot-detail-action-btn akshot-detail-view-btn"
                      onClick={() => {
                        const base64Data = selectedScreenshot.imageData;
                        const byteCharacters = atob(base64Data.split(',')[1]);
                        const byteNumbers = new Array(byteCharacters.length);
                        for (let i = 0; i < byteCharacters.length; i++) {
                          byteNumbers[i] = byteCharacters.charCodeAt(i);
                        }
                        const byteArray = new Uint8Array(byteNumbers);
                        const blob = new Blob([byteArray], { type: 'image/png' });
                        const blobUrl = URL.createObjectURL(blob);
                        window.open(blobUrl, '_blank');
                      }}
                      title="查看大图"
                    >
                      🔍 查看大图
                    </button>
                    <button 
                      className="akshot-detail-action-btn akshot-detail-delete-btn"
                      onClick={() => {
                        if (selectedScreenshot.id) {
                          deleteScreenshot(selectedScreenshot.id);
                          handleBackToCategories();
                        }
                      }}
                      title="删除截图"
                    >
                      🗑️ 删除
                    </button>
                  </div>
                </div>
                
                <div className="akshot-detail-info-section">
                  <div className="akshot-detail-info-card">
                    <h3>网站信息</h3>
                    <div className="akshot-detail-info-item">
                      <span className="akshot-detail-info-label">网站名称:</span>
                      <span className="akshot-detail-info-value">
                        {getWebsiteIcon(getDomainFromUrl(selectedScreenshot.originalUrl || selectedScreenshot.url || ''))} 
                        {getWebsiteName(getDomainFromUrl(selectedScreenshot.originalUrl || selectedScreenshot.url || ''))}
                      </span>
                    </div>
                    <div className="akshot-detail-info-item">
                      <span className="akshot-detail-info-label">域名:</span>
                      <span className="akshot-detail-info-value">
                        {getDomainFromUrl(selectedScreenshot.originalUrl || selectedScreenshot.url || '')}
                      </span>
                    </div>
                    <div className="akshot-detail-info-item">
                      <span className="akshot-detail-info-label">完整URL:</span>
                      <span className="akshot-detail-info-value akshot-detail-url">
                        <a href={selectedScreenshot.originalUrl || selectedScreenshot.url} target="_blank" rel="noopener noreferrer">
                          {selectedScreenshot.originalUrl || selectedScreenshot.url}
                        </a>
                      </span>
                    </div>
                    <div className="akshot-detail-info-item">
                      <span className="akshot-detail-info-label">截图时间:</span>
                      <span className="akshot-detail-info-value">
                        {new Date(selectedScreenshot.timestamp).toLocaleString('zh-CN', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className="akshot-detail-info-item">
                      <span className="akshot-detail-info-label">图片ID:</span>
                      <span className="akshot-detail-info-value akshot-detail-id">
                        {selectedScreenshot.id}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : currentView === 'categories' ? (
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
                          <button 
                            className="akshot-category-download-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadAllScreenshots(category.domain);
                            }}
                            title="下载该网站的所有截图"
                          >
                            📦 下载全部
                          </button>
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
              <div className="akshot-breadcrumb-left">
                <button 
                  className="akshot-breadcrumb-back"
                  onClick={() => setCurrentView('categories')}
                >
                  ← 返回分类
                </button>
                <div className="akshot-breadcrumb-current">
                  📸 {websiteCategories.find(cat => cat.domain === selectedCategory)?.name || selectedCategory}
                </div>
              </div>
              <div className="akshot-breadcrumb-right">
                <button 
                  className="akshot-download-all-btn"
                  onClick={() => downloadAllScreenshots(selectedCategory)}
                >
                  📦 下载全部
                </button>
              </div>
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