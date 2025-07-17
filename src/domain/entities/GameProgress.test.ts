import { describe, it, expect } from 'vitest';
import { GameProgress } from './GameProgress';
import { RouteId } from '../value-objects/RouteId';

describe('GameProgress', () => {
  describe('createNew', () => {
    it('新しいゲーム進行状況を作成できる', () => {
      const progress = GameProgress.createNew('test-id');

      expect(progress.getId()).toBe('test-id');
      expect(progress.getCurrentRoute().getValue()).toBe('');
      expect(progress.getCurrentScene().getValue()).toBe(0);
      expect(progress.getClearedRoutes().size).toBe(0);
      expect(progress.isTrueRouteUnlocked()).toBe(false);
    });
  });

  describe('selectRoute', () => {
    it('ルートを選択できる', () => {
      const progress = GameProgress.createNew('test-id');
      const routeId = RouteId.from('route1');

      progress.selectRoute(routeId);

      expect(progress.getCurrentRoute().equals(routeId)).toBe(true);
      expect(progress.getCurrentScene().getValue()).toBe(0);
    });
  });

  describe('advanceToNextScene', () => {
    it('次のシーンに進める', () => {
      const progress = GameProgress.createNew('test-id');
      progress.selectRoute(RouteId.from('route1'));

      const routeCleared = progress.advanceToNextScene();

      expect(progress.getCurrentScene().getValue()).toBe(1);
      expect(routeCleared).toBe(false);
    });

    it('最終シーンでルートをクリアできる', () => {
      const progress = GameProgress.createNew('test-id');
      progress.selectRoute(RouteId.from('route1'));

      // 最終シーンまで進める
      for (let i = 0; i < 99; i++) {
        progress.advanceToNextScene();
      }

      const routeCleared = progress.advanceToNextScene();

      expect(routeCleared).toBe(true);
      expect(progress.isRouteCleared(RouteId.from('route1'))).toBe(true);
    });
  });

  describe('isTrueRouteUnlocked', () => {
    it('全ルートクリア後にトゥルールートが解放される', () => {
      const progress = GameProgress.createNew('test-id');

      // 3つのルートをクリア
      ['route1', 'route2', 'route3'].forEach((route) => {
        progress.selectRoute(RouteId.from(route));
        // 最終シーンまで進める
        for (let i = 0; i < 100; i++) {
          progress.advanceToNextScene();
        }
      });

      expect(progress.isTrueRouteUnlocked()).toBe(true);
    });

    it('一部のルートのみクリアではトゥルールートは解放されない', () => {
      const progress = GameProgress.createNew('test-id');

      // 1つのルートのみクリア
      progress.selectRoute(RouteId.from('route1'));
      for (let i = 0; i < 100; i++) {
        progress.advanceToNextScene();
      }

      expect(progress.isTrueRouteUnlocked()).toBe(false);
    });
  });

  describe('restore', () => {
    it('既存データから復元できる', () => {
      const progress = GameProgress.restore(
        'test-id',
        'route1',
        5,
        ['route2'],
        new Date('2023-01-01')
      );

      expect(progress.getId()).toBe('test-id');
      expect(progress.getCurrentRoute().getValue()).toBe('route1');
      expect(progress.getCurrentScene().getValue()).toBe(5);
      expect(progress.isRouteCleared(RouteId.from('route2'))).toBe(true);
    });
  });
});
