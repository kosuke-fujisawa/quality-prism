import { test, expect } from '@playwright/test';
import { GamePage } from './pages/GamePage';

test.describe('トゥルールート解放のE2Eテスト', () => {
  let gamePage: GamePage;

  test.beforeEach(async ({ page }) => {
    gamePage = new GamePage(page);
    await gamePage.goto();
    await gamePage.waitForLoad();
  });

  test('3つのルートをクリアするとトゥルールートが解放される', async () => {
    // route1をクリア
    await gamePage.clickRouteButton('route1');
    await gamePage.advanceScenes(100);
    
    let clearedRoutes = await gamePage.getClearedRoutes();
    expect(clearedRoutes).toContain('route1');
    
    let isTrueRouteUnlocked = await gamePage.isTrueRouteUnlocked();
    expect(isTrueRouteUnlocked).toBeFalsy();
    
    // route2をクリア
    await gamePage.clickRouteButton('route2');
    await gamePage.advanceScenes(100);
    
    clearedRoutes = await gamePage.getClearedRoutes();
    expect(clearedRoutes).toContain('route1');
    expect(clearedRoutes).toContain('route2');
    
    isTrueRouteUnlocked = await gamePage.isTrueRouteUnlocked();
    expect(isTrueRouteUnlocked).toBeFalsy();
    
    // route3をクリア
    await gamePage.clickRouteButton('route3');
    await gamePage.advanceScenes(100);
    
    clearedRoutes = await gamePage.getClearedRoutes();
    expect(clearedRoutes).toContain('route1');
    expect(clearedRoutes).toContain('route2');
    expect(clearedRoutes).toContain('route3');
    
    // トゥルールートが解放される
    isTrueRouteUnlocked = await gamePage.isTrueRouteUnlocked();
    expect(isTrueRouteUnlocked).toBeTruthy();
    
    // トゥルールートボタンが有効になる
    const isEnabled = await gamePage.isRouteButtonEnabled('trueRoute');
    expect(isEnabled).toBeTruthy();
  });

  test('トゥルールート解放後に選択できる', async () => {
    // 3つのルートをクリア
    const routes = ['route1', 'route2', 'route3'];
    for (const route of routes) {
      await gamePage.clickRouteButton(route);
      await gamePage.advanceScenes(100);
    }
    
    // トゥルールートが解放されていることを確認
    const isTrueRouteUnlocked = await gamePage.isTrueRouteUnlocked();
    expect(isTrueRouteUnlocked).toBeTruthy();
    
    // トゥルールートを選択
    await gamePage.clickRouteButton('trueRoute');
    
    const currentRoute = await gamePage.getCurrentRoute();
    expect(currentRoute).toBe('trueRoute');
    
    const currentScene = await gamePage.getCurrentScene();
    expect(currentScene).toBe(0);
  });

  test('トゥルールートでもシーンを進められる', async () => {
    // 3つのルートをクリア
    const routes = ['route1', 'route2', 'route3'];
    for (const route of routes) {
      await gamePage.clickRouteButton(route);
      await gamePage.advanceScenes(100);
    }
    
    // トゥルールートを選択
    await gamePage.clickRouteButton('trueRoute');
    
    // 10シーン進める
    await gamePage.advanceScenes(10);
    
    const currentScene = await gamePage.getCurrentScene();
    expect(currentScene).toBe(10);
    
    const currentRoute = await gamePage.getCurrentRoute();
    expect(currentRoute).toBe('trueRoute');
  });

  test('トゥルールートを最後まで進められる', async () => {
    // 3つのルートをクリア
    const routes = ['route1', 'route2', 'route3'];
    for (const route of routes) {
      await gamePage.clickRouteButton(route);
      await gamePage.advanceScenes(100);
    }
    
    // トゥルールートを選択
    await gamePage.clickRouteButton('trueRoute');
    
    // 100シーン進める
    await gamePage.advanceScenes(100);
    
    const currentScene = await gamePage.getCurrentScene();
    expect(currentScene).toBe(100);
    
    const clearedRoutes = await gamePage.getClearedRoutes();
    expect(clearedRoutes).toContain('trueRoute');
  });

  test('部分的なクリアではトゥルールートが解放されない', async () => {
    // route1とroute2のみクリア
    await gamePage.clickRouteButton('route1');
    await gamePage.advanceScenes(100);
    
    await gamePage.clickRouteButton('route2');
    await gamePage.advanceScenes(100);
    
    const clearedRoutes = await gamePage.getClearedRoutes();
    expect(clearedRoutes).toContain('route1');
    expect(clearedRoutes).toContain('route2');
    expect(clearedRoutes).not.toContain('route3');
    
    // トゥルールートは解放されない
    const isTrueRouteUnlocked = await gamePage.isTrueRouteUnlocked();
    expect(isTrueRouteUnlocked).toBeFalsy();
    
    // トゥルールートボタンは無効のまま
    const isEnabled = await gamePage.isRouteButtonEnabled('trueRoute');
    expect(isEnabled).toBeFalsy();
  });

  test('同じルートを複数回クリアしても重複しない', async () => {
    // route1を2回クリア
    await gamePage.clickRouteButton('route1');
    await gamePage.advanceScenes(100);
    
    await gamePage.clickRouteButton('route1');
    await gamePage.advanceScenes(100);
    
    const clearedRoutes = await gamePage.getClearedRoutes();
    const route1Count = clearedRoutes.filter(route => route === 'route1').length;
    expect(route1Count).toBe(1);
  });
});