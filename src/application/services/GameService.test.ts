import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameService } from './GameService';
import { GameProgress } from '../../domain/entities/GameProgress';
import type { GameProgressRepository } from '../../domain/repositories/GameProgressRepository';
import type { GameSettingsRepository } from '../../domain/repositories/GameSettingsRepository';
import { RouteId } from '../../domain/value-objects/RouteId';
import { GameSettings } from '../../domain/value-objects/GameSettings';

describe('GameService', () => {
  let gameService: GameService;
  let mockGameProgressRepository: GameProgressRepository;
  let mockGameSettingsRepository: GameSettingsRepository;

  beforeEach(() => {
    // GameProgressRepositoryのモック
    mockGameProgressRepository = {
      getOrCreate: vi.fn(),
      save: vi.fn(),
      findById: vi.fn(),
      delete: vi.fn(),
    };

    // GameSettingsRepositoryのモック
    mockGameSettingsRepository = {
      get: vi.fn(),
      save: vi.fn(),
      initializeDefault: vi.fn(),
    };

    gameService = new GameService(
      mockGameProgressRepository,
      mockGameSettingsRepository
    );
  });

  describe('selectRoute', () => {
    it('有効なルートを選択できる', async () => {
      const mockProgress = GameProgress.createNew('test-id');
      mockGameProgressRepository.getOrCreate = vi.fn().mockResolvedValue(mockProgress);
      mockGameProgressRepository.save = vi.fn().mockResolvedValue(undefined);

      const result = await gameService.selectRoute('route1');

      expect(result.success).toBe(true);
      expect(mockGameProgressRepository.getOrCreate).toHaveBeenCalledOnce();
      expect(mockGameProgressRepository.save).toHaveBeenCalledWith(mockProgress);
    });

    it('無効なルートは選択できない', async () => {
      const mockProgress = GameProgress.createNew('test-id');
      mockGameProgressRepository.getOrCreate = vi.fn().mockResolvedValue(mockProgress);

      const result = await gameService.selectRoute('invalid-route');

      expect(result.success).toBe(false);
      expect(result.message).toBe('無効なルートです');
      expect(mockGameProgressRepository.save).not.toHaveBeenCalled();
    });

    it('トゥルールートは全ルートクリア後のみ選択可能', async () => {
      const mockProgress = GameProgress.createNew('test-id');
      mockGameProgressRepository.getOrCreate = vi.fn().mockResolvedValue(mockProgress);

      const result = await gameService.selectRoute('trueRoute');

      expect(result.success).toBe(false);
      expect(result.message).toBe('トゥルールートを解放するには、すべてのベースルート（route1, route2, route3）をクリアしてください');
      expect(mockGameProgressRepository.save).not.toHaveBeenCalled();
    });

    it('全ルートクリア後はトゥルールートを選択可能', async () => {
      const mockProgress = GameProgress.restore(
        'test-id',
        'route1',
        0,
        ['route1', 'route2', 'route3'],
        new Date()
      );
      mockGameProgressRepository.getOrCreate = vi.fn().mockResolvedValue(mockProgress);
      mockGameProgressRepository.save = vi.fn().mockResolvedValue(undefined);

      const result = await gameService.selectRoute('trueRoute');

      expect(result.success).toBe(true);
      expect(mockGameProgressRepository.save).toHaveBeenCalledWith(mockProgress);
    });

    it('エラーが発生した場合は適切にハンドリング', async () => {
      mockGameProgressRepository.getOrCreate = vi.fn().mockRejectedValue(new Error('Database error'));

      const result = await gameService.selectRoute('route1');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Database error');
    });
  });

  describe('advanceToNextScene', () => {
    it('次のシーンに進める', async () => {
      const mockProgress = GameProgress.createNew('test-id');
      mockProgress.selectRoute(RouteId.from('route1'));
      mockGameProgressRepository.getOrCreate = vi.fn().mockResolvedValue(mockProgress);
      mockGameProgressRepository.save = vi.fn().mockResolvedValue(undefined);

      const result = await gameService.advanceToNextScene();

      expect(result.currentScene).toBe(1);
      expect(result.routeCleared).toBe(false);
      expect(mockGameProgressRepository.save).toHaveBeenCalledWith(mockProgress);
    });

    it('最終シーンでルートクリア', async () => {
      const mockProgress = GameProgress.createNew('test-id');
      mockProgress.selectRoute(RouteId.from('route1'));
      // 最終シーンの手前まで進める
      for (let i = 0; i < 99; i++) {
        mockProgress.advanceToNextScene();
      }
      mockGameProgressRepository.getOrCreate = vi.fn().mockResolvedValue(mockProgress);
      mockGameProgressRepository.save = vi.fn().mockResolvedValue(undefined);

      const result = await gameService.advanceToNextScene();

      expect(result.routeCleared).toBe(true);
      expect(result.currentScene).toBe(100);
      expect(mockGameProgressRepository.save).toHaveBeenCalledWith(mockProgress);
    });
  });

  describe('getCurrentGameState', () => {
    it('現在のゲーム状態を取得できる', async () => {
      const mockProgress = GameProgress.restore(
        'test-id',
        'route1',
        5,
        ['route2'],
        new Date()
      );
      mockGameProgressRepository.getOrCreate = vi.fn().mockResolvedValue(mockProgress);

      const result = await gameService.getCurrentGameState();

      expect(result.currentRoute).toBe('route1');
      expect(result.currentScene).toBe(5);
      expect(result.clearedRoutes).toEqual(['route2']);
      expect(result.isTrueRouteUnlocked).toBe(false);
    });

    it('トゥルールート解放状態を正しく取得', async () => {
      const mockProgress = GameProgress.restore(
        'test-id',
        'route3',
        10,
        ['route1', 'route2', 'route3'],
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

      expect(mockGameSettingsRepository.get).toHaveBeenCalledOnce();
      expect(mockGameProgressRepository.getOrCreate).toHaveBeenCalledOnce();
      expect(mockGameProgressRepository.save).toHaveBeenCalledWith(mockProgress);
    });

    it('オートセーブが無効な場合は保存されない', async () => {
      const mockSettings = GameSettings.default().withAutoSave(false);
      mockGameSettingsRepository.get = vi.fn().mockResolvedValue(mockSettings);

      await gameService.performAutoSave();

      expect(mockGameSettingsRepository.get).toHaveBeenCalledOnce();
      expect(mockGameProgressRepository.getOrCreate).not.toHaveBeenCalled();
      expect(mockGameProgressRepository.save).not.toHaveBeenCalled();
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