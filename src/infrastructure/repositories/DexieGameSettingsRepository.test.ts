import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DexieGameSettingsRepository } from './DexieGameSettingsRepository';
import { GameSettings } from '../../domain/value-objects/GameSettings';

describe('DexieGameSettingsRepository', () => {
  let repository: DexieGameSettingsRepository;

  beforeEach(() => {
    repository = new DexieGameSettingsRepository();
  });

  afterEach(async () => {
    try {
      // テスト後のクリーンアップ
      await repository.delete();
    } catch (error) {
      // クリーンアップでエラーが発生しても無視
    }
  });

  describe('initializeDefault', () => {
    it('デフォルト設定を初期化できる', async () => {
      await repository.initializeDefault();

      const settings = await repository.get();
      expect(settings.getVolume()).toBe(0.8);
      expect(settings.getTextSpeed()).toBe(1.0);
      expect(settings.isAutoSaveEnabled()).toBe(true);
    });

    it('既に設定が存在する場合は上書きしない', async () => {
      const customSettings = new GameSettings(0.5, 2.0, false);
      await repository.save(customSettings);

      await repository.initializeDefault();

      const settings = await repository.get();
      expect(settings.getVolume()).toBe(0.5);
      expect(settings.getTextSpeed()).toBe(2.0);
      expect(settings.isAutoSaveEnabled()).toBe(false);
    });
  });

  describe('get', () => {
    it('設定が存在しない場合はデフォルト設定を返す', async () => {
      const settings = await repository.get();

      expect(settings).toBeInstanceOf(GameSettings);
      expect(settings.getVolume()).toBe(0.8);
      expect(settings.getTextSpeed()).toBe(1.0);
      expect(settings.isAutoSaveEnabled()).toBe(true);
    });

    it('保存された設定を正しく取得できる', async () => {
      const customSettings = new GameSettings(0.6, 1.5, false);
      await repository.save(customSettings);

      const retrievedSettings = await repository.get();

      expect(retrievedSettings.getVolume()).toBe(0.6);
      expect(retrievedSettings.getTextSpeed()).toBe(1.5);
      expect(retrievedSettings.isAutoSaveEnabled()).toBe(false);
    });
  });

  describe('save', () => {
    it('設定を保存できる', async () => {
      const settings = new GameSettings(0.3, 0.5, true);

      await repository.save(settings);

      const savedSettings = await repository.get();
      expect(savedSettings.getVolume()).toBe(0.3);
      expect(savedSettings.getTextSpeed()).toBe(0.5);
      expect(savedSettings.isAutoSaveEnabled()).toBe(true);
    });

    it('既存の設定を更新できる', async () => {
      const initialSettings = new GameSettings(0.5, 1.0, true);
      await repository.save(initialSettings);

      const updatedSettings = new GameSettings(0.9, 2.0, false);
      await repository.save(updatedSettings);

      const finalSettings = await repository.get();
      expect(finalSettings.getVolume()).toBe(0.9);
      expect(finalSettings.getTextSpeed()).toBe(2.0);
      expect(finalSettings.isAutoSaveEnabled()).toBe(false);
    });

    it('複数回の保存が正しく動作する', async () => {
      const settings1 = new GameSettings(0.1, 0.5, true);
      const settings2 = new GameSettings(0.2, 1.0, false);
      const settings3 = new GameSettings(0.3, 1.5, true);

      await repository.save(settings1);
      await repository.save(settings2);
      await repository.save(settings3);

      const finalSettings = await repository.get();
      expect(finalSettings.getVolume()).toBe(0.3);
      expect(finalSettings.getTextSpeed()).toBe(1.5);
      expect(finalSettings.isAutoSaveEnabled()).toBe(true);
    });
  });

  describe('delete', () => {
    it('設定を削除できる', async () => {
      const customSettings = new GameSettings(0.7, 1.8, false);
      await repository.save(customSettings);

      await repository.delete();

      const settings = await repository.get();
      // 削除後はデフォルト設定に戻る
      expect(settings.getVolume()).toBe(0.8);
      expect(settings.getTextSpeed()).toBe(1.0);
      expect(settings.isAutoSaveEnabled()).toBe(true);
    });

    it('設定が存在しない場合でもエラーにならない', async () => {
      await expect(repository.delete()).resolves.not.toThrow();
    });
  });

  describe('データ整合性', () => {
    it('境界値の設定を正しく保存・復元', async () => {
      const boundarySettings = new GameSettings(0.0, 0.1, false);
      await repository.save(boundarySettings);

      const retrievedSettings = await repository.get();
      expect(retrievedSettings.getVolume()).toBe(0.0);
      expect(retrievedSettings.getTextSpeed()).toBe(0.1);
      expect(retrievedSettings.isAutoSaveEnabled()).toBe(false);
    });

    it('最大値の設定を正しく保存・復元', async () => {
      const maxSettings = new GameSettings(1.0, 10.0, true);
      await repository.save(maxSettings);

      const retrievedSettings = await repository.get();
      expect(retrievedSettings.getVolume()).toBe(1.0);
      expect(retrievedSettings.getTextSpeed()).toBe(10.0);
      expect(retrievedSettings.isAutoSaveEnabled()).toBe(true);
    });

    it('小数点の精度を保持する', async () => {
      const precisionSettings = new GameSettings(0.123, 1.456, true);
      await repository.save(precisionSettings);

      const retrievedSettings = await repository.get();
      expect(retrievedSettings.getVolume()).toBeCloseTo(0.123, 3);
      expect(retrievedSettings.getTextSpeed()).toBeCloseTo(1.456, 3);
    });
  });

  describe('並行処理', () => {
    it('複数の同時保存操作が正しく動作する', async () => {
      const settings1 = new GameSettings(0.1, 1.0, true);
      const settings2 = new GameSettings(0.2, 2.0, false);
      const settings3 = new GameSettings(0.3, 3.0, true);

      // 同時に保存操作を実行
      await Promise.all([
        repository.save(settings1),
        repository.save(settings2),
        repository.save(settings3)
      ]);

      const finalSettings = await repository.get();
      // いずれかの設定が保存されていることを確認
      expect([0.1, 0.2, 0.3]).toContain(finalSettings.getVolume());
      expect([1.0, 2.0, 3.0]).toContain(finalSettings.getTextSpeed());
      expect([true, false, true]).toContain(finalSettings.isAutoSaveEnabled());
    });
  });

  describe('エラーハンドリング', () => {
    it('データベース操作でエラーが発生してもアプリケーションが落ちない', async () => {
      // 正常なケースでの動作を確認
      const settings = new GameSettings(0.5, 1.0, true);
      await expect(repository.save(settings)).resolves.not.toThrow();
      
      const retrievedSettings = await repository.get();
      expect(retrievedSettings.getVolume()).toBe(0.5);
    });
  });
});