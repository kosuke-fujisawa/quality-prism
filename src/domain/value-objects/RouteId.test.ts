import { describe, it, expect } from 'vitest';
import { RouteId } from './RouteId';
import { 
  TEST_CONSTANTS, 
  expectMessage,
  commonAssertions
} from '../../test/utils/testHelpers';

// 統合されたRouteIdテスト（エッジケースを含む）

describe('RouteId', () => {
  describe('エッジケース', () => {
    describe('境界値と特殊文字', () => {
      it('空文字列で作成されたRouteIdは空とみなされる', () => {
        const emptyRoute = RouteId.from('');
        
        commonAssertions.expectEmptyRoute(emptyRoute);
      });

      it('空白のみの文字列は空とみなされる', () => {
        const whitespaceRoute = RouteId.from('   ');
        
        expect(whitespaceRoute.isEmpty(), expectMessage.shouldBeTrue()).toBe(true);
        expect(whitespaceRoute.getValue(), expectMessage.shouldEqual('   ')).toBe('   ');
      });

      it('タブ文字のみの文字列は空とみなされる', () => {
        const tabRoute = RouteId.from('\t\t');
        
        expect(tabRoute.isEmpty(), expectMessage.shouldBeTrue()).toBe(true);
        expect(tabRoute.getValue(), expectMessage.shouldEqual('\t\t')).toBe('\t\t');
      });

      it('改行文字のみの文字列は空とみなされる', () => {
        const newlineRoute = RouteId.from('\n\n');
        
        expect(newlineRoute.isEmpty(), expectMessage.shouldBeTrue()).toBe(true);
        expect(newlineRoute.getValue(), expectMessage.shouldEqual('\n\n')).toBe('\n\n');
      });

      it('混合した空白文字は空とみなされる', () => {
        const mixedWhitespaceRoute = RouteId.from(' \t\n ');
        
        expect(mixedWhitespaceRoute.isEmpty(), expectMessage.shouldBeTrue()).toBe(true);
        expect(mixedWhitespaceRoute.getValue(), expectMessage.shouldEqual(' \t\n ')).toBe(' \t\n ');
      });
    });

    describe('特殊文字を含むルートID', () => {
      it('数字のみのルートIDも有効', () => {
        const numericRoute = RouteId.from('123');
        
        expect(numericRoute.isEmpty(), expectMessage.shouldBeFalse()).toBe(false);
        expect(numericRoute.getValue(), expectMessage.shouldEqual('123')).toBe('123');
      });

      it('記号を含むルートIDも有効', () => {
        const symbolRoute = RouteId.from('route-1_test');
        
        expect(symbolRoute.isEmpty(), expectMessage.shouldBeFalse()).toBe(false);
        expect(symbolRoute.getValue(), expectMessage.shouldEqual('route-1_test')).toBe('route-1_test');
      });

      it('日本語のルートIDも有効', () => {
        const japaneseRoute = RouteId.from('ルート１');
        
        expect(japaneseRoute.isEmpty(), expectMessage.shouldBeFalse()).toBe(false);
        expect(japaneseRoute.getValue(), expectMessage.shouldEqual('ルート１')).toBe('ルート１');
      });

      it('特殊記号を含むルートIDも有効', () => {
        const specialRoute = RouteId.from('route@#$%');
        
        expect(specialRoute.isEmpty(), expectMessage.shouldBeFalse()).toBe(false);
        expect(specialRoute.getValue(), expectMessage.shouldEqual('route@#$%')).toBe('route@#$%');
      });
    });

    describe('非常に長いルートID', () => {
      it('長いルートIDでも正常に動作する', () => {
        const longRouteValue = 'a'.repeat(1000);
        const longRoute = RouteId.from(longRouteValue);
        
        expect(longRoute.isEmpty(), expectMessage.shouldBeFalse()).toBe(false);
        expect(longRoute.getValue(), expectMessage.shouldEqual(longRouteValue)).toBe(longRouteValue);
      });
    });
  });

  describe('基本機能', () => {
  describe('constructor', () => {
    it('有効な値でRouteIdを作成できる', () => {
      const routeId = new RouteId(TEST_CONSTANTS.VALID_ROUTES[0]);
      commonAssertions.expectValidRoute(routeId, TEST_CONSTANTS.VALID_ROUTES[0]);
    });

    it('空文字列でも作成できる', () => {
      const routeId = new RouteId('');
      commonAssertions.expectEmptyRoute(routeId);
    });

    it('空白文字のみでも作成できる', () => {
      const routeId = new RouteId('   ');
      expect(routeId.getValue(), expectMessage.shouldEqual('   ')).toBe('   ');
      expect(routeId.isEmpty(), expectMessage.shouldBeTrue()).toBe(true);
    });
  });

  describe('equals', () => {
    it('同じ値のRouteIdは等しい', () => {
      const routeId1 = new RouteId(TEST_CONSTANTS.VALID_ROUTES[0]);
      const routeId2 = new RouteId(TEST_CONSTANTS.VALID_ROUTES[0]);

      expect(routeId1.equals(routeId2), expectMessage.shouldBeTrue()).toBe(true);
    });

    it('異なる値のRouteIdは等しくない', () => {
      const routeId1 = new RouteId('route1');
      const routeId2 = new RouteId('route2');

      expect(routeId1.equals(routeId2)).toBe(false);
    });
  });

  describe('from', () => {
    it('ファクトリーメソッドでRouteIdを作成できる', () => {
      const routeId = RouteId.from('route1');
      expect(routeId.getValue()).toBe('route1');
    });
  });

  describe('toString', () => {
    it('文字列表現を取得できる', () => {
      const routeId = new RouteId('route1');
      expect(routeId.toString()).toBe('route1');
    });
  });

  describe('isEmpty', () => {
    it('空のRouteIdを判定できる', () => {
      const emptyRouteId = RouteId.empty();
      expect(emptyRouteId.isEmpty()).toBe(true);
    });

    it('非空のRouteIdを判定できる', () => {
      const routeId = new RouteId('route1');
      expect(routeId.isEmpty()).toBe(false);
    });
  });

  describe('empty', () => {
    it('空のRouteIdを作成できる', () => {
      const emptyRouteId = RouteId.empty();
      commonAssertions.expectEmptyRoute(emptyRouteId);
    });
  });
  });
});
