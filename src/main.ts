import './style.css';
import { NovelGameApp } from './NovelGameApp';

// アプリケーション開始
document.addEventListener('DOMContentLoaded', () => {
  console.log('Starting app with TDD approach');
  const gameApp = new NovelGameApp();

  // E2Eテスト用にgameAppをwindowオブジェクトに公開
  (window as any).gameApp = gameApp;
});
