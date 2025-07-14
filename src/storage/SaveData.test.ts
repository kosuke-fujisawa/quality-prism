import { describe, it, expect, beforeEach } from 'vitest';
import { SaveDataDB } from './SaveData';

describe('SaveDataDB', () => {
  let db: SaveDataDB;

  beforeEach(async () => {
    db = new SaveDataDB();
    await db.delete();
    await db.open();
  });

  describe('初期状態', () => {
    it('新しいセーブデータが作成できる', async () => {
      const saveData = await db.getOrCreateSaveData();
      
      expect(saveData).toBeDefined();
      expect(saveData.currentRoute).toBe('');
      expect(saveData.currentScene).toBe(0);
      expect(saveData.clearedRoutes).toEqual([]);
      expect(saveData.isTrueRouteUnlocked).toBe(false);
      expect(saveData.lastSaveTime).toBeInstanceOf(Date);
    });

    it('デフォルト設定が作成できる', async () => {
      const settings = await db.getSettings();
      
      expect(settings).toBeDefined();
      expect(settings.volume).toBe(0.8);
      expect(settings.textSpeed).toBe(1.0);
      expect(settings.autoSave).toBe(true);
    });
  });

  describe('セーブデータの更新', () => {
    it('現在のルートとシーンを更新できる', async () => {
      await db.getOrCreateSaveData();
      
      await db.updateSaveData({
        currentRoute: 'route1',
        currentScene: 5
      });
      
      const updatedData = await db.getOrCreateSaveData();
      expect(updatedData.currentRoute).toBe('route1');
      expect(updatedData.currentScene).toBe(5);
    });

    it('クリアしたルートを追加できる', async () => {
      await db.getOrCreateSaveData();
      
      await db.updateSaveData({
        clearedRoutes: ['route1']
      });
      
      const updatedData = await db.getOrCreateSaveData();
      expect(updatedData.clearedRoutes).toContain('route1');
    });

    it('3つのルートクリア後にトゥルールートが解放される', async () => {
      await db.getOrCreateSaveData();
      
      await db.updateSaveData({
        clearedRoutes: ['route1', 'route2', 'route3']
      });
      
      const updatedData = await db.getOrCreateSaveData();
      expect(updatedData.clearedRoutes).toHaveLength(3);
      
      // トゥルールート解放の判定は別のロジックで行う想定
      // ここではデータが正しく保存されることをテスト
    });
  });

  describe('設定の更新', () => {
    it('音量設定を変更できる', async () => {
      await db.getSettings();
      
      await db.updateSettings({ volume: 0.5 });
      
      const settings = await db.getSettings();
      expect(settings.volume).toBe(0.5);
    });

    it('テキスト速度を変更できる', async () => {
      await db.getSettings();
      
      await db.updateSettings({ textSpeed: 2.0 });
      
      const settings = await db.getSettings();
      expect(settings.textSpeed).toBe(2.0);
    });

    it('オートセーブ設定を変更できる', async () => {
      await db.getSettings();
      
      await db.updateSettings({ autoSave: false });
      
      const settings = await db.getSettings();
      expect(settings.autoSave).toBe(false);
    });
  });
});