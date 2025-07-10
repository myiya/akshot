import { ContentScriptContext } from "wxt/utils/content-script-context";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "~/assets/tailwind.css";
import "~/assets/iconfont.css";
import "./style.css";

// 添加详细的调试日志
console.log('Content script loaded', { id: browser.runtime.id });

async function initShadowUI(ctx: ContentScriptContext) {
  const ui = await createShadowRootUi(ctx, {
      name: "ak-shot",
      position: "inline",
      anchor: "body",
      append: "last",
      onMount: (container) => {
        // Don't mount react app directly on <body>
        const wrapper = document.createElement("div");
        container.append(wrapper);

        const root = ReactDOM.createRoot(wrapper);
        root.render(<App />);
        return { root, wrapper };
      },
      onRemove: (elements) => {
        elements?.root.unmount();
        elements?.wrapper.remove();
      },
    });

    ui.mount();
}

async function initIframeUI(ctx: ContentScriptContext) {
  const ui = createIframeUi(ctx, {
      page: 'cvs-iframe.html' as any,
      position: 'inline',
      anchor: 'body',
      onMount: (wrapper, iframe) => {
        // Add styles to the iframe like width
        console.log('iframe width', document.body.clientWidth);
        console.log('iframe height', document.body.clientHeight);
        
        iframe.style.top = '0px';
        iframe.style.left = '0px';
        iframe.style.border = 'none';
        iframe.style.position = 'fixed';
        iframe.style.zIndex = '2147483647';
        iframe.style.colorScheme = 'auto';
        iframe.style.margin = '0px';
        iframe.style.width = document.body.clientWidth+'px';
        iframe.style.height = document.body.clientHeight+'px';
        iframe.style.backgroundColor = 'transparent';
        iframe.style.display = 'none';
      },
    });

    ui.mount();
}

export default defineContentScript({
  matches: ["*://*/*"],
  cssInjectionMode: "ui",

  async main(ctx) {
    // 挂载 Shadow DOM
    await initShadowUI(ctx);

    // 挂载 Iframe DOM
    await initIframeUI(ctx);
  },
});
