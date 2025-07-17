import { describe, it, expect } from 'vitest';
import { RouteId } from './RouteId';

describe('RouteId', () => {
  describe('constructor', () => {
    it('有効な値でRouteIdを作成できる', () => {
      const routeId = new RouteId('route1');
      expect(routeId.getValue()).toBe('route1');
    });

    it('空文字列でも作成できる', () => {
      const routeId = new RouteId('');
      expect(routeId.getValue()).toBe('');
      expect(routeId.isEmpty()).toBe(true);
    });

    it('空白文字のみでも作成できる', () => {
      const routeId = new RouteId('   ');
      expect(routeId.getValue()).toBe('   ');
      expect(routeId.isEmpty()).toBe(true);
    });
  });

  describe('equals', () => {
    it('同じ値のRouteIdは等しい', () => {
      const routeId1 = new RouteId('route1');
      const routeId2 = new RouteId('route1');

      expect(routeId1.equals(routeId2)).toBe(true);
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
      expect(emptyRouteId.getValue()).toBe('');
      expect(emptyRouteId.isEmpty()).toBe(true);
    });
  });
});
