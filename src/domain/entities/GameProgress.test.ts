import { describe, it, expect } from 'vitest';
import { GameProgress } from './GameProgress';
import { RouteId } from '../value-objects/RouteId';
import { 
  TEST_CONSTANTS, 
  createProgressWithRoute, 
  createProgressWithClearedRoutes,
  createProgressAtFinalScene,
  createProgressWithAllBaseRoutesCleared,
  createRestoredProgress,
  expectMessage,
  commonAssertions
} from '../../test/utils/testHelpers';

describe('GameProgress', () => {
  describe('createNew', () => {
    it('新しいゲーム進行状況を作成できる', () => {
      const progress = GameProgress.createNew(TEST_CONSTANTS.DEFAULT_TEST_ID);

      expect(progress.getId()).toBe(TEST_CONSTANTS.DEFAULT_TEST_ID);
      expect(progress.getCurrentRoute().getValue()).toBe('');
      expect(progress.getCurrentScene().getValue()).toBe(0);
      expect(progress.getClearedRoutes().size).toBe(0);
      expect(progress.isTrueRouteUnlocked()).toBe(false);
    });
  });

  describe('selectRoute', () => {
    it('ルートを選択できる', () => {
      const progress = GameProgress.createNew(TEST_CONSTANTS.DEFAULT_TEST_ID);
      const routeId = RouteId.from(TEST_CONSTANTS.VALID_ROUTES[0]);

      progress.selectRoute(routeId);

      expect(progress.getCurrentRoute().equals(routeId)).toBe(true);
      expect(progress.getCurrentScene().getValue()).toBe(0);
    });
  });

  describe('advanceToNextScene', () => {
    it('次のシーンに進める', () => {
      const progress = createProgressWithRoute(TEST_CONSTANTS.VALID_ROUTES[0]);

      const routeCleared = progress.advanceToNextScene();

      expect(progress.getCurrentScene().getValue()).toBe(1);
      expect(routeCleared).toBe(false);
    });

    it('最終シーンでルートをクリアできる', () => {
      const progress = createProgressAtFinalScene(TEST_CONSTANTS.VALID_ROUTES[0]);

      const routeCleared = progress.advanceToNextScene();

      expect(routeCleared).toBe(true);
      expect(progress.isRouteCleared(RouteId.from(TEST_CONSTANTS.VALID_ROUTES[0]))).toBe(true);
    });
  });

  describe('isTrueRouteUnlocked', () => {
    it('全ルートクリア後にトゥルールートが解放される', () => {
      const progress = createProgressWithAllBaseRoutesCleared();

      expect(progress.isTrueRouteUnlocked()).toBe(true);
    });

    it('一部のルートのみクリアではトゥルールートは解放されない', () => {
      const progress = createProgressWithClearedRoutes([TEST_CONSTANTS.VALID_ROUTES[0]]);

      expect(progress.isTrueRouteUnlocked()).toBe(false);
    });
  });

  describe('restore', () => {
    it('既存データから復元できる', () => {
      const testId = TEST_CONSTANTS.DEFAULT_TEST_ID;
      const currentRoute = TEST_CONSTANTS.VALID_ROUTES[0];
      const currentScene = 5;
      const clearedRoutes = [TEST_CONSTANTS.VALID_ROUTES[1]];
      const saveTime = new Date('2023-01-01');

      const progress = createRestoredProgress(testId, currentRoute, currentScene, clearedRoutes, saveTime);

      expect(progress.getId()).toBe(testId);
      expect(progress.getCurrentRoute().getValue()).toBe(currentRoute);
      expect(progress.getCurrentScene().getValue()).toBe(currentScene);
      expect(progress.isRouteCleared(RouteId.from(clearedRoutes[0]))).toBe(true);
    });
  });
});
