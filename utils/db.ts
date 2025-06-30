import { openDB, DBSchema } from 'idb';

// 定义数据库结构
interface ScreenshotDB extends DBSchema {
  screenshots: {
    key: string; // 使用网站URL作为键
    value: {
      id: string;
      url: string; // 网站URL
      imageData: string; // 图片的base64数据
      timestamp: number; // 截图时间戳
    };
    indexes: { 'by-url': string }; // 按URL索引
  };
}

// 数据库名称和版本
const DB_NAME = 'akshot-db';
const DB_VERSION = 1;

// 初始化数据库
export const initDB = async () => {
  return await openDB<ScreenshotDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // 创建存储对象
      const screenshotsStore = db.createObjectStore('screenshots', { keyPath: 'id' });
      // 创建索引
      screenshotsStore.createIndex('by-url', 'url');
    },
  });
};

// 保存截图
export const saveScreenshot = async (url: string, imageData: string) => {
  const db = await initDB();
  const id = `${url}-${Date.now()}`;
  await db.put('screenshots', {
    id,
    url,
    imageData,
    timestamp: Date.now(),
  });
  return id;
};

// 获取指定网站的所有截图
export const getScreenshotsByUrl = async (url: string) => {
  const db = await initDB();
  const screenshots = await db.getAllFromIndex('screenshots', 'by-url', url);
  return screenshots.sort((a, b) => b.timestamp - a.timestamp); // 按时间倒序排列
};

// 删除截图
export const deleteScreenshot = async (id: string) => {
  const db = await initDB();
  await db.delete('screenshots', id);
};

// 清空指定网站的所有截图
export const clearScreenshotsByUrl = async (url: string) => {
  const db = await initDB();
  const screenshots = await db.getAllFromIndex('screenshots', 'by-url', url);
  const tx = db.transaction('screenshots', 'readwrite');
  for (const screenshot of screenshots) {
    tx.store.delete(screenshot.id);
  }
  await tx.done;
};