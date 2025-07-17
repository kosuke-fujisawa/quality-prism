import { describe, it, expect } from 'vitest';
import { GameProgress } from './GameProgress';
import { RouteId } from '../value-objects/RouteId';

describe('GameProgress エッジケース', () => {
  describe('境界値テスト', () => {
    it('シーン0から開始して正しく進行する', () => {
      const progress = GameProgress.createNew('test-id');
      progress.selectRoute(RouteId.from('route1'));

      expect(progress.getCurrentScene().getValue()).toBe(0);
      
      const completed = progress.advanceToNextScene();
      expect(completed).toBe(false);
      expect(progress.getCurrentScene().getValue()).toBe(1);
    });

    it('最終シーン（99）で次に進むとルートがクリアされる', () => {
      const progress = GameProgress.createNew('test-id');
      progress.selectRoute(RouteId.from('route1'));
      
      // シーン99まで進める
      for (let i = 0; i < 99; i++) {
        progress.advanceToNextScene();
      }
      
      expect(progress.getCurrentScene().getValue()).toBe(99);
      
      const completed = progress.advanceToNextScene();
      expect(completed).toBe(true);
      expect(progress.getCurrentScene().getValue()).toBe(100);
      expect(progress.getClearedRoutes().has(RouteId.from('route1'))).toBe(true);
    });

    it('シーン100（最終シーン）で次に進んでも状態が変わらない', () => {
      const progress = GameProgress.createNew('test-id');
      progress.selectRoute(RouteId.from('route1'));
      
      // 最終シーンまで進める
      for (let i = 0; i < 100; i++) {
        progress.advanceToNextScene();
      }
      
      expect(progress.getCurrentScene().getValue()).toBe(100);
      
      // さらに進めても状態は変わらない
      const completed = progress.advanceToNextScene();
      expect(completed).toBe(false);
      expect(progress.getCurrentScene().getValue()).toBe(100);
    });
  });

  describe('複数ルートのクリア状態', () => {
    it('同じルートを複数回クリアしても重複しない', () => {
      const progress = GameProgress.createNew('test-id');
      const route1 = RouteId.from('route1');
      
      // 1回目のクリア
      progress.selectRoute(route1);
      for (let i = 0; i < 100; i++) {
        progress.advanceToNextScene();
      }
      
      expect(progress.getClearedRoutes().size).toBe(1);
      
      // 2回目のクリア
      progress.selectRoute(route1);
      for (let i = 0; i < 100; i++) {
        progress.advanceToNextScene();
      }
      
      expect(progress.getClearedRoutes().size).toBe(1);
      expect(progress.getClearedRoutes().has(route1)).toBe(true);
    });

    it('3つのルートを段階的にクリアしてトゥルールートが解放される', () => {
      const progress = GameProgress.createNew('test-id');
      const routes = ['route1', 'route2', 'route3'];
      
      routes.forEach((routeName, index) => {
        progress.selectRoute(RouteId.from(routeName));
        for (let i = 0; i < 100; i++) {
          progress.advanceToNextScene();
        }
        
        expect(progress.getClearedRoutes().size).toBe(index + 1);
        expect(progress.isTrueRouteUnlocked()).toBe(index === 2);
      });
    });

    it('部分的なクリアではトゥルールートが解放されない', () => {
      const progress = GameProgress.createNew('test-id');
      
      // route1とroute2のみクリア
      ['route1', 'route2'].forEach(routeName => {
        progress.selectRoute(RouteId.from(routeName));
        for (let i = 0; i < 100; i++) {
          progress.advanceToNextScene();
        }
      });
      
      expect(progress.getClearedRoutes().size).toBe(2);
      expect(progress.isTrueRouteUnlocked()).toBe(false);
    });
  });

  describe('データ復元時のエッジケース', () => {
    it('無効なシーン番号で復元されても正常に動作する', () => {
      const progress = GameProgress.restore(
        'test-id',
        'route1',
        -1, // 無効なシーン番号
        [],
        new Date()
      );
      
      expect(progress.getCurrentScene().getValue()).toBe(0);
    });

    it('範囲外のシーン番号で復元されても正常に動作する', () => {
      const progress = GameProgress.restore(
        'test-id',
        'route1',
        150, // 範囲外のシーン番号
        [],
        new Date()
      );
      
      expect(progress.getCurrentScene().getValue()).toBe(100);
    });

    it('空のクリア済みルート配列で復元できる', () => {
      const progress = GameProgress.restore(
        'test-id',
        'route1',
        10,
        [], // 空の配列
        new Date()
      );
      
      expect(progress.getClearedRoutes().size).toBe(0);
      expect(progress.isTrueRouteUnlocked()).toBe(false);
    });

    it('重複するクリア済みルートで復元されても正常に動作する', () => {
      const progress = GameProgress.restore(
        'test-id',
        'route1',
        10,
        ['route1', 'route1', 'route2'], // 重複あり
        new Date()
      );
      
      expect(progress.getClearedRoutes().size).toBe(2);
      expect(progress.getClearedRoutes().has(RouteId.from('route1'))).toBe(true);
      expect(progress.getClearedRoutes().has(RouteId.from('route2'))).toBe(true);
    });
  });

  describe('ルート選択時のエッジケース', () => {
    it('空のルートを選択しても内部状態は変更されない', () => {
      const progress = GameProgress.createNew('test-id');
      const initialRoute = progress.getCurrentRoute();
      const initialScene = progress.getCurrentScene();
      
      progress.selectRoute(RouteId.empty());
      
      expect(progress.getCurrentRoute().equals(initialRoute)).toBe(true);
      expect(progress.getCurrentScene().equals(initialScene)).toBe(true);
    });

    it('同じルートを連続して選択しても正しく動作する', () => {
      const progress = GameProgress.createNew('test-id');
      const route1 = RouteId.from('route1');
      
      progress.selectRoute(route1);
      progress.advanceToNextScene();
      progress.advanceToNextScene();
      
      expect(progress.getCurrentScene().getValue()).toBe(2);
      
      // 同じルートを再選択
      progress.selectRoute(route1);
      
      expect(progress.getCurrentScene().getValue()).toBe(0);
    });

    it('異なるルートを選択するとシーンがリセットされる', () => {
      const progress = GameProgress.createNew('test-id');
      
      progress.selectRoute(RouteId.from('route1'));
      progress.advanceToNextScene();
      progress.advanceToNextScene();
      
      expect(progress.getCurrentScene().getValue()).toBe(2);
      
      // 異なるルートを選択
      progress.selectRoute(RouteId.from('route2'));
      
      expect(progress.getCurrentScene().getValue()).toBe(0);
      expect(progress.getCurrentRoute().getValue()).toBe('route2');
    });
  });

  describe('保存時間の管理', () => {
    it('新規作成時の保存時間が現在時刻に近い', () => {
      const beforeCreate = new Date();
      const progress = GameProgress.createNew('test-id');
      const afterCreate = new Date();
      
      const saveTime = progress.getSaveTime();
      expect(saveTime.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
      expect(saveTime.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
    });

    it('復元時の保存時間が指定した時刻になる', () => {
      const specificTime = new Date('2023-01-01T12:00:00Z');
      const progress = GameProgress.restore(
        'test-id',
        'route1',
        10,
        [],
        specificTime
      );
      
      expect(progress.getSaveTime()).toEqual(specificTime);
    });

    it('ルート選択時に保存時間が更新される', () => {
      const progress = GameProgress.createNew('test-id');
      const initialSaveTime = progress.getSaveTime();
      
      // 少し待機
      const waitTime = 10;
      const startTime = Date.now();
      while (Date.now() - startTime < waitTime) {
        // 待機
      }
      
      progress.selectRoute(RouteId.from('route1'));
      
      expect(progress.getSaveTime().getTime()).toBeGreaterThan(initialSaveTime.getTime());
    });
  });
});