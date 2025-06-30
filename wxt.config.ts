import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    permissions: ["activeTab", "scripting", "downloads"],
    action: {},
  },
  webExt: {
    startUrls: ["https://www.baidu.com"],
  },
  debug: true,
});
