import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameService } from './GameService';
import { GameProgress } from '../../domain/entities/GameProgress';
import type { GameProgressRepository } from '../../domain/repositories/GameProgressRepository';
import type { GameSettingsRepository } from '../../domain/repositories/GameSettingsRepository';
import { RouteId } from '../../domain/value-objects/RouteId';
import { GameSettings } from '../../domain/value-objects/GameSettings';
import { TEST_CONSTANTS, mockRepositories, ERROR_MESSAGES, loopHelpers, enhancedAssertions } from '../../test/utils/testHelpers';

describe('GameService', () => {
  let gameService: GameService;
  let mockGameProgressRepository: GameProgressRepository;
  let mockGameSettingsRepository: GameSettingsRepository;

  beforeEach(() => {
    // モックファクトリーを使用
    mockGameProgressRepository = mockRepositories.createGameProgressRepository();
    mockGameSettingsRepository = mockRepositories.createGameSettingsRepository();

    gameService = new GameService(
      mockGameProgressRepository,
      mockGameSettingsRepository
    );
  });

  describe('selectRoute', () => {
    it('有効なルートを選択できる', async () => {
      const mockProgress = GameProgress.createNew(TEST_CONSTANTS.DEFAULT_TEST_ID);
      mockGameProgressRepository.getOrCreate = vi.fn().mockResolvedValue(mockProgress);
      mockGameProgressRepository.save = vi.fn().mockResolvedValue(undefined);

      const result = await gameService.selectRoute(TEST_CONSTANTS.ROUTE1);

      expect(result.success).toBe(true);
      expect(mockGameProgressRepository.getOrCreate).toHaveBeenCalledOnce();
      expect(mockGameProgressRepository.save).toHaveBeenCalledWith(mockProgress);
    });

    it('無効なルートは選択できない', async () => {
      const mockProgress = GameProgress.createNew(TEST_CONSTANTS.DEFAULT_TEST_ID);
      mockGameProgressRepository.getOrCreate = vi.fn().mockResolvedValue(mockProgress);

      const result = await gameService.selectRoute(TEST_CONSTANTS.INVALID_ROUTE);

      enhancedAssertions.expectGameServiceResult(result, false, ERROR_MESSAGES.INVALID_ROUTE);
      expect(mockGameProgressRepository.save).not.toHaveBeenCalled();
    });

    it('トゥルールートは全ルートクリア後のみ選択可能', async () => {
      const mockProgress = GameProgress.createNew(TEST_CONSTANTS.DEFAULT_TEST_ID);
      mockGameProgressRepository.getOrCreate = vi.fn().mockResolvedValue(mockProgress);

      const result = await gameService.selectRoute(TEST_CONSTANTS.TRUE_ROUTE);

      enhancedAssertions.expectGameServiceResult(result, false, 'トゥルールートを解放するには、すべてのベースルート（route1, route2, route3）をクリアしてください');
      expect(mockGameProgressRepository.save).not.toHaveBeenCalled();
    });

    it('全ルートクリア後はトゥルールートを選択可能', async () => {
      const mockProgress = GameProgress.restore(
        TEST_CONSTANTS.DEFAULT_TEST_ID,
        TEST_CONSTANTS.ROUTE1,
        0,
        TEST_CONSTANTS.VALID_ROUTES,
        new Date()
      );
      mockGameProgressRepository.getOrCreate = vi.fn().mockResolvedValue(mockProgress);
      mockGameProgressRepository.save = vi.fn().mockResolvedValue(undefined);

      const result = await gameService.selectRoute(TEST_CONSTANTS.TRUE_ROUTE);

      enhancedAssertions.expectGameServiceResult(result, true);
      expect(mockGameProgressRepository.save).toHaveBeenCalledWith(mockProgress);
    });

    it('エラーが発生した場合は適切にハンドリング', async () => {
      mockGameProgressRepository.getOrCreate = vi.fn().mockRejectedValue(new Error(ERROR_MESSAGES.DATABASE_ERROR));

      const result = await gameService.selectRoute(TEST_CONSTANTS.ROUTE1);

      enhancedAssertions.expectGameServiceResult(result, false, ERROR_MESSAGES.DATABASE_ERROR);
    });
  });

  describe('advanceToNextScene', () => {
    it('次のシーンに進める', async () => {
      const mockProgress = GameProgress.createNew('test-id');
      mockProgress.selectRoute(RouteId.from(TEST_CONSTANTS.ROUTE1));
      mockGameProgressRepository.getOrCreate = vi.fn().mockResolvedValue(mockProgress);
      mockGameProgressRepository.save = vi.fn().mockResolvedValue(undefined);

      const result = await gameService.advanceToNextScene();

      expect(result.currentScene).toBe(1);
      expect(result.routeCleared).toBe(false);
      expect(mockGameProgressRepository.save).toHaveBeenCalledWith(mockProgress);
    });

    it('最終シーンでルートクリア', async () => {
      const mockProgress = GameProgress.createNew('test-id');
      mockProgress.selectRoute(RouteId.from(TEST_CONSTANTS.ROUTE1));
      // 最終シーンの手前まで進める
      loopHelpers.advanceScenes(mockProgress, TEST_CONSTANTS.BEFORE_FINAL_SCENE);
      mockGameProgressRepository.getOrCreate = vi.fn().mockResolvedValue(mockProgress);
      mockGameProgressRepository.save = vi.fn().mockResolvedValue(undefined);

      const result = await gameService.advanceToNextScene();

      enhancedAssertions.expectMultiple([
        () => expect(result.routeCleared).toBe(true),
        () => expect(result.currentScene).toBe(TEST_CONSTANTS.FINAL_SCENE_NUMBER),
        () => expect(mockGameProgressRepository.save).toHaveBeenCalledWith(mockProgress)
      ]);
    });
  });

  describe('getCurrentGameState', () => {
    it('現在のゲーム状態を取得できる', async () => {
      const mockProgress = GameProgress.restore(
        'test-id',
        TEST_CONSTANTS.ROUTE1,
        5,
        [TEST_CONSTANTS.ROUTE2],
        new Date()
      );
      mockGameProgressRepository.getOrCreate = vi.fn().mockResolvedValue(mockProgress);

      const result = await gameService.getCurrentGameState();

      expect(result.currentRoute).toBe(TEST_CONSTANTS.ROUTE1);
      expect(result.currentScene).toBe(5);
      expect(result.clearedRoutes).toEqual([TEST_CONSTANTS.ROUTE2]);
      expect(result.isTrueRouteUnlocked).toBe(false);
    });

    it('トゥルールート解放状態を正しく取得', async () => {
      const mockProgress = GameProgress.restore(
        'test-id',
        TEST_CONSTANTS.ROUTE3,
        10,
        TEST_CONSTANTS.VALID_ROUTES,
        new Date()
      );
      mockGameProgressRepository.getOrCreate = vi.fn().mockResolvedValue(mockProgress);

      const result = await gameService.getCurrentGameState();

      expect(result.isTrueRouteUnlocked).toBe(true);
    });
  });

  describe('performAutoSave', () => {
    it('オートセーブが有効な場合は保存される', async () => {
      const mockSettings = GameSettings.default();
      const mockProgress = GameProgress.createNew('test-id');
      mockGameSettingsRepository.get = vi.fn().mockResolvedValue(mockSettings);
      mockGameProgressRepository.getOrCreate = vi.fn().mockResolvedValue(mockProgress);
      mockGameProgressRepository.save = vi.fn().mockResolvedValue(undefined);

      await gameService.performAutoSave();

      enhancedAssertions.expectRepositoryMockCalls(mockGameSettingsRepository, [
        { method: 'get', times: 1 }
      ]);
      enhancedAssertions.expectRepositoryMockCalls(mockGameProgressRepository, [
        { method: 'getOrCreate', times: 1 },
        { method: 'save', times: 1 }
      ]);
    });

    it('オートセーブが無効な場合は保存されない', async () => {
      const mockSettings = GameSettings.default().withAutoSave(false);
      mockGameSettingsRepository.get = vi.fn().mockResolvedValue(mockSettings);

      await gameService.performAutoSave();

      enhancedAssertions.expectRepositoryMockCalls(mockGameSettingsRepository, [
        { method: 'get', times: 1 }
      ]);
      enhancedAssertions.expectRepositoryMockCalls(mockGameProgressRepository, [
        { method: 'getOrCreate', times: 0 },
        { method: 'save', times: 0 }
      ]);
    });
  });

  describe('updateGameSettings', () => {
    it('音量設定を更新できる', async () => {
      const mockSettings = GameSettings.default();
      const updatedSettings = mockSettings.withVolume(0.5);
      mockGameSettingsRepository.get = vi.fn().mockResolvedValue(mockSettings);
      mockGameSettingsRepository.save = vi.fn().mockResolvedValue(undefined);

      await gameService.updateGameSettings(0.5);

      expect(mockGameSettingsRepository.get).toHaveBeenCalledOnce();
      expect(mockGameSettingsRepository.save).toHaveBeenCalledWith(updatedSettings);
    });

    it('テキスト速度を更新できる', async () => {
      const mockSettings = GameSettings.default();
      const updatedSettings = mockSettings.withTextSpeed(2.0);
      mockGameSettingsRepository.get = vi.fn().mockResolvedValue(mockSettings);
      mockGameSettingsRepository.save = vi.fn().mockResolvedValue(undefined);

      await gameService.updateGameSettings(undefined, 2.0);

      expect(mockGameSettingsRepository.save).toHaveBeenCalledWith(updatedSettings);
    });

    it('オートセーブ設定を更新できる', async () => {
      const mockSettings = GameSettings.default();
      const updatedSettings = mockSettings.withAutoSave(false);
      mockGameSettingsRepository.get = vi.fn().mockResolvedValue(mockSettings);
      mockGameSettingsRepository.save = vi.fn().mockResolvedValue(undefined);

      await gameService.updateGameSettings(undefined, undefined, false);

      expect(mockGameSettingsRepository.save).toHaveBeenCalledWith(updatedSettings);
    });

    it('複数の設定を同時に更新できる', async () => {
      const mockSettings = GameSettings.default();
      const updatedSettings = mockSettings
        .withVolume(0.3)
        .withTextSpeed(1.5)
        .withAutoSave(false);
      mockGameSettingsRepository.get = vi.fn().mockResolvedValue(mockSettings);
      mockGameSettingsRepository.save = vi.fn().mockResolvedValue(undefined);

      await gameService.updateGameSettings(0.3, 1.5, false);

      expect(mockGameSettingsRepository.save).toHaveBeenCalledWith(updatedSettings);
    });
  });

  describe('getGameSettings', () => {
    it('ゲーム設定を取得できる', async () => {
      const mockSettings = new GameSettings(0.6, 1.2, false);
      mockGameSettingsRepository.get = vi.fn().mockResolvedValue(mockSettings);

      const result = await gameService.getGameSettings();

      expect(result.volume).toBe(0.6);
      expect(result.textSpeed).toBe(1.2);
      expect(result.autoSave).toBe(false);
      expect(mockGameSettingsRepository.get).toHaveBeenCalledOnce();
    });
  });
});