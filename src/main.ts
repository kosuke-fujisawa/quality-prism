import './style.css';
import { NovelGameApp } from './NovelGameApp';

// アプリケーション開始
document.addEventListener('DOMContentLoaded', () => {
  console.log('Starting app with TDD approach');
  new NovelGameApp();
});
