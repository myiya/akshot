// 网站分类接口
export interface WebsiteCategory {
  domain: string;
  name: string;
  icon: string;
  count: number;
  screenshots: any[];
}

// 截图接口
export interface Screenshot {
  id: string;
  timestamp: number;
  imageData: string;
  dataUrl?: string;
  originalUrl?: string;
  url?: string;
  title?: string;
}