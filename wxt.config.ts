import { defineConfig } from 'wxt';
import tailwindcss from "@tailwindcss/vite";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  // @ts-ignore
  vite: () => ({
    plugins: [tailwindcss()],
  }),
  manifest: {
    name: "AkShot",
    description: "网页截图工具，可以截取网页内容并保存历史记录",
    permissions: ["activeTab", "scripting", "downloads", "storage"],
    action: {
      default_title: "AkShot 截图工具"
    },
    options_ui: {
      page: "option.html",
      open_in_tab: true
    },
    web_accessible_resources: [
      {
        resources: ['cvs-iframe.html'],
        matches: ['*://*/*'],
      },
    ],
  },
  zip: {
    // 禁用源码包生成，只生成扩展安装包
    excludeSources: ['**/*'],
  },
  webExt: {
    startUrls: ["https://www.baidu.com"],
  },
  debug: true,
});
