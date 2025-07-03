import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { sendMessage } from '../../messaging';
import JSZip from 'jszip';
import './style.css';

// 导入类型
import { WebsiteCategory, Screenshot } from './types';

// 导入页面组件
import CategoriesPage from './components/CategoriesPage';
import ScreenshotsPage from './components/ScreenshotsPage';
import DetailPage from './components/DetailPage';

// 导入工具函数
import { getDomainFromUrl, getWebsiteIcon, getWebsiteName } from './utils';
import { getAllScreenshots, deleteScreenshot as deleteScreenshotFromDB } from '../../utils/db';

export default function App() {
  const navigate = useNavigate();
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [websiteCategories, setWebsiteCategories] = useState<WebsiteCategory[]>([]);

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



  // 删除截图
  const deleteScreenshot = async (id: string) => {
    try {
      await deleteScreenshotFromDB(id);
      setScreenshots(screenshots.filter(s => s.id !== id));
      
      // 更新分类数据
      loadScreenshots();
      return true;
    } catch (error) {
      console.error('删除截图失败:', error);
      return false;
    }
  };

  const handleDeleteScreenshot = async (screenshot: Screenshot) => {
    setScreenshots(prev => prev.filter(s => s.id !== screenshot.id));
    setWebsiteCategories(prev => 
      prev.map(category => ({
        ...category,
        screenshots: category.screenshots.filter(s => s.id !== screenshot.id)
      })).filter(category => category.screenshots.length > 0)
    );
  };

  // 下载单个截图
  const downloadScreenshot = async (screenshot: Screenshot) => {
    try {
      const a = document.createElement('a');
      a.href = screenshot.imageData;
      a.download = `${screenshot.id}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error('下载截图失败:', error);
    }
  };

  // 下载所有截图
  const downloadAllScreenshots = async (screenshotsToDownload: Screenshot[]) => {
    try {
      if (screenshotsToDownload.length === 0) {
        alert('没有可下载的截图');
        return;
      }

      const zip = new JSZip();
      
      screenshotsToDownload.forEach((shot, index) => {
        const imageData = shot.dataUrl || shot.imageData;
        if (imageData) {
          const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
          const timestamp = new Date(shot.timestamp).toISOString().replace(/[:.]/g, '-');
          const filename = `screenshot_${timestamp}_${index + 1}.png`;
          zip.file(filename, base64Data, { base64: true });
        }
      });

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'screenshots.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('下载截图失败:', error);
    }
  };

  useEffect(() => {
    loadScreenshots();
    
    // 检查是否有 URL 查询参数中的 screenshotId（兼容旧版本）
    const urlParams = new URLSearchParams(window.location.search);
    const screenshotId = urlParams.get('screenshotId');
    
    if (screenshotId) {
      // 重定向到详情页
      navigate(`/detail/${screenshotId}`, { replace: true });
      // 清理 URL
      window.history.replaceState({}, '', window.location.pathname + window.location.hash);
    }
  }, [navigate]);

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
        <Routes>
          <Route path="/" element={<Navigate to="/categories" replace />} />
          <Route 
            path="/categories" 
            element={
              <CategoriesPage 
                websiteCategories={websiteCategories}
                downloadAllScreenshots={downloadAllScreenshots}
              />
            } 
          />
          <Route 
            path="/screenshots/:domain" 
            element={
              <ScreenshotsPage 
                screenshots={screenshots}
                websiteCategories={websiteCategories}
                deleteScreenshot={deleteScreenshot}
                downloadAllScreenshots={downloadAllScreenshots}
              />
            } 
          />
          <Route 
            path="/detail/:id" 
            element={
              <DetailPage 
                screenshots={screenshots}
                deleteScreenshot={deleteScreenshot}
                downloadScreenshot={downloadScreenshot}
              />
            } 
          />
        </Routes>
      </div>
    </div>
  );
}