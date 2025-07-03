import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Screenshot } from '../types';
import { getDomainFromUrl, getWebsiteIcon, getWebsiteName } from '../utils';

interface DetailPageProps {
  screenshots: Screenshot[];
  deleteScreenshot: (id: string) => Promise<boolean>;
  downloadScreenshot?: (screenshot: Screenshot) => Promise<void>;
}

export default function DetailPage({ screenshots, deleteScreenshot, downloadScreenshot }: DetailPageProps) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const selectedScreenshot = screenshots.find(shot => shot.id === id);

  const handleBackToCategories = () => {
    navigate('/categories');
  };

  const handleBackToScreenshots = () => {
    if (selectedScreenshot) {
      const domain = getDomainFromUrl(selectedScreenshot.originalUrl || selectedScreenshot.url || '');
      navigate(`/screenshots/${domain}`);
    } else {
      navigate('/categories');
    }
  };

  const handleDeleteScreenshot = async () => {
    if (selectedScreenshot && confirm('确定要删除这张截图吗？')) {
      const success = await deleteScreenshot(selectedScreenshot.id);
      if (success) {
        handleBackToScreenshots();
      }
    }
  };

  const handleDownloadScreenshot = async () => {
    if (selectedScreenshot) {
      if (downloadScreenshot) {
        await downloadScreenshot(selectedScreenshot);
      } else {
        // 默认下载逻辑
        const link = document.createElement('a');
        link.href = selectedScreenshot.dataUrl || selectedScreenshot.imageData;
        link.download = `screenshot-${selectedScreenshot.id || Date.now()}.png`;
        link.click();
      }
    }
  };

  const handleViewLarge = () => {
    if (selectedScreenshot) {
      // 将 base64 转换为 Blob URL
      let imgsrc = selectedScreenshot.dataUrl || selectedScreenshot.imageData;
      const byteCharacters = atob(imgsrc.split(',')[1]);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/png' });
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
    }
  };

  if (!selectedScreenshot) {
    return (
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
        <div className="akshot-empty-state">
          <div className="akshot-empty-icon">
            <span className="akshot-empty-emoji">🔍</span>
          </div>
          <div className="akshot-empty-text">
            <h3 className="akshot-empty-title">未找到截图</h3>
            <p className="akshot-empty-subtitle">该截图可能已被删除</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="akshot-detail-page">
      <div className="akshot-detail-breadcrumb">
        <div className="akshot-breadcrumb-left">
          <button 
            className="akshot-breadcrumb-back"
            onClick={handleBackToScreenshots}
          >
            ← 返回列表
          </button>
          <span className="akshot-breadcrumb-current">
            🖼️ 图片详情
          </span>
        </div>
      </div>
      
      <div className="akshot-detail-content">
        <div className="akshot-detail-left">
          <div className="akshot-detail-image-section">
            <div className="akshot-detail-image-container">
              <img 
                src={selectedScreenshot.dataUrl || selectedScreenshot.imageData} 
                alt="Screenshot Detail" 
                className="akshot-detail-image"
              />
              <div className="akshot-detail-image-overlay">
                <button 
                  className="akshot-detail-fullscreen-btn"
                  onClick={handleViewLarge}
                  title="全屏查看"
                >
                  🔍
                </button>
              </div>
            </div>
            <div className="akshot-detail-actions">
              <button 
                className="akshot-detail-action-btn akshot-detail-view-btn"
                onClick={handleViewLarge}
                title="查看大图"
              >
                🔍 查看大图
              </button>
              <button 
                className="akshot-detail-action-btn akshot-detail-download-btn"
                onClick={handleDownloadScreenshot}
                title="下载图片"
              >
                📥 下载图片
              </button>
              <button 
                className="akshot-detail-action-btn akshot-detail-delete-btn"
                onClick={handleDeleteScreenshot}
                title="删除截图"
              >
                🗑️ 删除
              </button>
            </div>
          </div>
        </div>
        
        <div className="akshot-detail-right">
          <div className="akshot-detail-info-section">
            <div className="akshot-detail-website-header">
              <span className="akshot-detail-website-icon">
                {getWebsiteIcon(getDomainFromUrl(selectedScreenshot.originalUrl || selectedScreenshot.url || ''))}
              </span>
              <div className="akshot-detail-website-info">
                <h3 className="akshot-detail-website-name">
                  {getWebsiteName(getDomainFromUrl(selectedScreenshot.originalUrl || selectedScreenshot.url || ''))}
                </h3>
                <p className="akshot-detail-website-domain">
                  {getDomainFromUrl(selectedScreenshot.originalUrl || selectedScreenshot.url || '')}
                </p>
              </div>
            </div>
            
            <div className="akshot-detail-info-grid">
              <div className="akshot-detail-info-card">
                <div className="akshot-detail-info-card-header">
                  <span className="akshot-detail-info-card-icon">🔗</span>
                  <span className="akshot-detail-info-card-title">页面信息</span>
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
                  <span className="akshot-detail-info-label">页面标题:</span>
                  <span className="akshot-detail-info-value">
                    {selectedScreenshot.title || '未知'}
                  </span>
                </div>
              </div>
              
              <div className="akshot-detail-info-card">
                <div className="akshot-detail-info-card-header">
                  <span className="akshot-detail-info-card-icon">⏰</span>
                  <span className="akshot-detail-info-card-title">时间信息</span>
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
                  <span className="akshot-detail-info-label">相对时间:</span>
                  <span className="akshot-detail-info-value">
                    {(() => {
                      const now = Date.now();
                      const diff = now - selectedScreenshot.timestamp;
                      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                      
                      if (days > 0) return `${days}天前`;
                      if (hours > 0) return `${hours}小时前`;
                      if (minutes > 0) return `${minutes}分钟前`;
                      return '刚刚';
                    })()} 
                  </span>
                </div>
              </div>
              
              <div className="akshot-detail-info-card">
                <div className="akshot-detail-info-card-header">
                  <span className="akshot-detail-info-card-icon">📊</span>
                  <span className="akshot-detail-info-card-title">技术信息</span>
                </div>
                <div className="akshot-detail-info-item">
                  <span className="akshot-detail-info-label">图片ID:</span>
                  <span className="akshot-detail-info-value akshot-detail-id">
                    {selectedScreenshot.id}
                  </span>
                </div>
                <div className="akshot-detail-info-item">
                  <span className="akshot-detail-info-label">图片大小:</span>
                  <span className="akshot-detail-info-value">
                    {(() => {
                      const imageData = selectedScreenshot.dataUrl || selectedScreenshot.imageData;
                      const sizeInBytes = Math.round((imageData.length * 3) / 4);
                      if (sizeInBytes < 1024) return `${sizeInBytes} B`;
                      if (sizeInBytes < 1024 * 1024) return `${(sizeInBytes / 1024).toFixed(1)} KB`;
                      return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
                    })()} 
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}