import { describe, it, expect } from 'vitest';
import { SceneNumber } from './SceneNumber';
import { enhancedAssertions } from '../../test/utils/testHelpers';

describe('SceneNumber エッジケース', () => {
  describe('境界値テスト', () => {
    it('非常に大きな値でSceneNumberを作成できる', () => {
      const largeNumber = Number.MAX_SAFE_INTEGER;
      const sceneNumber = SceneNumber.from(largeNumber);

      expect(sceneNumber.getValue()).toBe(largeNumber);
    });

    it('最大安全整数値の次のシーン番号を取得できる', () => {
      const maxSafeInteger = Number.MAX_SAFE_INTEGER;
      const sceneNumber = SceneNumber.from(maxSafeInteger);

      // 最大安全整数値を超えるがJavaScriptでは処理可能
      const nextScene = sceneNumber.next();
      expect(nextScene.getValue()).toBe(maxSafeInteger + 1);
    });

    it('0の次のシーン番号を取得できる', () => {
      const sceneNumber = SceneNumber.zero();
      const nextScene = sceneNumber.next();

      expect(nextScene.getValue()).toBe(1);
    });
  });

  describe('型安全性テスト', () => {
    it('非整数値での作成時にエラーを投げる', () => {
      enhancedAssertions.expectThrowsError(
        () => SceneNumber.from(3.14),
        'シーン番号は整数でなければなりません'
      );
    });

    it('NaNでの作成時にエラーを投げる', () => {
      enhancedAssertions.expectThrowsError(
        () => SceneNumber.from(NaN),
        'シーン番号は有効な数値でなければなりません'
      );
    });

    it('Infinityでの作成時にエラーを投げる', () => {
      enhancedAssertions.expectThrowsError(
        () => SceneNumber.from(Infinity),
        'シーン番号は有限の数値でなければなりません'
      );
    });

    it('負のInfinityでの作成時にエラーを投げる', () => {
      enhancedAssertions.expectThrowsError(
        () => SceneNumber.from(-Infinity),
        'シーン番号は有限の数値でなければなりません'
      );
    });
  });

  describe('等価性の詳細テスト', () => {
    it('同じオブジェクトとの等価性を確認する', () => {
      const sceneNumber = SceneNumber.from(42);
      expect(sceneNumber.equals(sceneNumber)).toBe(true);
    });

    it('大きな値での等価性を確認する', () => {
      const largeValue = 1000000;
      const sceneNumber1 = SceneNumber.from(largeValue);
      const sceneNumber2 = SceneNumber.from(largeValue);

      expect(sceneNumber1.equals(sceneNumber2)).toBe(true);
    });

    it('0との等価性を確認する', () => {
      const sceneNumber1 = SceneNumber.zero();
      const sceneNumber2 = SceneNumber.from(0);

      expect(sceneNumber1.equals(sceneNumber2)).toBe(true);
    });
  });

  describe('isLastSceneの詳細テスト', () => {
    it('境界値での最終シーン判定', () => {
      const sceneNumber = SceneNumber.from(99);

      expect(sceneNumber.isLastScene(100)).toBe(true);
      expect(sceneNumber.isLastScene(99)).toBe(false);
      expect(sceneNumber.isLastScene(98)).toBe(false);
    });

    it('0での最終シーン判定', () => {
      const sceneNumber = SceneNumber.zero();

      expect(sceneNumber.isLastScene(1)).toBe(true);
      expect(sceneNumber.isLastScene(0)).toBe(false);
    });

    it('大きな値での最終シーン判定', () => {
      const largeScene = 999999;
      const sceneNumber = SceneNumber.from(largeScene);

      expect(sceneNumber.isLastScene(largeScene + 1)).toBe(true);
      expect(sceneNumber.isLastScene(largeScene)).toBe(false);
    });

    it('最大シーン数が負の値の場合の動作', () => {
      const sceneNumber = SceneNumber.from(5);

      // 負の最大シーン数は論理的におかしいが、falseを返すべき
      expect(sceneNumber.isLastScene(-1)).toBe(false);
    });
  });

  describe('不変性テスト', () => {
    it('next()メソッドの連続実行で元オブジェクトが変更されない', () => {
      const originalValue = 10;
      const sceneNumber = SceneNumber.from(originalValue);

      // 複数回next()を実行
      sceneNumber.next();
      sceneNumber.next();
      sceneNumber.next();

      // 元のオブジェクトは変更されていない
      expect(sceneNumber.getValue()).toBe(originalValue);
    });

    it('複数のnext()チェーンが正しく動作する', () => {
      const sceneNumber = SceneNumber.from(5);

      const next1 = sceneNumber.next();
      const next2 = next1.next();
      const next3 = next2.next();

      expect(sceneNumber.getValue()).toBe(5);
      expect(next1.getValue()).toBe(6);
      expect(next2.getValue()).toBe(7);
      expect(next3.getValue()).toBe(8);
    });
  });

  describe('パフォーマンステスト', () => {
    it('大量のSceneNumberオブジェクト作成でのメモリ使用量', () => {
      const sceneNumbers: SceneNumber[] = [];

      // 1000個のSceneNumberを作成
      for (let i = 0; i < 1000; i++) {
        sceneNumbers.push(SceneNumber.from(i));
      }

      expect(sceneNumbers.length).toBe(1000);
      expect(sceneNumbers[0].getValue()).toBe(0);
      expect(sceneNumbers[999].getValue()).toBe(999);
    });

    it('next()メソッドの連続実行パフォーマンス', () => {
      const sceneNumber = SceneNumber.from(0);

      const start = performance.now();

      let current = sceneNumber;
      for (let i = 0; i < 1000; i++) {
        current = current.next();
      }

      const end = performance.now();
      const duration = end - start;

      // 1000回のnext()が100ms以内で完了することを確認
      expect(duration).toBeLessThan(100);
      expect(current.getValue()).toBe(1000);
    });

    it('等価性チェックのパフォーマンス', () => {
      const sceneNumber1 = SceneNumber.from(12345);
      const sceneNumber2 = SceneNumber.from(12345);
      const sceneNumber3 = SceneNumber.from(12346);

      const start = performance.now();

      for (let i = 0; i < 1000; i++) {
        sceneNumber1.equals(sceneNumber2);
        sceneNumber1.equals(sceneNumber3);
      }

      const end = performance.now();
      const duration = end - start;

      // 1000回の等価性チェックが50ms以内で完了することを確認
      expect(duration).toBeLessThan(50);
    });
  });

  describe('実用的なシナリオ', () => {
    it('ゲームの実際のシーン進行をシミュレート', () => {
      let currentScene = SceneNumber.zero();
      const maxScenes = 100;

      // シーン0から99まで進行
      for (let i = 0; i < maxScenes; i++) {
        expect(currentScene.getValue()).toBe(i);

        if (i < maxScenes - 1) {
          expect(currentScene.isLastScene(maxScenes)).toBe(false);
          currentScene = currentScene.next();
        } else {
          expect(currentScene.isLastScene(maxScenes)).toBe(true);
        }
      }

      expect(currentScene.getValue()).toBe(maxScenes - 1);
    });

    it('複数ルートでの同時シーン管理', () => {
      const route1Scene = SceneNumber.from(10);
      const route2Scene = SceneNumber.from(25);
      const route3Scene = SceneNumber.from(50);

      // 各ルートが独立してシーン進行
      const route1Next = route1Scene.next();
      const route2Next = route2Scene.next();
      const route3Next = route3Scene.next();

      // 元のオブジェクトは変更されない
      expect(route1Scene.getValue()).toBe(10);
      expect(route2Scene.getValue()).toBe(25);
      expect(route3Scene.getValue()).toBe(50);

      // 新しいオブジェクトが正しく作成される
      expect(route1Next.getValue()).toBe(11);
      expect(route2Next.getValue()).toBe(26);
      expect(route3Next.getValue()).toBe(51);
    });

    it('セーブ・ロード時のシーン番号復元', () => {
      const originalScene = SceneNumber.from(42);
      const savedValue = originalScene.getValue();

      // セーブされた値から復元
      const restoredScene = SceneNumber.from(savedValue);

      expect(restoredScene.equals(originalScene)).toBe(true);
      expect(restoredScene.getValue()).toBe(42);
    });
  });
});
