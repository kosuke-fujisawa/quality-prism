import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { RouteConfiguration } from './RouteConfiguration';

describe('RouteConfiguration 拡張性テスト', () => {
  beforeEach(() => {
    RouteConfiguration.resetConfiguration();
  });

  afterEach(() => {
    RouteConfiguration.resetConfiguration();
  });

  describe('DLC追加シナリオ', () => {
    it('DLC追加後も既存のベースルートが変更されない', () => {
      const originalBaseRoutes = RouteConfiguration.getBaseRoutes();

      RouteConfiguration.addDlcRoute('dlc-route-1');
      RouteConfiguration.addDlcRoute('dlc-route-2');

      const currentBaseRoutes = RouteConfiguration.getBaseRoutes();
      expect(currentBaseRoutes).toEqual(originalBaseRoutes);
      expect(currentBaseRoutes).toEqual(['route1', 'route2', 'route3']);
    });

    it('DLC追加後、getAllRoutesに新しいルートが含まれる', () => {
      RouteConfiguration.addDlcRoute('dlc-route-1');
      RouteConfiguration.addDlcRoute('dlc-route-2');

      const allRoutes = RouteConfiguration.getAllRoutes();
      expect(allRoutes).toContain('dlc-route-1');
      expect(allRoutes).toContain('dlc-route-2');
      expect(allRoutes).toContain('route1');
      expect(allRoutes).toContain('route2');
      expect(allRoutes).toContain('route3');
    });

    it('DLCルートもisValidRouteで正しく認識される', () => {
      expect(RouteConfiguration.isValidRoute('dlc-route-1')).toBe(false);

      RouteConfiguration.addDlcRoute('dlc-route-1');
      expect(RouteConfiguration.isValidRoute('dlc-route-1')).toBe(true);
    });

    it('DLCルートはベースルートの判定に影響しない', () => {
      RouteConfiguration.addDlcRoute('dlc-route-1');

      expect(RouteConfiguration.isBaseRoute('route1')).toBe(true);
      expect(RouteConfiguration.isBaseRoute('dlc-route-1')).toBe(false);
      expect(RouteConfiguration.isDlcRoute('dlc-route-1')).toBe(true);
    });
  });

  describe('トゥルールート解放条件の拡張性', () => {
    it('DLCルートがあってもトゥルールート解放条件はベースルートのみ', () => {
      RouteConfiguration.addDlcRoute('dlc-route-1');
      RouteConfiguration.addDlcRoute('dlc-route-2');

      // ベースルートのみクリア
      const baseRoutesCleared = ['route1', 'route2', 'route3'];
      expect(
        RouteConfiguration.isTrueRouteUnlockCondition(baseRoutesCleared)
      ).toBe(true);

      // DLCルートも含めてクリア
      const allRoutesCleared = [
        'route1',
        'route2',
        'route3',
        'dlc-route-1',
        'dlc-route-2',
      ];
      expect(
        RouteConfiguration.isTrueRouteUnlockCondition(allRoutesCleared)
      ).toBe(true);

      // DLCルートのみクリア
      const dlcOnlyCleared = ['dlc-route-1', 'dlc-route-2'];
      expect(
        RouteConfiguration.isTrueRouteUnlockCondition(dlcOnlyCleared)
      ).toBe(false);
    });

    it('ベースルートが一部未クリアだとDLCルートクリアでも解放されない', () => {
      RouteConfiguration.addDlcRoute('dlc-route-1');

      const partialCleared = ['route1', 'route2', 'dlc-route-1'];
      expect(
        RouteConfiguration.isTrueRouteUnlockCondition(partialCleared)
      ).toBe(false);
    });
  });

  describe('特殊ルートの拡張性', () => {
    it('特殊ルートを追加・管理できる', () => {
      RouteConfiguration.addSpecialRoute('event-route-1');
      RouteConfiguration.addSpecialRoute('seasonal-route-1');

      const specialRoutes = RouteConfiguration.getSpecialRoutes();
      expect(specialRoutes).toContain('event-route-1');
      expect(specialRoutes).toContain('seasonal-route-1');
    });

    it('特殊ルートもisValidRouteで正しく認識される', () => {
      expect(RouteConfiguration.isValidRoute('event-route-1')).toBe(false);

      RouteConfiguration.addSpecialRoute('event-route-1');
      expect(RouteConfiguration.isValidRoute('event-route-1')).toBe(true);
    });

    it('特殊ルートはベースルートやDLCルートの判定に影響しない', () => {
      RouteConfiguration.addSpecialRoute('event-route-1');

      expect(RouteConfiguration.isBaseRoute('event-route-1')).toBe(false);
      expect(RouteConfiguration.isDlcRoute('event-route-1')).toBe(false);
    });
  });

  describe('複合的な拡張シナリオ', () => {
    it('ベース・DLC・特殊ルートが混在しても正しく動作する', () => {
      RouteConfiguration.addDlcRoute('dlc-expansion-1');
      RouteConfiguration.addDlcRoute('dlc-expansion-2');
      RouteConfiguration.addSpecialRoute('christmas-event');
      RouteConfiguration.addSpecialRoute('summer-event');

      const allRoutes = RouteConfiguration.getAllRoutes();
      expect(allRoutes).toHaveLength(7); // 3 + 2 + 2

      // 各種類のルートが正しく分類される
      expect(RouteConfiguration.getBaseRoutes()).toHaveLength(3);
      expect(RouteConfiguration.getDlcRoutes()).toHaveLength(2);
      expect(RouteConfiguration.getSpecialRoutes()).toHaveLength(2);

      // 全てのルートが有効として認識される
      allRoutes.forEach((route) => {
        expect(RouteConfiguration.isValidRoute(route)).toBe(true);
      });
    });

    it('DLC削除機能が正しく動作する', () => {
      RouteConfiguration.addDlcRoute('dlc-1');
      RouteConfiguration.addDlcRoute('dlc-2');
      RouteConfiguration.addDlcRoute('dlc-3');

      expect(RouteConfiguration.getDlcRoutes()).toHaveLength(3);

      RouteConfiguration.removeDlcRoute('dlc-2');

      const remainingDlc = RouteConfiguration.getDlcRoutes();
      expect(remainingDlc).toHaveLength(2);
      expect(remainingDlc).toContain('dlc-1');
      expect(remainingDlc).toContain('dlc-3');
      expect(remainingDlc).not.toContain('dlc-2');

      expect(RouteConfiguration.isValidRoute('dlc-2')).toBe(false);
    });
  });

  describe('大規模拡張の性能テスト', () => {
    it('大量のDLCルートを追加しても性能が劣化しない', () => {
      const startTime = Date.now();

      // 100個のDLCルートを追加
      for (let i = 0; i < 100; i++) {
        RouteConfiguration.addDlcRoute(`dlc-route-${i}`);
      }

      const endTime = Date.now();
      const elapsedTime = endTime - startTime;

      // 100個の追加が1秒以内で完了することを確認
      expect(elapsedTime).toBeLessThan(1000);

      // 全ルート取得も高速であることを確認
      const getAllStartTime = Date.now();
      const allRoutes = RouteConfiguration.getAllRoutes();
      const getAllEndTime = Date.now();

      expect(getAllEndTime - getAllStartTime).toBeLessThan(100);
      expect(allRoutes).toHaveLength(103); // 3 base + 100 DLC
    });

    it('大量のルートがあってもisValidRouteが高速', () => {
      // 大量のDLCルートを追加
      for (let i = 0; i < 1000; i++) {
        RouteConfiguration.addDlcRoute(`dlc-route-${i}`);
      }

      const startTime = Date.now();

      // 複数のルートの妥当性をチェック
      const testRoutes = [
        'route1',
        'dlc-route-500',
        'non-existent-route',
        'trueRoute',
      ];
      testRoutes.forEach((route) => {
        RouteConfiguration.isValidRoute(route);
      });

      const endTime = Date.now();
      const elapsedTime = endTime - startTime;

      // 大量のルートがあっても妥当性チェックが高速
      expect(elapsedTime).toBeLessThan(100);
    });
  });

  describe('設定リセット機能', () => {
    it('resetConfiguration後は初期状態に戻る', () => {
      RouteConfiguration.addDlcRoute('dlc-1');
      RouteConfiguration.addSpecialRoute('event-1');

      expect(RouteConfiguration.getDlcRoutes()).toHaveLength(1);
      expect(RouteConfiguration.getSpecialRoutes()).toHaveLength(1);

      RouteConfiguration.resetConfiguration();

      expect(RouteConfiguration.getDlcRoutes()).toHaveLength(0);
      expect(RouteConfiguration.getSpecialRoutes()).toHaveLength(0);
      expect(RouteConfiguration.getBaseRoutes()).toEqual([
        'route1',
        'route2',
        'route3',
      ]);
    });
  });
});
