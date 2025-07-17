import { test, expect } from '@playwright/test';
import { GamePage } from './pages/GamePage';

test.describe('基本的なE2Eテスト', () => {
  let gamePage: GamePage;

  test.beforeEach(async ({ page }) => {
    gamePage = new GamePage(page);
    await gamePage.goto();
    await gamePage.waitForLoad();
  });

  test('ページが正しく読み込まれる', async () => {
    await expect(gamePage.canvas).toBeVisible();
    const title = await gamePage.page.title();
    expect(title).toBe('品質のプリズム');
  });

  test('キャンバスが表示される', async () => {
    await expect(gamePage.canvas).toBeVisible();
  });

  test('メニューが表示される', async () => {
    const isMenuVisible = await gamePage.isMenuVisible();
    expect(isMenuVisible).toBeTruthy();
  });

  test('ゲームの初期状態がメニューである', async () => {
    const gameState = await gamePage.getGameState();
    expect(gameState).toBe('menu');
  });

  test('スタートメニューをクリックできる', async () => {
    await gamePage.clickMenuOption('start');
    
    // ゲーム状態が変わるまで少し待機
    await gamePage.page.waitForTimeout(100);
    
    const gameState = await gamePage.getGameState();
    expect(gameState).toBe('game');
  });

  test('ロードメニューをクリックできる', async () => {
    await gamePage.clickMenuOption('load');
    
    // ゲーム状態が変わるまで少し待機
    await gamePage.page.waitForTimeout(100);
    
    const gameState = await gamePage.getGameState();
    expect(gameState).toBe('game');
  });

  test('ギャラリーメニューをクリックできる', async () => {
    await gamePage.clickMenuOption('gallery');
    
    // ゲーム状態が変わるまで少し待機
    await gamePage.page.waitForTimeout(100);
    
    const gameState = await gamePage.getGameState();
    expect(gameState).toBe('gallery');
  });

  test('ミニゲームメニューをクリックできる', async () => {
    await gamePage.clickMenuOption('mini game');
    
    // ゲーム状態が変わるまで少し待機
    await gamePage.page.waitForTimeout(100);
    
    const gameState = await gamePage.getGameState();
    expect(gameState).toBe('minigame');
  });

  test('クレジットメニューをクリックできる', async () => {
    await gamePage.clickMenuOption('credit');
    
    // ゲーム状態が変わるまで少し待機
    await gamePage.page.waitForTimeout(100);
    
    const gameState = await gamePage.getGameState();
    expect(gameState).toBe('credits');
  });

  test('Escキーでメニューに戻れる', async () => {
    // ギャラリーに移動
    await gamePage.clickMenuOption('gallery');
    await gamePage.page.waitForTimeout(100);
    
    let gameState = await gamePage.getGameState();
    expect(gameState).toBe('gallery');
    
    // Escキーでメニューに戻る
    await gamePage.page.keyboard.press('Escape');
    await gamePage.page.waitForTimeout(100);
    
    gameState = await gamePage.getGameState();
    expect(gameState).toBe('menu');
  });
});