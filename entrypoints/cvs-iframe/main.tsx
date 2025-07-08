import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import "~/assets/tailwind.css";
import './style.css';

// 添加详细的调试日志
console.log('cvs iframe page');

ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
