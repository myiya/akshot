import { openDB, DBSchema, IDBPCursorWithValue } from 'idb';

// 定义数据库结构
interface ScreenshotDB extends DBSchema {
  screenshots: {
    key: string; // 使用截图ID作为键
    value: {
      id: string;
      url: string; // 网站域名
      originalUrl: string; // 完整的原始URL
      imageData: string; // 图片的base64数据
      timestamp: number; // 截图时间戳
    };
    indexes: { 'by-url': string }; // 按域名索引
  };
}

// 数据库名称和版本
const DB_NAME = 'akshot-db';
const DB_VERSION = 2; // 增加版本号以支持数据库升级

// 从URL提取域名的函数
export const getDomainFromUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (error) {
    console.error('Invalid URL:', url);
    return url; // 如果URL无效，返回原始字符串
  }
};

// 初始化数据库
export const initDB = async () => {
  return await openDB<ScreenshotDB>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      // 处理不同版本的升级
      if (oldVersion < 1) {
        // 首次创建数据库（版本0到版本1）
        const screenshotsStore = db.createObjectStore('screenshots', { keyPath: 'id' });
        screenshotsStore.createIndex('by-url', 'url');
      }
      
      // 从版本1升级到版本2：将URL转换为域名
       if (oldVersion === 1 && newVersion === 2) {
         const store = transaction.objectStore('screenshots');
         // 获取所有现有记录
         store.openCursor().then(function iterateCursor(cursor: IDBPCursorWithValue<ScreenshotDB, "screenshots"[], "screenshots", unknown, "versionchange"> | null): Promise<void> | void {
           if (!cursor) return; // 没有更多记录
           
           const screenshot = cursor.value;
           // 提取域名并更新记录
           const domain = getDomainFromUrl(screenshot.url);
           const updatedScreenshot = {
             ...screenshot,
             originalUrl: screenshot.url, // 保存原始URL
             url: domain // 更新为域名
           };
           
           // 更新记录
           store.put(updatedScreenshot);
           
           // 继续处理下一条记录
           return cursor.continue().then(iterateCursor);
         });
       }
    },
  });
};

// 保存截图
export const saveScreenshot = async (originalUrl: string, imageData: string) => {
  const db = await initDB();
  const domain = getDomainFromUrl(originalUrl);
  const id = `${domain}-${Date.now()}`;
  await db.put('screenshots', {
    id,
    url: domain, // 存储域名
    originalUrl, // 存储完整的原始URL
    imageData,
    timestamp: Date.now(),
  });
  return id;
};

// 获取指定网站的所有截图（按域名查询）
export const getScreenshotsByUrl = async (url: string) => {
  const db = await initDB();
  const domain = getDomainFromUrl(url);
  const screenshots = await db.getAllFromIndex('screenshots', 'by-url', domain);
  return screenshots.sort((a, b) => b.timestamp - a.timestamp); // 按时间倒序排列
};

// 删除截图
export const deleteScreenshot = async (id: string) => {
  const db = await initDB();
  await db.delete('screenshots', id);
};

// 清空指定网站的所有截图（按域名清空）
export const clearScreenshotsByUrl = async (url: string) => {
  const db = await initDB();
  const domain = getDomainFromUrl(url);
  const screenshots = await db.getAllFromIndex('screenshots', 'by-url', domain);
  const tx = db.transaction('screenshots', 'readwrite');
  for (const screenshot of screenshots) {
    tx.store.delete(screenshot.id);
  }
  await tx.done;
};