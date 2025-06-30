import { dataUrltoBlob } from "@/utils";
import { onMessage } from "@/messaging";
import { saveScreenshot, getScreenshotsByUrl, getAllScreenshots, deleteScreenshot, clearScreenshotsByUrl } from "@/utils/db";

export default defineBackground(() => {
  console.log('Background script initialized', { id: browser.runtime.id });
  
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