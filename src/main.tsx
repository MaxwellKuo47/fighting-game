// React 進入點：掛載 <App/> 到 #root，並引入全域樣式（Vite 會處理 CSS）。
//
// 註：刻意不使用 <StrictMode>。本專案的遊戲畫面是命令式的 WebGL + 30Hz 迴圈，
// StrictMode 會在開發期重複掛載/卸載元件，導致 WebGL context 與遊戲迴圈被建立兩次，
// 對這類重度命令式整合反而有害，故略過。

import { createRoot } from 'react-dom/client';
import { App } from './App';
import './style.css';

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('找不到 #root 容器');

createRoot(rootEl).render(<App />);
