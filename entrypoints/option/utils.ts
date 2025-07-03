// 从URL提取域名
export const getDomainFromUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return 'unknown';
  }
};

// 获取网站图标
export const getWebsiteIcon = (domain: string): string => {
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
export const getWebsiteName = (domain: string): string => {
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