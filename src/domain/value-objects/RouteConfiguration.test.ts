import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { RouteConfiguration } from './RouteConfiguration';
import { TEST_CONSTANTS, loopHelpers } from '../../test/utils/testHelpers';

describe('RouteConfiguration', () => {
  beforeEach(() => {
    RouteConfiguration.resetConfiguration();
  });

  afterEach(() => {
    RouteConfiguration.resetConfiguration();
  });

  describe('getBaseRoutes', () => {
    it('ベースルートの一覧を取得できる', () => {
      const baseRoutes = RouteConfiguration.getBaseRoutes();
      
      expect(baseRoutes).toEqual(TEST_CONSTANTS.VALID_ROUTES);
      expect(baseRoutes).toHaveLength(TEST_CONSTANTS.VALID_ROUTES.length);
    });

    it('返された配列は元の配列と独立している', () => {
      const baseRoutes = RouteConfiguration.getBaseRoutes();
      baseRoutes.push('newRoute');
      
      const secondCall = RouteConfiguration.getBaseRoutes();
      expect(secondCall).toEqual(TEST_CONSTANTS.VALID_ROUTES);
    });
  });

  describe('getDlcRoutes', () => {
    it('初期状態では空の配列を返す', () => {
      const dlcRoutes = RouteConfiguration.getDlcRoutes();
      
      expect(dlcRoutes).toEqual([]);
      expect(dlcRoutes).toHaveLength(0);
    });

    it('DLCルート追加後は追加されたルートを含む', () => {
      RouteConfiguration.addDlcRoute('dlcRoute1');
      RouteConfiguration.addDlcRoute('dlcRoute2');
      
      const dlcRoutes = RouteConfiguration.getDlcRoutes();
      expect(dlcRoutes).toEqual(['dlcRoute1', 'dlcRoute2']);
    });
  });

  describe('getAllRoutes', () => {
    it('ベースルートのみの場合', () => {
      const allRoutes = RouteConfiguration.getAllRoutes();
      
      expect(allRoutes).toEqual(TEST_CONSTANTS.VALID_ROUTES);
    });

    it('DLCルートを含む場合', () => {
      RouteConfiguration.addDlcRoute('dlcRoute1');
      RouteConfiguration.addSpecialRoute('specialRoute1');
      
      const allRoutes = RouteConfiguration.getAllRoutes();
      expect(allRoutes).toEqual([...TEST_CONSTANTS.VALID_ROUTES, 'dlcRoute1', 'specialRoute1']);
    });
  });

  describe('addDlcRoute', () => {
    it('新しいDLCルートを追加できる', () => {
      RouteConfiguration.addDlcRoute('dlcRoute1');
      
      const dlcRoutes = RouteConfiguration.getDlcRoutes();
      expect(dlcRoutes).toContain('dlcRoute1');
    });

    it('重複したDLCルートは追加されない', () => {
      RouteConfiguration.addDlcRoute('dlcRoute1');
      RouteConfiguration.addDlcRoute('dlcRoute1');
      
      const dlcRoutes = RouteConfiguration.getDlcRoutes();
      expect(dlcRoutes).toEqual(['dlcRoute1']);
    });
  });

  describe('addSpecialRoute', () => {
    it('新しい特殊ルートを追加できる', () => {
      RouteConfiguration.addSpecialRoute('specialRoute1');
      
      const specialRoutes = RouteConfiguration.getSpecialRoutes();
      expect(specialRoutes).toContain('specialRoute1');
    });

    it('重複した特殊ルートは追加されない', () => {
      RouteConfiguration.addSpecialRoute('specialRoute1');
      RouteConfiguration.addSpecialRoute('specialRoute1');
      
      const specialRoutes = RouteConfiguration.getSpecialRoutes();
      expect(specialRoutes).toEqual(['specialRoute1']);
    });
  });

  describe('isValidRoute', () => {
    it('ベースルートは有効', () => {
      loopHelpers.testForEachRoute(TEST_CONSTANTS.VALID_ROUTES, (route) => {
        expect(RouteConfiguration.isValidRoute(route)).toBe(true);
      });
    });

    it('トゥルールートは有効', () => {
      expect(RouteConfiguration.isValidRoute(TEST_CONSTANTS.TRUE_ROUTE)).toBe(true);
    });

    it('DLCルートは追加後有効', () => {
      expect(RouteConfiguration.isValidRoute('dlcRoute1')).toBe(false);
      
      RouteConfiguration.addDlcRoute('dlcRoute1');
      expect(RouteConfiguration.isValidRoute('dlcRoute1')).toBe(true);
    });

    it('存在しないルートは無効', () => {
      expect(RouteConfiguration.isValidRoute('nonExistentRoute')).toBe(false);
    });
  });

  describe('isBaseRoute', () => {
    it('ベースルートの判定が正しい', () => {
      loopHelpers.testForEachRoute(TEST_CONSTANTS.VALID_ROUTES, (route) => {
        expect(RouteConfiguration.isBaseRoute(route)).toBe(true);
      });
      expect(RouteConfiguration.isBaseRoute(TEST_CONSTANTS.TRUE_ROUTE)).toBe(false);
      expect(RouteConfiguration.isBaseRoute('nonExistent')).toBe(false);
    });
  });

  describe('isDlcRoute', () => {
    it('DLCルートの判定が正しい', () => {
      expect(RouteConfiguration.isDlcRoute('dlcRoute1')).toBe(false);
      
      RouteConfiguration.addDlcRoute('dlcRoute1');
      expect(RouteConfiguration.isDlcRoute('dlcRoute1')).toBe(true);
      expect(RouteConfiguration.isDlcRoute('route1')).toBe(false);
    });
  });

  describe('isTrueRoute', () => {
    it('トゥルールートの判定が正しい', () => {
      expect(RouteConfiguration.isTrueRoute(TEST_CONSTANTS.TRUE_ROUTE)).toBe(true);
      expect(RouteConfiguration.isTrueRoute(TEST_CONSTANTS.VALID_ROUTES[0])).toBe(false);
      expect(RouteConfiguration.isTrueRoute('dlcRoute1')).toBe(false);
    });
  });

  describe('isTrueRouteUnlockCondition', () => {
    it('全ベースルートがクリアされている場合はtrue', () => {
      expect(RouteConfiguration.isTrueRouteUnlockCondition(TEST_CONSTANTS.VALID_ROUTES)).toBe(true);
    });

    it('一部のベースルートがクリアされていない場合はfalse', () => {
      const clearedRoutes = ['route1', 'route2'];
      
      expect(RouteConfiguration.isTrueRouteUnlockCondition(clearedRoutes)).toBe(false);
    });

    it('DLCルートがクリアされていても関係ない', () => {
      RouteConfiguration.addDlcRoute('dlcRoute1');
      const clearedRoutes = [...TEST_CONSTANTS.VALID_ROUTES, 'dlcRoute1'];
      
      expect(RouteConfiguration.isTrueRouteUnlockCondition(clearedRoutes)).toBe(true);
    });

    it('空の配列の場合はfalse', () => {
      expect(RouteConfiguration.isTrueRouteUnlockCondition([])).toBe(false);
    });
  });

  describe('removeDlcRoute', () => {
    it('DLCルートを削除できる', () => {
      RouteConfiguration.addDlcRoute('dlcRoute1');
      RouteConfiguration.addDlcRoute('dlcRoute2');
      
      RouteConfiguration.removeDlcRoute('dlcRoute1');
      
      const dlcRoutes = RouteConfiguration.getDlcRoutes();
      expect(dlcRoutes).toEqual(['dlcRoute2']);
    });

    it('存在しないDLCルートの削除は無視される', () => {
      RouteConfiguration.addDlcRoute('dlcRoute1');
      
      RouteConfiguration.removeDlcRoute('nonExistent');
      
      const dlcRoutes = RouteConfiguration.getDlcRoutes();
      expect(dlcRoutes).toEqual(['dlcRoute1']);
    });
  });

  describe('getTrueRouteName', () => {
    it('トゥルールートの名前を取得できる', () => {
      expect(RouteConfiguration.getTrueRouteName()).toBe(TEST_CONSTANTS.TRUE_ROUTE);
    });
  });

  describe('拡張性テスト', () => {
    it('複数のDLCルートを同時に管理できる', () => {
      const dlcRoutes = ['dlc1', 'dlc2', 'dlc3', 'dlc4', 'dlc5'];
      
      loopHelpers.testForEachRoute(dlcRoutes, (route) => {
        RouteConfiguration.addDlcRoute(route);
      });
      
      expect(RouteConfiguration.getDlcRoutes()).toEqual(dlcRoutes);
      expect(RouteConfiguration.getAllRoutes()).toEqual([
        ...TEST_CONSTANTS.VALID_ROUTES, ...dlcRoutes
      ]);
    });

    it('DLCと特殊ルートの組み合わせが正しく動作する', () => {
      RouteConfiguration.addDlcRoute('dlcRoute1');
      RouteConfiguration.addSpecialRoute('eventRoute1');
      
      const allRoutes = RouteConfiguration.getAllRoutes();
      expect(allRoutes).toEqual([...TEST_CONSTANTS.VALID_ROUTES, 'dlcRoute1', 'eventRoute1']);
      
      expect(RouteConfiguration.isDlcRoute('dlcRoute1')).toBe(true);
      expect(RouteConfiguration.isDlcRoute('eventRoute1')).toBe(false);
    });
  });
});