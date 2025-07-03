import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { WebsiteCategory, Screenshot } from '../types';

interface CategoriesPageProps {
  websiteCategories: WebsiteCategory[];
  downloadAllScreenshots: (screenshots: Screenshot[]) => Promise<void>;
}

const CategoriesPage: React.FC<CategoriesPageProps> = ({ 
  websiteCategories,
  downloadAllScreenshots
}) => {
  const navigate = useNavigate();

  return (
    <div className="akshot-categories-page">
      <div className="akshot-page-header">
        <h2>网站分类</h2>
        <p>共 {websiteCategories.length} 个网站，{websiteCategories.reduce((acc, cat) => acc + cat.count, 0)} 张截图</p>
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
                onClick={() => navigate(`/screenshots/${category.domain}`)}
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
                    <div className="akshot-category-actions">
                      <button 
                        className="akshot-category-detail-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (latestScreenshot) {
                            navigate(`/detail/${latestScreenshot.id}`);
                          }
                        }}
                        title="查看详情"
                        disabled={!latestScreenshot}
                      >
                        📋 详情
                      </button>
                      <button 
                        className="akshot-category-download-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadAllScreenshots(category.screenshots);
                        }}
                        title="下载该网站的所有截图"
                      >
                        📦 下载全部
                      </button>
                    </div>
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
  );
};

export default CategoriesPage;