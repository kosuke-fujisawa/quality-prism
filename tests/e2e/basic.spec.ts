import { test, expect } from '@playwright/test';

test.describe('品質のプリズム - 基本動作', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
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

  test('メインページが正しく表示される', async ({ page }) => {
    // タイトルの確認
    await expect(page).toHaveTitle('品質のプリズム');

    // CanvasがDOM上に存在することを確認
    const canvas = page.locator('#gameCanvas');
    await expect(canvas).toBeVisible();

    // Canvasのサイズが正しいことを確認
    await expect(canvas).toHaveAttribute('width', '800');
    await expect(canvas).toHaveAttribute('height', '600');
  });

  test('メニューが正しく表示される', async ({ page }) => {
    // gameAppがグローバルに利用可能であることを確認
    const gameState = await page.evaluate(() => {
      return (window as any).gameApp?.getGameState();
    });

    expect(gameState).toBe('menu');
  });

  test('キーボードでメニュー選択ができる', async ({ page }) => {
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

    // 1キーでSTARTを選択
    await page.keyboard.press('1');

    // DDDアーキテクチャのAsync処理を待つ
    await page.waitForTimeout(1000);

    const gameState = await page.evaluate(() => {
      return (window as any).gameApp?.getGameState();
    });

    expect(gameState).toBe('game');
  });

  test('Escキーでメニューに戻る', async ({ page }) => {
    // まずゲーム状態に移行
    await page.keyboard.press('1');
    await page.waitForTimeout(1000);

    // Escキーでメニューに戻る
    await page.keyboard.press('Escape');
    await page.waitForTimeout(100);

    const gameState = await page.evaluate(() => {
      return (window as any).gameApp?.getGameState();
    });

    expect(gameState).toBe('menu');
  });

  test('マウスクリックでメニュー選択ができる', async ({ page }) => {
    // START位置をクリック（メニュー項目のY座標: 250）
    await page.locator('#gameCanvas').click({ position: { x: 400, y: 250 } });

    await page.waitForTimeout(1000);

    const gameState = await page.evaluate(() => {
      return (window as any).gameApp?.getGameState();
    });

    expect(gameState).toBe('game');
  });

  test('ギャラリーモードに遷移できる', async ({ page }) => {
    // 3キーでGALLERYを選択
    await page.keyboard.press('3');
    await page.waitForTimeout(500);

    const gameState = await page.evaluate(() => {
      return (window as any).gameApp?.getGameState();
    });

    expect(gameState).toBe('gallery');
  });

  test('ミニゲームモードに遷移できる', async ({ page }) => {
    // 4キーでMINI GAMEを選択
    await page.keyboard.press('4');
    await page.waitForTimeout(500);

    const gameState = await page.evaluate(() => {
      return (window as any).gameApp?.getGameState();
    });

    expect(gameState).toBe('minigame');
  });

  test('クレジットモードに遷移できる', async ({ page }) => {
    // 5キーでCREDITを選択
    await page.keyboard.press('5');
    await page.waitForTimeout(500);

    const gameState = await page.evaluate(() => {
      return (window as any).gameApp?.getGameState();
    });

    expect(gameState).toBe('credits');
  });
});
