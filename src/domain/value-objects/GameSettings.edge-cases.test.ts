import { describe, it, expect } from 'vitest';
import { GameSettings } from './GameSettings';
import { enhancedAssertions } from '../../test/utils/testHelpers';

describe('GameSettings エッジケース', () => {
  describe('浮動小数点精度テスト', () => {
    it('極小値での音量設定', () => {
      const settings = new GameSettings(0.00001, 1.0, true);
      expect(settings.getVolume()).toBe(0.00001);
    });

    it('高精度な音量値での設定', () => {
      const preciseVolume = 0.123456789;
      const settings = new GameSettings(preciseVolume, 1.0, true);

      // JavaScriptの浮動小数点精度の限界内で等価性をチェック
      expect(settings.getVolume()).toBeCloseTo(preciseVolume, 9);
    });

    it('テキスト速度の極大値', () => {
      const highSpeed = 100.0;
      const settings = new GameSettings(0.5, highSpeed, true);
      expect(settings.getTextSpeed()).toBe(highSpeed);
    });

    it('テキスト速度の極小値', () => {
      const lowSpeed = 0.00001;
      const settings = new GameSettings(0.5, lowSpeed, true);
      expect(settings.getTextSpeed()).toBe(lowSpeed);
    });

    it('浮動小数点演算の精度誤差に対する堅牢性', () => {
      // 0.1 + 0.2 = 0.30000000000000004 のような精度誤差
      const volume = 0.1 + 0.2;
      const settings = new GameSettings(volume, 1.0, true);

      // 精度誤差があっても正しく動作する
      expect(settings.getVolume()).toBeCloseTo(0.3, 10);
    });
  });

  describe('不変性の詳細テスト', () => {
    it('複数の設定変更チェーンが正しく動作する', () => {
      const originalSettings = GameSettings.default();

      const modified = originalSettings
        .withVolume(0.7)
        .withTextSpeed(1.5)
        .withAutoSave(false)
        .withVolume(0.8)
        .withTextSpeed(2.0);

      // 元のオブジェクトは変更されない
      expect(originalSettings.getVolume()).toBe(0.8);
      expect(originalSettings.getTextSpeed()).toBe(1.0);
      expect(originalSettings.isAutoSaveEnabled()).toBe(true);

      // 最終的な設定が正しい
      expect(modified.getVolume()).toBe(0.8);
      expect(modified.getTextSpeed()).toBe(2.0);
      expect(modified.isAutoSaveEnabled()).toBe(false);
    });

    it('分岐する設定変更が独立して動作する', () => {
      const baseSettings = GameSettings.default();

      const branch1 = baseSettings.withVolume(0.3);
      const branch2 = baseSettings.withVolume(0.7);

      // 両方の分岐が独立している
      expect(branch1.getVolume()).toBe(0.3);
      expect(branch2.getVolume()).toBe(0.7);
      expect(baseSettings.getVolume()).toBe(0.8);
    });

    it('同じ設定値でのwithメソッドが新しいオブジェクトを作成する', () => {
      const settings = GameSettings.default();
      const sameSetting = settings.withVolume(0.8); // 同じ値

      // 値は同じだが別のオブジェクト
      expect(sameSetting.getVolume()).toBe(settings.getVolume());
      expect(sameSetting).not.toBe(settings);
    });
  });

  describe('境界値エラーハンドリング', () => {
    it('音量の境界値エラー', () => {
      const settings = GameSettings.default();

      enhancedAssertions.expectThrowsError(
        () => settings.withVolume(-0.00001),
        '音量は0.0から1.0の間でなければなりません'
      );

      enhancedAssertions.expectThrowsError(
        () => settings.withVolume(1.00001),
        '音量は0.0から1.0の間でなければなりません'
      );
    });

    it('テキスト速度の境界値エラー', () => {
      const settings = GameSettings.default();

      enhancedAssertions.expectThrowsError(
        () => settings.withTextSpeed(0),
        'テキスト速度は0より大きくなければなりません'
      );

      enhancedAssertions.expectThrowsError(
        () => settings.withTextSpeed(-0.00001),
        'テキスト速度は0より大きくなければなりません'
      );
    });

    it('NaN値での設定エラー', () => {
      const settings = GameSettings.default();

      enhancedAssertions.expectThrowsError(
        () => settings.withVolume(NaN),
        '音量は有効な数値でなければなりません'
      );

      enhancedAssertions.expectThrowsError(
        () => settings.withTextSpeed(NaN),
        'テキスト速度は有効な数値でなければなりません'
      );
    });

    it('Infinity値での設定エラー', () => {
      const settings = GameSettings.default();

      enhancedAssertions.expectThrowsError(
        () => settings.withVolume(Infinity),
        '音量は有限の数値でなければなりません'
      );

      enhancedAssertions.expectThrowsError(
        () => settings.withTextSpeed(Infinity),
        'テキスト速度は有限の数値でなければなりません'
      );
    });
  });

  describe('等価性の詳細テスト', () => {
    it('同じ設定値での等価性', () => {
      const settings1 = new GameSettings(0.8, 1.5, true);
      const settings2 = new GameSettings(0.8, 1.5, true);

      expect(settings1.equals(settings2)).toBe(true);
    });

    it('微小な差での等価性', () => {
      const settings1 = new GameSettings(0.123456789, 1.0, true);
      const settings2 = new GameSettings(0.123456788, 1.0, true);

      // 浮動小数点の精度内での微小な差は等価でない
      expect(settings1.equals(settings2)).toBe(false);
    });

    it('デフォルト設定との等価性', () => {
      const defaultSettings = GameSettings.default();
      const manualSettings = new GameSettings(0.8, 1.0, true);

      expect(defaultSettings.equals(manualSettings)).toBe(true);
    });

    it('自己との等価性', () => {
      const settings = GameSettings.default();
      expect(settings.equals(settings)).toBe(true);
    });
  });

  describe('設定値検証の詳細', () => {
    it('音量の正確な境界値', () => {
      // 境界値での成功
      const settings1 = new GameSettings(0.0, 1.0, true);
      const settings2 = new GameSettings(1.0, 1.0, true);

      expect(settings1.getVolume()).toBe(0.0);
      expect(settings2.getVolume()).toBe(1.0);

      // 境界値を超えた場合の失敗
      expect(() => new GameSettings(-Number.EPSILON, 1.0, true)).toThrow();
      expect(() => new GameSettings(1.0 + Number.EPSILON, 1.0, true)).toThrow();
    });

    it('テキスト速度の最小値近辺', () => {
      // 最小値より大きい値での成功
      const settings = new GameSettings(0.5, Number.MIN_VALUE, true);
      expect(settings.getTextSpeed()).toBe(Number.MIN_VALUE);

      // 0での失敗
      expect(() => new GameSettings(0.5, 0, true)).toThrow();
    });
  });

  describe('実用的なシナリオ', () => {
    it('ユーザー設定の段階的調整', () => {
      let settings = GameSettings.default();

      // 音量を段階的に調整
      const volumeSteps = [0.1, 0.3, 0.5, 0.7, 0.9];
      volumeSteps.forEach((volume) => {
        settings = settings.withVolume(volume);
        expect(settings.getVolume()).toBe(volume);
      });

      // テキスト速度を段階的に調整
      const speedSteps = [0.5, 1.0, 1.5, 2.0, 3.0];
      speedSteps.forEach((speed) => {
        settings = settings.withTextSpeed(speed);
        expect(settings.getTextSpeed()).toBe(speed);
      });
    });

    it('設定のプリセット管理', () => {
      const presets = {
        quiet: new GameSettings(0.1, 0.5, true),
        normal: GameSettings.default(),
        loud: new GameSettings(0.9, 2.0, false),
        silent: new GameSettings(0.0, 1.0, true),
      };

      expect(presets.quiet.getVolume()).toBe(0.1);
      expect(presets.normal.getVolume()).toBe(0.8);
      expect(presets.loud.getVolume()).toBe(0.9);
      expect(presets.silent.getVolume()).toBe(0.0);
    });

    it('設定の保存・復元シミュレーション', () => {
      const originalSettings = new GameSettings(0.7, 1.8, false);

      // 設定を保存用のオブジェクトに変換
      const savedData = {
        volume: originalSettings.getVolume(),
        textSpeed: originalSettings.getTextSpeed(),
        autoSave: originalSettings.isAutoSaveEnabled(),
      };

      // 設定を復元
      const restoredSettings = new GameSettings(
        savedData.volume,
        savedData.textSpeed,
        savedData.autoSave
      );

      expect(restoredSettings.equals(originalSettings)).toBe(true);
    });
  });

  describe('パフォーマンステスト', () => {
    it('大量の設定変更操作', () => {
      let settings = GameSettings.default();

      const start = performance.now();

      for (let i = 0; i < 1000; i++) {
        settings = settings.withVolume(i / 1000);
      }

      const end = performance.now();
      const duration = end - start;

      // 1000回の設定変更が50ms以内で完了することを確認
      expect(duration).toBeLessThan(50);
      expect(settings.getVolume()).toBe(0.999);
    });

    it('等価性チェックのパフォーマンス', () => {
      const settings1 = new GameSettings(0.123456789, 1.234567, true);
      const settings2 = new GameSettings(0.123456789, 1.234567, true);
      const settings3 = new GameSettings(0.123456788, 1.234567, true);

      const start = performance.now();

      for (let i = 0; i < 1000; i++) {
        settings1.equals(settings2);
        settings1.equals(settings3);
      }

      const end = performance.now();
      const duration = end - start;

      // 1000回の等価性チェックが25ms以内で完了することを確認
      expect(duration).toBeLessThan(25);
    });
  });
});
