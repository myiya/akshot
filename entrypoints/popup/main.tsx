import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import "~/assets/tailwind.css";
import './style.css';

// 添加详细的调试日志
console.log('Popup main script loaded', { id: browser.runtime.id });

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
