import { test, expect } from '@playwright/test';

test.describe('DDDアーキテクチャ統合テスト', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // IndexedDBをクリア
    await page.evaluate(() => {
      return new Promise((resolve) => {
        const deleteDB = indexedDB.deleteDatabase('QualityPrismGameProgress');
        deleteDB.onsuccess = () => resolve(true);
        deleteDB.onerror = () => resolve(false);
      });
    });
    // アプリケーションの初期化完了を待つ
    await page.waitForFunction(
      () => {
        const gameApp = (window as any).gameApp;
        return (
          gameApp && gameApp.currentOptions && gameApp.currentOptions.length > 0
        );
      },
      { timeout: 5000 }
    );
  });

  test('ゲーム開始時にDDDアーキテクチャが正しく動作する', async ({ page }) => {
    // ゲーム開始
    await page.keyboard.press('1');
    await page.waitForTimeout(1000); // DDDアーキテクチャの処理を待つ

    // ゲーム状態の確認
    const gameState = await page.evaluate(() => {
      return (window as any).gameApp?.getGameState();
    });

    expect(gameState).toBe('game');

    // ゲームロジックの状態確認
    const gameInfo = await page.evaluate(() => {
      const gameLogic = (window as any).gameApp?.gameLogic;
      return {
        currentRoute: gameLogic?.currentRoute,
        currentScene: gameLogic?.currentScene,
      };
    });

    expect(gameInfo.currentRoute).toBe('route1');
    expect(gameInfo.currentScene).toBe(0);
  });

  test('ゲーム状態の永続化とロード', async ({ page }) => {
    // ゲーム開始
    await page.keyboard.press('1');
    await page.waitForTimeout(1000);

    // ページをリロード
    await page.reload();
    await page.waitForTimeout(500);

    // ロード機能をテスト
    await page.keyboard.press('2');
    await page.waitForTimeout(1000);

    const gameState = await page.evaluate(() => {
      return (window as any).gameApp?.getGameState();
    });

    expect(gameState).toBe('game');

    // 保存されたゲーム状態の確認
    const gameInfo = await page.evaluate(() => {
      const gameLogic = (window as any).gameApp?.gameLogic;
      return {
        currentRoute: gameLogic?.currentRoute,
        currentScene: gameLogic?.currentScene,
      };
    });

    expect(gameInfo.currentRoute).toBe('route1');
    expect(gameInfo.currentScene).toBe(0);
  });

  test('DDDアーキテクチャのエラーハンドリング', async ({ page }) => {
    // IndexedDBエラーをシミュレート
    await page.evaluate(() => {
      // IndexedDBを無効化
      (window as any).indexedDB = null;
    });

    // ゲーム開始を試行
    await page.keyboard.press('1');
    await page.waitForTimeout(1000);

    // エラーが発生してもアプリケーションが継続すること
    const gameState = await page.evaluate(() => {
      return (window as any).gameApp?.getGameState();
    });

    // エラーが発生した場合でも、メニューに戻るかゲーム状態になること
    expect(['menu', 'game']).toContain(gameState);
  });

  test('複数のメニュー操作でのDDDアーキテクチャの安定性', async ({ page }) => {
    // 複数のメニュー操作を連続実行
    const operations = [
      () => page.keyboard.press('1'), // START
      () => page.keyboard.press('Escape'), // メニューに戻る
      () => page.keyboard.press('3'), // GALLERY
      () => page.keyboard.press('Escape'), // メニューに戻る
      () => page.keyboard.press('4'), // MINI GAME
      () => page.keyboard.press('Escape'), // メニューに戻る
      () => page.keyboard.press('5'), // CREDIT
      () => page.keyboard.press('Escape'), // メニューに戻る
    ];

    for (const operation of operations) {
      await operation();
      await page.waitForTimeout(100);
    }

    // 最終的にメニュー状態に戻ることを確認
    const finalState = await page.evaluate(() => {
      return (window as any).gameApp?.getGameState();
    });

    expect(finalState).toBe('menu');
  });

  test('DDDアーキテクチャでのルート選択機能', async ({ page }) => {
    // ゲーム開始
    await page.keyboard.press('1');
    await page.waitForTimeout(1000);

    // ルート選択の確認
    const routeInfo = await page.evaluate(async () => {
      const gameLogic = (window as any).gameApp?.gameLogic;

      // 利用可能なルートを確認
      const availableRoutes = gameLogic?.availableRoutes;

      // 現在のルートを確認
      const currentRoute = gameLogic?.currentRoute;

      return {
        availableRoutes,
        currentRoute,
      };
    });

    expect(routeInfo.availableRoutes).toContain('route1');
    expect(routeInfo.availableRoutes).toContain('route2');
    expect(routeInfo.availableRoutes).toContain('route3');
    expect(routeInfo.currentRoute).toBe('route1');
  });

  test('DDDアーキテクチャでのゲーム設定管理', async ({ page }) => {
    // ゲーム開始
    await page.keyboard.press('1');
    await page.waitForTimeout(1000);

    // ゲーム設定の確認
    const settingsInfo = await page.evaluate(async () => {
      const gameLogic = (window as any).gameApp?.gameLogic;

      try {
        // ゲーム設定を取得
        const settings = await gameLogic?.getSettings();

        // 設定を変更
        await gameLogic?.updateSettings(0.5, 1.5, true);

        // 変更後の設定を取得
        const updatedSettings = await gameLogic?.getSettings();

        return {
          originalSettings: settings,
          updatedSettings: updatedSettings,
        };
      } catch (error) {
        return {
          error: error.message,
        };
      }
    });

    // 設定が正しく管理されていることを確認
    expect(settingsInfo.originalSettings).toBeDefined();
    expect(settingsInfo.updatedSettings).toBeDefined();

    if (settingsInfo.updatedSettings) {
      expect(settingsInfo.updatedSettings.volume).toBe(0.5);
      expect(settingsInfo.updatedSettings.textSpeed).toBe(1.5);
      expect(settingsInfo.updatedSettings.autoSave).toBe(true);
    }
  });
});
