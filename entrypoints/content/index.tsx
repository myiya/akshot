import "./style.css";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import type { Message } from "@/messaging/types";

// 声明全局window对象上的方法类型
declare global {
  interface Window {
    akshotSendMessageToReact: (message: Message) => void;
  }
}

// 添加详细的调试日志
console.log('Content script loaded', { id: browser.runtime.id });

// 确保window.akshotSendMessageToReact在content script中可用
if (typeof window.akshotSendMessageToReact !== 'function') {
  console.log('Defining akshotSendMessageToReact in content script');
  // 临时定义，将在App组件中被正确定义
  window.akshotSendMessageToReact = (message) => {
    console.log('Temporary akshotSendMessageToReact called with:', message);
  };
}

// 确保消息监听器在content script加载时就注册
// 使用原生的browser.runtime.onMessage监听器
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Content script received message via runtime.onMessage:', message, 'from:', sender);
  
  // 检查消息类型是否为popup-to-content
  if (message && message.type === 'popup-to-content' && message.data) {
    console.log('Processing popup-to-content message:', message.data);
    
    // 将消息转发给React组件
    if (window.akshotSendMessageToReact) {
      window.akshotSendMessageToReact(message.data);
      console.log('Message forwarded to React component');
      // 发送响应回popup
      sendResponse({ success: true, message: 'Message received and forwarded to React component' });
    } else {
      console.error('akshotSendMessageToReact is not defined');
      sendResponse({ success: false, message: 'akshotSendMessageToReact is not defined' });
    }
    
    // 返回true表示将异步发送响应
    return true;
  }
});

export default defineContentScript({
  matches: ["*://*/*"],
  cssInjectionMode: "ui",

  async main(ctx) {
    const ui = await createShadowRootUi(ctx, {
      name: "ak-shot",
      position: "inline",
      anchor: "body",
      append: "first",
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
  },
});
