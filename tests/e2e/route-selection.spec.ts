import { test, expect } from '@playwright/test';
import { GamePage } from './pages/GamePage';

test.describe('ルート選択のE2Eテスト', () => {
  let gamePage: GamePage;

  test.beforeEach(async ({ page }) => {
    gamePage = new GamePage(page);
    await gamePage.goto();
    await gamePage.waitForLoad();
  });

  test('route1を選択できる', async () => {
    await gamePage.clickRouteButton('route1');
    
    const currentRoute = await gamePage.getCurrentRoute();
    expect(currentRoute).toBe('route1');
    
    const currentScene = await gamePage.getCurrentScene();
    expect(currentScene).toBe(0);
  });

  test('route2を選択できる', async () => {
    await gamePage.clickRouteButton('route2');
    
    const currentRoute = await gamePage.getCurrentRoute();
    expect(currentRoute).toBe('route2');
    
    const currentScene = await gamePage.getCurrentScene();
    expect(currentScene).toBe(0);
  });

  test('route3を選択できる', async () => {
    await gamePage.clickRouteButton('route3');
    
    const currentRoute = await gamePage.getCurrentRoute();
    expect(currentRoute).toBe('route3');
    
    const currentScene = await gamePage.getCurrentScene();
    expect(currentScene).toBe(0);
  });

  test('ルート選択後にシーンを進められる', async () => {
    await gamePage.clickRouteButton('route1');
    
    // 5シーン進める
    await gamePage.advanceScenes(5);
    
    const currentScene = await gamePage.getCurrentScene();
    expect(currentScene).toBe(5);
    
    const currentRoute = await gamePage.getCurrentRoute();
    expect(currentRoute).toBe('route1');
  });

  test('異なるルートに切り替えるとシーンがリセットされる', async () => {
    // route1を選択して5シーン進める
    await gamePage.clickRouteButton('route1');
    await gamePage.advanceScenes(5);
    
    let currentScene = await gamePage.getCurrentScene();
    expect(currentScene).toBe(5);
    
    // route2に切り替える
    await gamePage.clickRouteButton('route2');
    
    currentScene = await gamePage.getCurrentScene();
    expect(currentScene).toBe(0);
    
    const currentRoute = await gamePage.getCurrentRoute();
    expect(currentRoute).toBe('route2');
  });

  test('ルートを最後まで進めるとクリアされる', async () => {
    await gamePage.clickRouteButton('route1');
    
    // 100シーン進める（最後まで）
    await gamePage.advanceScenes(100);
    
    const currentScene = await gamePage.getCurrentScene();
    expect(currentScene).toBe(100);
    
    const clearedRoutes = await gamePage.getClearedRoutes();
    expect(clearedRoutes).toContain('route1');
  });

  test('トゥルールートが初期状態で選択不可', async () => {
    const isEnabled = await gamePage.isRouteButtonEnabled('trueRoute');
    expect(isEnabled).toBeFalsy();
  });

  test('トゥルールートを選択しようとするとエラーメッセージが表示される', async () => {
    await gamePage.clickRouteButton('trueRoute');
    
    const errorMessage = await gamePage.getErrorMessage();
    expect(errorMessage).toContain('トゥルールートを解放するには、すべてのベースルート（route1, route2, route3）をクリアしてください');
  });

  test('無効なルートを選択しようとするとエラーメッセージが表示される', async () => {
    // 存在しないルートボタンをクリック（JavaScriptで直接実行）
    await gamePage.page.evaluate(() => {
      const gameApp = (window as any).gameApp;
      if (gameApp && gameApp.gameService) {
        gameApp.gameService.selectRoute('invalid-route');
      }
    });
    
    const errorMessage = await gamePage.getErrorMessage();
    expect(errorMessage).toContain('無効なルートです');
  });
});