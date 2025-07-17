import { describe, it, expect } from 'vitest';
import { SceneNumber } from './SceneNumber';

describe('SceneNumber', () => {
  describe('constructor', () => {
    it('有効な値でSceneNumberを作成できる', () => {
      const sceneNumber = new SceneNumber(5);
      expect(sceneNumber.getValue()).toBe(5);
    });

    it('0でSceneNumberを作成できる', () => {
      const sceneNumber = new SceneNumber(0);
      expect(sceneNumber.getValue()).toBe(0);
    });

    it('負の値では作成できない', () => {
      expect(() => new SceneNumber(-1)).toThrow(
        'シーン番号は0以上でなければなりません'
      );
    });
  });

  describe('next', () => {
    it('次のシーン番号を取得できる', () => {
      const sceneNumber = new SceneNumber(5);
      const nextScene = sceneNumber.next();

      expect(nextScene.getValue()).toBe(6);
    });

    it('元のオブジェクトは変更されない', () => {
      const sceneNumber = new SceneNumber(5);
      sceneNumber.next();

      expect(sceneNumber.getValue()).toBe(5);
    });
  });

  describe('equals', () => {
    it('同じ値のSceneNumberは等しい', () => {
      const sceneNumber1 = new SceneNumber(5);
      const sceneNumber2 = new SceneNumber(5);

      expect(sceneNumber1.equals(sceneNumber2)).toBe(true);
    });

    it('異なる値のSceneNumberは等しくない', () => {
      const sceneNumber1 = new SceneNumber(5);
      const sceneNumber2 = new SceneNumber(6);

      expect(sceneNumber1.equals(sceneNumber2)).toBe(false);
    });
  });

  describe('isLastScene', () => {
    it('最終シーンかどうかを判定できる', () => {
      const sceneNumber = new SceneNumber(99);

      expect(sceneNumber.isLastScene(100)).toBe(true);
      expect(sceneNumber.isLastScene(101)).toBe(false);
    });
  });

  describe('from', () => {
    it('ファクトリーメソッドでSceneNumberを作成できる', () => {
      const sceneNumber = SceneNumber.from(5);
      expect(sceneNumber.getValue()).toBe(5);
    });
  });

  describe('zero', () => {
    it('0のSceneNumberを作成できる', () => {
      const sceneNumber = SceneNumber.zero();
      expect(sceneNumber.getValue()).toBe(0);
    });
  });
});
