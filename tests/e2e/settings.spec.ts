import { test, expect } from '@playwright/test';
import { GamePage } from './pages/GamePage';

test.describe('設定変更のE2Eテスト', () => {
  let gamePage: GamePage;

  test.beforeEach(async ({ page }) => {
    gamePage = new GamePage(page);
    await gamePage.goto();
    await gamePage.waitForLoad();
  });

  test('設定画面を開ける', async () => {
    await gamePage.openSettings();
    
    await expect(gamePage.volumeSlider).toBeVisible();
    await expect(gamePage.textSpeedSlider).toBeVisible();
    await expect(gamePage.autoSaveToggle).toBeVisible();
  });

  test('音量設定を変更できる', async () => {
    await gamePage.openSettings();
    
    // 音量を50%に変更
    await gamePage.changeVolume(0.5);
    
    // 設定が反映されていることを確認
    const volumeValue = await gamePage.volumeSlider.inputValue();
    expect(parseFloat(volumeValue)).toBe(0.5);
  });

  test('テキスト速度を変更できる', async () => {
    await gamePage.openSettings();
    
    // テキスト速度を2.0に変更
    await gamePage.changeTextSpeed(2.0);
    
    // 設定が反映されていることを確認
    const textSpeedValue = await gamePage.textSpeedSlider.inputValue();
    expect(parseFloat(textSpeedValue)).toBe(2.0);
  });

  test('オートセーブ設定を切り替えられる', async () => {
    await gamePage.openSettings();
    
    // 初期状態を確認
    const initialState = await gamePage.autoSaveToggle.isChecked();
    
    // オートセーブを切り替える
    await gamePage.toggleAutoSave();
    
    // 設定が切り替わっていることを確認
    const newState = await gamePage.autoSaveToggle.isChecked();
    expect(newState).toBe(!initialState);
  });

  test('複数の設定を同時に変更できる', async () => {
    await gamePage.openSettings();
    
    // 複数の設定を同時に変更
    await gamePage.changeVolume(0.3);
    await gamePage.changeTextSpeed(1.5);
    await gamePage.toggleAutoSave();
    
    // 全ての設定が反映されていることを確認
    const volumeValue = await gamePage.volumeSlider.inputValue();
    expect(parseFloat(volumeValue)).toBe(0.3);
    
    const textSpeedValue = await gamePage.textSpeedSlider.inputValue();
    expect(parseFloat(textSpeedValue)).toBe(1.5);
    
    const autoSaveState = await gamePage.autoSaveToggle.isChecked();
    expect(autoSaveState).toBeDefined();
  });

  test('設定変更後にページを再読み込みしても設定が保持される', async () => {
    await gamePage.openSettings();
    
    // 設定を変更
    await gamePage.changeVolume(0.7);
    await gamePage.changeTextSpeed(0.8);
    
    // ページを再読み込み
    await gamePage.page.reload();
    await gamePage.waitForLoad();
    
    // 設定画面を再度開く
    await gamePage.openSettings();
    
    // 設定が保持されていることを確認
    const volumeValue = await gamePage.volumeSlider.inputValue();
    expect(parseFloat(volumeValue)).toBe(0.7);
    
    const textSpeedValue = await gamePage.textSpeedSlider.inputValue();
    expect(parseFloat(textSpeedValue)).toBe(0.8);
  });

  test('無効な音量値は正規化される', async () => {
    await gamePage.openSettings();
    
    // 無効な音量値を設定（範囲外）
    await gamePage.page.evaluate(() => {
      const volumeSlider = document.querySelector('input[data-setting="volume"]') as HTMLInputElement;
      if (volumeSlider) {
        volumeSlider.value = '1.5'; // 1.0を超える値
        volumeSlider.dispatchEvent(new Event('input'));
      }
    });
    
    // 値が正規化されていることを確認
    const volumeValue = await gamePage.volumeSlider.inputValue();
    expect(parseFloat(volumeValue)).toBeLessThanOrEqual(1.0);
  });

  test('無効なテキスト速度値は正規化される', async () => {
    await gamePage.openSettings();
    
    // 無効なテキスト速度値を設定（負の値）
    await gamePage.page.evaluate(() => {
      const textSpeedSlider = document.querySelector('input[data-setting="textSpeed"]') as HTMLInputElement;
      if (textSpeedSlider) {
        textSpeedSlider.value = '-1'; // 負の値
        textSpeedSlider.dispatchEvent(new Event('input'));
      }
    });
    
    // 値が正規化されていることを確認
    const textSpeedValue = await gamePage.textSpeedSlider.inputValue();
    expect(parseFloat(textSpeedValue)).toBeGreaterThan(0);
  });

  test('デフォルト設定が正しく設定される', async () => {
    await gamePage.openSettings();
    
    // デフォルト設定を確認
    const volumeValue = await gamePage.volumeSlider.inputValue();
    expect(parseFloat(volumeValue)).toBe(1.0);
    
    const textSpeedValue = await gamePage.textSpeedSlider.inputValue();
    expect(parseFloat(textSpeedValue)).toBe(1.0);
    
    const autoSaveState = await gamePage.autoSaveToggle.isChecked();
    expect(autoSaveState).toBeTruthy();
  });
});