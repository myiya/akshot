import { dataUrltoBlob } from "@/utils";
import { getActTabId, onMessage, sendActMessage } from "@/messaging";
import { saveScreenshot, getScreenshotsByUrl, getAllScreenshots, deleteScreenshot, clearScreenshotsByUrl } from "@/utils/db";

export default defineBackground(() => {
  console.log('Background script initialized', { id: browser.runtime.id });
  
  // 监听来自popup的截图请求，转发到content脚本
  onMessage('take-to-content', async ({ data, sender }) => {
    try {
      console.log('Background received take-to-content message:', data);

      await sendActMessage('take-to-content', {
        type: 'TAKE_SCREENSHOT', 
        payload: data
      })
      
    } catch (error) {
      console.error('Failed to forward screenshot request:', error);
    }
  });

  // 下载图片
  onMessage('download-screenshot', async({ data }) => {
    // 获取当前活动标签页窗口截图
    const dataUrl = await getCurrentCapture();
    console.log('dataUrl', dataUrl);
    
  });
  
  // 监听来自content脚本的数据库操作请求
  onMessage('save-screenshot', async ({ data }) => {
    try {
      const { url, imageData } = data.payload;
      const id = await saveScreenshot(url, imageData);
      return id;
    } catch (error) {
      console.error('Failed to save screenshot:', error);
      throw error;
    }
  });
  
  onMessage('get-screenshots', async ({ data }) => {
    try {
      const { url } = data.payload || {};
      if (!url) throw new Error('URL is required');
      const screenshots = await getScreenshotsByUrl(url);
      return screenshots;
    } catch (error) {
      console.error('Failed to get screenshots:', error);
      throw error;
    }
  });
  
  onMessage('get-all-screenshots', async () => {
    try {
      const screenshots = await getAllScreenshots();
      return screenshots;
    } catch (error) {
      console.error('Failed to get all screenshots:', error);
      throw error;
    }
  });
  
  onMessage('delete-screenshot', async ({ data }) => {
    try {
      const { id } = data.payload;
      await deleteScreenshot(id);
      return true;
    } catch (error) {
      console.error('Failed to delete screenshot:', error);
      throw error;
    }
  });
  
  onMessage('clear-screenshots-by-url', async ({ data }) => {
    try {
      const { url } = data.payload;
      await clearScreenshotsByUrl(url);
      return true;
    } catch (error) {
      console.error('Failed to clear screenshots:', error);
      throw error;
    }
  });

  // 监听打开选项页面的请求
  onMessage('open-options-page', async ({ data, sender }) => {
    try {
      console.log('Background received open-options-page message:', data);
      
      // 如果有图片ID，使用哈希路由传递
      if (data.payload?.screenshotId) {
        const optionsUrl = browser.runtime.getURL('/option.html') + `#/detail/${data.payload.screenshotId}`;
        await browser.tabs.create({ url: optionsUrl });
      } else {
        await browser.runtime.openOptionsPage();
      }
    } catch (error) {
      console.error('Failed to open options page:', error);
    }
  });

  // 监听切换侧边栏的请求，转发到content脚本
  onMessage('toggle-sidebar', async ({ data, sender }) => {
    try {
      console.log('Background received toggle-sidebar message:', data);
      
      await sendActMessage('toggle-sidebar', {
        type: 'TOGGLE_SIDEBAR',
        payload: data.payload
      });
      
      console.log('Toggle sidebar message sent to content script');
    } catch (error) {
      console.error('Failed to toggle sidebar:', error);
    }
  });
});

async function downloadImage(dataUrl: string): Promise<void> {
  const filename = `Screenshot-${new Date().toISOString().replaceAll(":", "-")}.png`;
  console.log(`Downloading image: ${filename}`, { dataUrl });

  if (import.meta.env.MANIFEST_VERSION === 3) {
    // There are known issues with download images in background scripts: https://issues.chromium.org/issues/40774955
    // But this works well enough for small screenshots
    await browser.downloads.download({
      url: dataUrl,
      filename,
    });
  } else {
    // Use "createObjectURL" for MV2
    const blob = dataUrltoBlob(dataUrl);
    const objectUrl = URL.createObjectURL(blob);
    await browser.downloads.download({
      url: objectUrl,
      filename,
    });
  }
}