import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameService } from './GameService';
import { GameProgress } from '../../domain/entities/GameProgress';
import type { GameProgressRepository } from '../../domain/repositories/GameProgressRepository';
import type { GameSettingsRepository } from '../../domain/repositories/GameSettingsRepository';
import { GameSettings } from '../../domain/value-objects/GameSettings';
import { TEST_CONSTANTS, mockRepositories, ERROR_MESSAGES, enhancedAssertions, asyncTestHelpers } from '../../test/utils/testHelpers';

describe('GameService エッジケース', () => {
  let gameService: GameService;
  let mockGameProgressRepository: GameProgressRepository;
  let mockGameSettingsRepository: GameSettingsRepository;

  beforeEach(() => {
    mockGameProgressRepository = mockRepositories.createGameProgressRepository();
    mockGameSettingsRepository = mockRepositories.createGameSettingsRepository();
    gameService = new GameService(mockGameProgressRepository, mockGameSettingsRepository);
  });

  describe('複合エラーシナリオ', () => {
    it('リポジトリ保存失敗時の状態一貫性', async () => {
      const mockProgress = GameProgress.createNew(TEST_CONSTANTS.DEFAULT_TEST_ID);
      mockGameProgressRepository.getOrCreate = vi.fn().mockResolvedValue(mockProgress);
      mockGameProgressRepository.save = vi.fn().mockRejectedValue(new Error('保存失敗'));

      const result = await gameService.selectRoute(TEST_CONSTANTS.ROUTE1);

      enhancedAssertions.expectGameServiceResult(result, false, '保存失敗');
      // getOrCreateは呼ばれたが、saveは失敗
      expect(mockGameProgressRepository.getOrCreate).toHaveBeenCalledOnce();
      expect(mockGameProgressRepository.save).toHaveBeenCalledOnce();
    });

    it('getOrCreate失敗後のadvanceToNextScene', async () => {
      mockGameProgressRepository.getOrCreate = vi.fn().mockRejectedValue(new Error('データベース接続エラー'));

      await expect(gameService.advanceToNextScene()).rejects.toThrow('データベース接続エラー');
    });

    it('設定取得失敗時のperformAutoSave', async () => {
      mockGameSettingsRepository.get = vi.fn().mockRejectedValue(new Error('設定読み込みエラー'));

      await expect(gameService.performAutoSave()).rejects.toThrow('設定読み込みエラー');
      expect(mockGameProgressRepository.getOrCreate).not.toHaveBeenCalled();
    });

    it('設定更新中のエラー処理', async () => {
      const mockSettings = GameSettings.default();
      mockGameSettingsRepository.get = vi.fn().mockResolvedValue(mockSettings);
      mockGameSettingsRepository.save = vi.fn().mockRejectedValue(new Error('設定保存エラー'));

      await expect(gameService.updateGameSettings(0.8)).rejects.toThrow('設定保存エラー');
      expect(mockGameSettingsRepository.get).toHaveBeenCalledOnce();
      expect(mockGameSettingsRepository.save).toHaveBeenCalledOnce();
    });
  });

  describe('非同期処理の競合状態', () => {
    it('同時実行されるselectRouteの競合', async () => {
      const mockProgress = GameProgress.createNew(TEST_CONSTANTS.DEFAULT_TEST_ID);
      mockGameProgressRepository.getOrCreate = vi.fn().mockResolvedValue(mockProgress);
      mockGameProgressRepository.save = vi.fn().mockResolvedValue(undefined);

      // 同時に複数のルート選択を実行
      const promises = [
        gameService.selectRoute(TEST_CONSTANTS.ROUTE1),
        gameService.selectRoute(TEST_CONSTANTS.ROUTE2),
        gameService.selectRoute(TEST_CONSTANTS.ROUTE3)
      ];

      const results = await Promise.all(promises);

      // 全て成功する
      results.forEach(result => {
        expect(result.success).toBe(true);
      });

      // リポジトリメソッドが3回ずつ呼ばれる
      expect(mockGameProgressRepository.getOrCreate).toHaveBeenCalledTimes(3);
      expect(mockGameProgressRepository.save).toHaveBeenCalledTimes(3);
    });

    it('selectRouteとadvanceToNextSceneの同時実行', async () => {
      const mockProgress = GameProgress.createNew(TEST_CONSTANTS.DEFAULT_TEST_ID);
      mockProgress.selectRoute(TEST_CONSTANTS.ROUTE1);
      mockGameProgressRepository.getOrCreate = vi.fn().mockResolvedValue(mockProgress);
      mockGameProgressRepository.save = vi.fn().mockResolvedValue(undefined);

      // 同時実行
      const [selectResult, advanceResult] = await Promise.all([
        gameService.selectRoute(TEST_CONSTANTS.ROUTE2),
        gameService.advanceToNextScene()
      ]);

      expect(selectResult.success).toBe(true);
      expect(advanceResult.currentScene).toBeGreaterThan(0);
    });

    it('部分的な失敗を伴う同時実行', async () => {
      const mockProgress = GameProgress.createNew(TEST_CONSTANTS.DEFAULT_TEST_ID);
      mockGameProgressRepository.getOrCreate = vi.fn().mockResolvedValue(mockProgress);
      mockGameProgressRepository.save = vi.fn()
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new Error('2回目失敗'))
        .mockResolvedValueOnce(undefined);

      const promises = [
        gameService.selectRoute(TEST_CONSTANTS.ROUTE1),
        gameService.selectRoute(TEST_CONSTANTS.ROUTE2),
        gameService.selectRoute(TEST_CONSTANTS.ROUTE3)
      ];

      const results = await Promise.allSettled(promises);

      expect(results[0].status).toBe('fulfilled');
      expect(results[1].status).toBe('fulfilled'); // ビジネスロジックエラーでも fulfilled
      expect(results[2].status).toBe('fulfilled');

      // 2回目は失敗
      if (results[1].status === 'fulfilled') {
        expect(results[1].value.success).toBe(false);
      }
    });
  });

  describe('タイムアウト処理', () => {
    it('長時間実行処理のタイムアウト', async () => {
      // 5秒後に解決されるPromiseを作成
      const slowPromise = new Promise((resolve) => {
        setTimeout(() => resolve(GameProgress.createNew(TEST_CONSTANTS.DEFAULT_TEST_ID)), 5000);
      });
      
      mockGameProgressRepository.getOrCreate = vi.fn().mockReturnValue(slowPromise);

      const start = performance.now();
      
      // タイムアウト付きでルート選択を実行
      const timeoutPromise = Promise.race([
        gameService.selectRoute(TEST_CONSTANTS.ROUTE1),
        new Promise<{ success: boolean; message: string }>((_, reject) => {
          setTimeout(() => reject(new Error('タイムアウト')), 1000);
        })
      ]);

      await expect(timeoutPromise).rejects.toThrow('タイムアウト');
      
      const end = performance.now();
      expect(end - start).toBeLessThan(1500); // 1.5秒以内
    });
  });

  describe('リトライ機構', () => {
    it('一時的な失敗後の成功', async () => {
      const mockProgress = GameProgress.createNew(TEST_CONSTANTS.DEFAULT_TEST_ID);
      
      // 1回目は失敗、2回目は成功
      mockGameProgressRepository.getOrCreate = vi.fn()
        .mockRejectedValueOnce(new Error('一時的エラー'))
        .mockResolvedValueOnce(mockProgress);
      
      mockGameProgressRepository.save = vi.fn().mockResolvedValue(undefined);

      // 手動でリトライ
      let result = await gameService.selectRoute(TEST_CONSTANTS.ROUTE1);
      expect(result.success).toBe(false);

      result = await gameService.selectRoute(TEST_CONSTANTS.ROUTE1);
      expect(result.success).toBe(true);

      expect(mockGameProgressRepository.getOrCreate).toHaveBeenCalledTimes(2);
    });
  });

  describe('メモリ使用量とパフォーマンス', () => {
    it('大量のルート選択操作', async () => {
      const mockProgress = GameProgress.createNew(TEST_CONSTANTS.DEFAULT_TEST_ID);
      mockGameProgressRepository.getOrCreate = vi.fn().mockResolvedValue(mockProgress);
      mockGameProgressRepository.save = vi.fn().mockResolvedValue(undefined);

      const start = performance.now();
      
      // 100回のルート選択
      const promises = [];
      for (let i = 0; i < 100; i++) {
        promises.push(gameService.selectRoute(TEST_CONSTANTS.ROUTE1));
      }
      
      const results = await Promise.all(promises);
      
      const end = performance.now();
      const duration = end - start;

      // 全て成功
      results.forEach(result => {
        expect(result.success).toBe(true);
      });

      // パフォーマンスが許容範囲内
      expect(duration).toBeLessThan(1000); // 1秒以内
      expect(mockGameProgressRepository.getOrCreate).toHaveBeenCalledTimes(100);
      expect(mockGameProgressRepository.save).toHaveBeenCalledTimes(100);
    });

    it('頻繁なオートセーブ操作', async () => {
      const mockSettings = GameSettings.default();
      const mockProgress = GameProgress.createNew(TEST_CONSTANTS.DEFAULT_TEST_ID);
      
      mockGameSettingsRepository.get = vi.fn().mockResolvedValue(mockSettings);
      mockGameProgressRepository.getOrCreate = vi.fn().mockResolvedValue(mockProgress);
      mockGameProgressRepository.save = vi.fn().mockResolvedValue(undefined);

      const start = performance.now();
      
      // 50回のオートセーブ
      const promises = [];
      for (let i = 0; i < 50; i++) {
        promises.push(gameService.performAutoSave());
      }
      
      await Promise.all(promises);
      
      const end = performance.now();
      const duration = end - start;

      // パフォーマンスが許容範囲内
      expect(duration).toBeLessThan(500); // 0.5秒以内
      expect(mockGameSettingsRepository.get).toHaveBeenCalledTimes(50);
      expect(mockGameProgressRepository.save).toHaveBeenCalledTimes(50);
    });
  });

  describe('データ整合性', () => {
    it('複数の設定変更の原子性', async () => {
      const mockSettings = GameSettings.default();
      mockGameSettingsRepository.get = vi.fn().mockResolvedValue(mockSettings);
      mockGameSettingsRepository.save = vi.fn().mockRejectedValue(new Error('保存失敗'));

      // 複数の設定を同時に変更
      await expect(gameService.updateGameSettings(0.8, 2.0, false)).rejects.toThrow('保存失敗');
      
      // 原子性が保たれている（全て失敗）
      expect(mockGameSettingsRepository.get).toHaveBeenCalledOnce();
      expect(mockGameSettingsRepository.save).toHaveBeenCalledOnce();
    });

    it('進行状況とルート選択の一貫性', async () => {
      const mockProgress = GameProgress.createNew(TEST_CONSTANTS.DEFAULT_TEST_ID);
      mockGameProgressRepository.getOrCreate = vi.fn().mockResolvedValue(mockProgress);
      mockGameProgressRepository.save = vi.fn().mockResolvedValue(undefined);

      // ルート選択
      const selectResult = await gameService.selectRoute(TEST_CONSTANTS.ROUTE1);
      expect(selectResult.success).toBe(true);

      // 進行状況確認
      const stateResult = await gameService.getCurrentGameState();
      expect(stateResult.currentRoute).toBe(TEST_CONSTANTS.ROUTE1);
      expect(stateResult.currentScene).toBe(0);
    });
  });

  describe('エラーメッセージの一貫性', () => {
    it('様々なエラーシナリオでの適切なメッセージ', async () => {
      // データベースエラー
      mockGameProgressRepository.getOrCreate = vi.fn().mockRejectedValue(new Error(ERROR_MESSAGES.DATABASE_ERROR));
      
      const result1 = await gameService.selectRoute(TEST_CONSTANTS.ROUTE1);
      enhancedAssertions.expectGameServiceResult(result1, false, ERROR_MESSAGES.DATABASE_ERROR);

      // 無効なルート
      mockGameProgressRepository.getOrCreate = vi.fn().mockResolvedValue(GameProgress.createNew(TEST_CONSTANTS.DEFAULT_TEST_ID));
      
      const result2 = await gameService.selectRoute(TEST_CONSTANTS.INVALID_ROUTE);
      enhancedAssertions.expectGameServiceResult(result2, false, ERROR_MESSAGES.INVALID_ROUTE);
    });

    it('非同期エラーの適切な伝播', async () => {
      const customError = new Error('カスタムエラー');
      mockGameProgressRepository.getOrCreate = vi.fn().mockRejectedValue(customError);

      await asyncTestHelpers.expectAsyncFailure(
        () => gameService.selectRoute(TEST_CONSTANTS.ROUTE1),
        'カスタムエラー'
      );
    });
  });
});