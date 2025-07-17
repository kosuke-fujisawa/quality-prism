import { describe, it, expect } from 'vitest';
import { RouteId } from './RouteId';

describe('RouteId エッジケース', () => {
  describe('境界値と特殊文字', () => {
    it('空文字列で作成されたRouteIdは空とみなされる', () => {
      const emptyRoute = RouteId.from('');
      
      expect(emptyRoute.isEmpty()).toBe(true);
      expect(emptyRoute.getValue()).toBe('');
    });

    it('空白のみの文字列は空とみなされる', () => {
      const whitespaceRoute = RouteId.from('   ');
      
      expect(whitespaceRoute.isEmpty()).toBe(true);
      expect(whitespaceRoute.getValue()).toBe('   ');
    });

    it('タブ文字のみの文字列は空とみなされる', () => {
      const tabRoute = RouteId.from('\t\t');
      
      expect(tabRoute.isEmpty()).toBe(true);
      expect(tabRoute.getValue()).toBe('\t\t');
    });

    it('改行文字のみの文字列は空とみなされる', () => {
      const newlineRoute = RouteId.from('\n\n');
      
      expect(newlineRoute.isEmpty()).toBe(true);
      expect(newlineRoute.getValue()).toBe('\n\n');
    });

    it('混合した空白文字は空とみなされる', () => {
      const mixedWhitespaceRoute = RouteId.from(' \t\n ');
      
      expect(mixedWhitespaceRoute.isEmpty()).toBe(true);
      expect(mixedWhitespaceRoute.getValue()).toBe(' \t\n ');
    });
  });

  describe('特殊文字を含むルートID', () => {
    it('数字のみのルートIDも有効', () => {
      const numericRoute = RouteId.from('123');
      
      expect(numericRoute.isEmpty()).toBe(false);
      expect(numericRoute.getValue()).toBe('123');
    });

    it('記号を含むルートIDも有効', () => {
      const symbolRoute = RouteId.from('route-1_test');
      
      expect(symbolRoute.isEmpty()).toBe(false);
      expect(symbolRoute.getValue()).toBe('route-1_test');
    });

    it('日本語のルートIDも有効', () => {
      const japaneseRoute = RouteId.from('ルート１');
      
      expect(japaneseRoute.isEmpty()).toBe(false);
      expect(japaneseRoute.getValue()).toBe('ルート１');
    });

    it('特殊記号を含むルートIDも有効', () => {
      const specialRoute = RouteId.from('route@#$%');
      
      expect(specialRoute.isEmpty()).toBe(false);
      expect(specialRoute.getValue()).toBe('route@#$%');
    });
  });

  describe('非常に長いルートID', () => {
    it('長いルートIDでも正常に動作する', () => {
      const longRoute = RouteId.from('a'.repeat(1000));
      
      expect(longRoute.isEmpty()).toBe(false);
      expect(longRoute.getValue()).toBe('a'.repeat(1000));
    });

    it('非常に長いルートIDの比較も正常に動作する', () => {
      const longValue = 'route' + 'a'.repeat(1000);
      const route1 = RouteId.from(longValue);
      const route2 = RouteId.from(longValue);
      
      expect(route1.equals(route2)).toBe(true);
    });
  });

  describe('等価性テストのエッジケース', () => {
    it('同じ値の異なるインスタンスは等価', () => {
      const route1 = RouteId.from('route1');
      const route2 = RouteId.from('route1');
      
      expect(route1.equals(route2)).toBe(true);
      expect(route2.equals(route1)).toBe(true);
    });

    it('空のRouteIdは他の空のRouteIdと等価', () => {
      const empty1 = RouteId.empty();
      const empty2 = RouteId.empty();
      const empty3 = RouteId.from('');
      
      expect(empty1.equals(empty2)).toBe(true);
      expect(empty1.equals(empty3)).toBe(true);
      expect(empty2.equals(empty3)).toBe(true);
    });

    it('大文字小文字は区別される', () => {
      const route1 = RouteId.from('Route1');
      const route2 = RouteId.from('route1');
      
      expect(route1.equals(route2)).toBe(false);
      expect(route2.equals(route1)).toBe(false);
    });

    it('前後の空白は区別される', () => {
      const route1 = RouteId.from('route1');
      const route2 = RouteId.from(' route1 ');
      
      expect(route1.equals(route2)).toBe(false);
      expect(route2.equals(route1)).toBe(false);
    });
  });

  describe('Factory method のエッジケース', () => {
    it('empty()で作成されたRouteIdは常に空', () => {
      const empty1 = RouteId.empty();
      const empty2 = RouteId.empty();
      
      expect(empty1.isEmpty()).toBe(true);
      expect(empty2.isEmpty()).toBe(true);
      expect(empty1.equals(empty2)).toBe(true);
    });

    it('from()とempty()で作成された空のRouteIdは等価', () => {
      const emptyFromFactory = RouteId.empty();
      const emptyFromString = RouteId.from('');
      
      expect(emptyFromFactory.equals(emptyFromString)).toBe(true);
      expect(emptyFromString.equals(emptyFromFactory)).toBe(true);
    });
  });

  describe('immutability テスト', () => {
    it('RouteIdは不変オブジェクトである', () => {
      const route = RouteId.from('route1');
      const originalValue = route.getValue();
      
      // 値を変更しようとしても変更されない（TypeScriptのreadonlyにより）
      expect(route.getValue()).toBe(originalValue);
    });

    it('異なるRouteIdインスタンスは独立している', () => {
      const route1 = RouteId.from('route1');
      const route2 = RouteId.from('route2');
      
      expect(route1.getValue()).toBe('route1');
      expect(route2.getValue()).toBe('route2');
      expect(route1.equals(route2)).toBe(false);
    });
  });

  describe('メモリ効率性テスト', () => {
    it('大量のRouteIdインスタンスを作成しても問題ない', () => {
      const routes: RouteId[] = [];
      
      for (let i = 0; i < 10000; i++) {
        routes.push(RouteId.from(`route${i}`));
      }
      
      expect(routes.length).toBe(10000);
      expect(routes[0].getValue()).toBe('route0');
      expect(routes[9999].getValue()).toBe('route9999');
    });

    it('同じ値のRouteIdを大量作成しても個別に動作する', () => {
      const routes: RouteId[] = [];
      
      for (let i = 0; i < 1000; i++) {
        routes.push(RouteId.from('sameRoute'));
      }
      
      expect(routes.length).toBe(1000);
      expect(routes.every(route => route.getValue() === 'sameRoute')).toBe(true);
      expect(routes.every(route => route.equals(RouteId.from('sameRoute')))).toBe(true);
    });
  });
});