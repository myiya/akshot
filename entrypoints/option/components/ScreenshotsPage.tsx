import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Screenshot, WebsiteCategory } from '../types';
import { getDomainFromUrl, getWebsiteIcon, getWebsiteName } from '../utils';

interface ScreenshotsPageProps {
  screenshots: Screenshot[];
  websiteCategories: WebsiteCategory[];
  deleteScreenshot: (id: string) => Promise<boolean>;
  downloadAllScreenshots: (screenshots: Screenshot[]) => Promise<void>;
}

export default function ScreenshotsPage({ 
  screenshots,
  websiteCategories, 
  deleteScreenshot,
  downloadAllScreenshots 
}: ScreenshotsPageProps) {
  const navigate = useNavigate();
  const { domain } = useParams<{ domain: string }>();
  
  const getFilteredScreenshots = () => {
    if (!domain) return [];
    return screenshots.filter(shot => {
      const shotDomain = getDomainFromUrl(shot.originalUrl || shot.url || '');
      return shotDomain === domain;
    });
  };

  const filteredScreenshots = getFilteredScreenshots();
  const category = websiteCategories.find(cat => cat.domain === domain);

  const handleDeleteScreenshot = async (id: string) => {
    if (confirm('确定要删除这张截图吗？')) {
      await deleteScreenshot(id);
    }
  };

  const handleBackToCategories = () => {
    navigate('/categories');
  };

  const handleViewDetail = (screenshot: Screenshot) => {
    navigate(`/detail/${screenshot.id}`);
  };

  return (
    <div className="akshot-screenshots-page">
      <div className="akshot-category-breadcrumb">
        <div className="akshot-breadcrumb-left">
          <button 
            className="akshot-breadcrumb-back"
            onClick={handleBackToCategories}
          >
            ← 返回分类
          </button>
          <div className="akshot-breadcrumb-current">
            📸 {category?.name || domain}
          </div>
        </div>
        <div className="akshot-breadcrumb-right">
          <button 
            className="akshot-download-all-btn"
            onClick={() => downloadAllScreenshots(filteredScreenshots)}
          >
            📦 下载全部
          </button>
        </div>
      </div>
      
      <div className="akshot-screenshots-grid">
        {filteredScreenshots.length === 0 ? (
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
          filteredScreenshots.map((shot, index) => (
            <div key={`${shot.timestamp}-${index}`} className="akshot-screenshot-card">
              <div className="akshot-card-image-container">
                <img 
                  src={shot.dataUrl || shot.imageData} 
                  alt="Screenshot" 
                  className="akshot-card-image"
                  onClick={() => handleViewDetail(shot)}
                />
                <div className="akshot-card-overlay">
                  <button 
                    className="akshot-card-view-btn"
                    onClick={() => handleViewDetail(shot)}
                    title="查看详情"
                  >
                    🔍
                  </button>
                  <button 
                    className="akshot-card-delete-btn"
                    onClick={() => handleDeleteScreenshot(shot.id)}
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
  );
}