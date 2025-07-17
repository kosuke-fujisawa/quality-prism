import { describe, it, expect } from 'vitest';
import { GameSettings } from './GameSettings';

describe('GameSettings', () => {
  describe('constructor', () => {
    it('有効な値でGameSettingsを作成できる', () => {
      const settings = new GameSettings(0.8, 1.0, true);

      expect(settings.getVolume()).toBe(0.8);
      expect(settings.getTextSpeed()).toBe(1.0);
      expect(settings.isAutoSaveEnabled()).toBe(true);
    });

    it('音量が0.0でも作成できる', () => {
      const settings = new GameSettings(0.0, 1.0, true);

      expect(settings.getVolume()).toBe(0.0);
    });

    it('音量が1.0でも作成できる', () => {
      const settings = new GameSettings(1.0, 1.0, true);

      expect(settings.getVolume()).toBe(1.0);
    });

    it('音量が負の値では作成できない', () => {
      expect(() => new GameSettings(-0.1, 1.0, true)).toThrow(
        '音量は0.0から1.0の間でなければなりません'
      );
    });

    it('音量が1.0を超えると作成できない', () => {
      expect(() => new GameSettings(1.1, 1.0, true)).toThrow(
        '音量は0.0から1.0の間でなければなりません'
      );
    });

    it('テキスト速度が0以下では作成できない', () => {
      expect(() => new GameSettings(0.8, 0, true)).toThrow(
        'テキスト速度は0より大きくなければなりません'
      );
    });

    it('テキスト速度が負の値では作成できない', () => {
      expect(() => new GameSettings(0.8, -1.0, true)).toThrow(
        'テキスト速度は0より大きくなければなりません'
      );
    });
  });

  describe('withVolume', () => {
    it('音量を変更した新しいインスタンスを返す', () => {
      const original = new GameSettings(0.8, 1.0, true);
      const updated = original.withVolume(0.5);

      expect(updated.getVolume()).toBe(0.5);
      expect(updated.getTextSpeed()).toBe(1.0);
      expect(updated.isAutoSaveEnabled()).toBe(true);
      expect(original.getVolume()).toBe(0.8); // 元のオブジェクトは変更されない
    });

    it('無効な音量値では例外が発生', () => {
      const settings = new GameSettings(0.8, 1.0, true);

      expect(() => settings.withVolume(-0.1)).toThrow(
        '音量は0.0から1.0の間でなければなりません'
      );
    });
  });

  describe('withTextSpeed', () => {
    it('テキスト速度を変更した新しいインスタンスを返す', () => {
      const original = new GameSettings(0.8, 1.0, true);
      const updated = original.withTextSpeed(2.0);

      expect(updated.getVolume()).toBe(0.8);
      expect(updated.getTextSpeed()).toBe(2.0);
      expect(updated.isAutoSaveEnabled()).toBe(true);
      expect(original.getTextSpeed()).toBe(1.0); // 元のオブジェクトは変更されない
    });

    it('無効なテキスト速度値では例外が発生', () => {
      const settings = new GameSettings(0.8, 1.0, true);

      expect(() => settings.withTextSpeed(0)).toThrow(
        'テキスト速度は0より大きくなければなりません'
      );
    });
  });

  describe('withAutoSave', () => {
    it('オートセーブ設定を変更した新しいインスタンスを返す', () => {
      const original = new GameSettings(0.8, 1.0, true);
      const updated = original.withAutoSave(false);

      expect(updated.getVolume()).toBe(0.8);
      expect(updated.getTextSpeed()).toBe(1.0);
      expect(updated.isAutoSaveEnabled()).toBe(false);
      expect(original.isAutoSaveEnabled()).toBe(true); // 元のオブジェクトは変更されない
    });
  });

  describe('equals', () => {
    it('同じ設定値のGameSettingsは等しい', () => {
      const settings1 = new GameSettings(0.8, 1.0, true);
      const settings2 = new GameSettings(0.8, 1.0, true);

      expect(settings1.equals(settings2)).toBe(true);
    });

    it('音量が異なる場合は等しくない', () => {
      const settings1 = new GameSettings(0.8, 1.0, true);
      const settings2 = new GameSettings(0.7, 1.0, true);

      expect(settings1.equals(settings2)).toBe(false);
    });

    it('テキスト速度が異なる場合は等しくない', () => {
      const settings1 = new GameSettings(0.8, 1.0, true);
      const settings2 = new GameSettings(0.8, 1.5, true);

      expect(settings1.equals(settings2)).toBe(false);
    });

    it('オートセーブ設定が異なる場合は等しくない', () => {
      const settings1 = new GameSettings(0.8, 1.0, true);
      const settings2 = new GameSettings(0.8, 1.0, false);

      expect(settings1.equals(settings2)).toBe(false);
    });
  });

  describe('default', () => {
    it('デフォルト設定を作成できる', () => {
      const defaultSettings = GameSettings.default();

      expect(defaultSettings.getVolume()).toBe(0.8);
      expect(defaultSettings.getTextSpeed()).toBe(1.0);
      expect(defaultSettings.isAutoSaveEnabled()).toBe(true);
    });
  });

  describe('immutability', () => {
    it('連続した変更も正しく動作する', () => {
      const original = GameSettings.default();
      const updated = original
        .withVolume(0.5)
        .withTextSpeed(2.0)
        .withAutoSave(false);

      expect(updated.getVolume()).toBe(0.5);
      expect(updated.getTextSpeed()).toBe(2.0);
      expect(updated.isAutoSaveEnabled()).toBe(false);
      
      // 元のオブジェクトは変更されていない
      expect(original.getVolume()).toBe(0.8);
      expect(original.getTextSpeed()).toBe(1.0);
      expect(original.isAutoSaveEnabled()).toBe(true);
    });
  });
});