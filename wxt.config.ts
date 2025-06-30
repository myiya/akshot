import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: "AkShot",
    description: "网页截图工具，可以截取网页内容并保存历史记录",
    permissions: ["activeTab", "scripting", "downloads", "storage"],
    action: {
      default_title: "AkShot 截图工具"
    },
  },
  webExt: {
    startUrls: ["https://www.baidu.com"],
  },
  debug: true,
});
