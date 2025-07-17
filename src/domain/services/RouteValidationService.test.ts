import { describe, it, expect } from 'vitest';
import { RouteValidationService } from './RouteValidationService';
import { RouteId } from '../value-objects/RouteId';
import { GameProgress } from '../entities/GameProgress';

describe('RouteValidationService', () => {
  describe('canSelectRoute', () => {
    it('空のルートは選択不可', () => {
      const emptyRoute = RouteId.empty();
      const progress = GameProgress.createNew('test-id');

      const result = RouteValidationService.canSelectRoute(emptyRoute, progress);

      expect(result.canSelect).toBe(false);
      expect(result.reason).toBe('ルートが指定されていません');
    });

    it('有効なルートは選択可能', () => {
      const validRoute = RouteId.from('route1');
      const progress = GameProgress.createNew('test-id');

      const result = RouteValidationService.canSelectRoute(validRoute, progress);

      expect(result.canSelect).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('無効なルートは選択不可', () => {
      const invalidRoute = RouteId.from('invalid-route');
      const progress = GameProgress.createNew('test-id');

      const result = RouteValidationService.canSelectRoute(invalidRoute, progress);

      expect(result.canSelect).toBe(false);
      expect(result.reason).toBe('存在しないルートです');
    });

    it('トゥルールートは全ルートクリア前は選択不可', () => {
      const trueRoute = RouteId.from('trueRoute');
      const progress = GameProgress.createNew('test-id');

      const result = RouteValidationService.canSelectRoute(trueRoute, progress);

      expect(result.canSelect).toBe(false);
      expect(result.reason).toBe('全てのルートをクリアする必要があります');
    });

    it('トゥルールートは全ルートクリア後は選択可能', () => {
      const trueRoute = RouteId.from('trueRoute');
      const progress = GameProgress.restore(
        'test-id',
        'route1',
        0,
        ['route1', 'route2', 'route3'],
        new Date()
      );

      const result = RouteValidationService.canSelectRoute(trueRoute, progress);

      expect(result.canSelect).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('一部のルートのみクリアではトゥルールートは選択不可', () => {
      const trueRoute = RouteId.from('trueRoute');
      const progress = GameProgress.restore(
        'test-id',
        'route1',
        0,
        ['route1', 'route2'], // route3がクリアされていない
        new Date()
      );

      const result = RouteValidationService.canSelectRoute(trueRoute, progress);

      expect(result.canSelect).toBe(false);
      expect(result.reason).toBe('全てのルートをクリアする必要があります');
    });
  });

  describe('getAvailableRoutes', () => {
    it('利用可能なルート一覧を取得できる', () => {
      const availableRoutes = RouteValidationService.getAvailableRoutes();

      expect(availableRoutes).toEqual(['route1', 'route2', 'route3']);
      expect(availableRoutes).toHaveLength(3);
    });

    it('返された配列は元の配列と独立している', () => {
      const availableRoutes = RouteValidationService.getAvailableRoutes();
      availableRoutes.push('newRoute');

      const secondCall = RouteValidationService.getAvailableRoutes();
      expect(secondCall).toEqual(['route1', 'route2', 'route3']);
    });
  });

  describe('getTrueRouteName', () => {
    it('トゥルールートの名前を取得できる', () => {
      const trueRouteName = RouteValidationService.getTrueRouteName();

      expect(trueRouteName).toBe('trueRoute');
    });
  });
});