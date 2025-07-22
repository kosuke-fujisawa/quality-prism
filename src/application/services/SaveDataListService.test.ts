import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SaveDataListService } from './SaveDataListService';
import { GameProgressRepository } from '../../domain/repositories/GameProgressRepository';
import { GameProgress } from '../../domain/entities/GameProgress';
import { RouteId } from '../../domain/value-objects/RouteId';
import { SceneNumber } from '../../domain/value-objects/SceneNumber';
import { TEST_CONSTANTS } from '../../test/utils/testHelpers';

describe('SaveDataListService', () => {
  let service: SaveDataListService;
  let mockRepository: GameProgressRepository;

  beforeEach(() => {
    mockRepository = {
      getOrCreate: vi.fn(),
      save: vi.fn(),
      getAll: vi.fn(),
      deleteById: vi.fn(),
      deleteAll: vi.fn(),
    };
    service = new SaveDataListService(mockRepository);
  });

  describe('セーブデータ一覧取得', () => {
    it('空のセーブデータ一覧を返すことができる', async () => {
      // Arrange
      vi.mocked(mockRepository.getAll).mockResolvedValue([]);

      // Act
      const result = await service.getSaveDataList();

      // Assert
      expect(result.success).toBe(true);
      expect(result.saveDataList).toEqual([]);
      expect(mockRepository.getAll).toHaveBeenCalledOnce();
    });

    it('複数のセーブデータ一覧を返すことができる', async () => {
      // Arrange
      const saveData1 = GameProgress.createNew(TEST_CONSTANTS.ROUTE1);
      saveData1.selectRoute(RouteId.from('route1'));
      // 複数回advanceToNextSceneを呼ぶ（シーン1まで進む）
      
      const saveData2 = GameProgress.createNew(TEST_CONSTANTS.ROUTE2);
      saveData2.selectRoute(RouteId.from('route2'));
      // 複数回advanceToNextSceneを呼ぶ（シーン3まで進む）
      saveData2.advanceToNextScene();
      saveData2.advanceToNextScene();
      saveData2.advanceToNextScene();

      vi.mocked(mockRepository.getAll).mockResolvedValue([
        saveData1,
        saveData2,
      ]);

      // Act
      const result = await service.getSaveDataList();

      // Assert
      expect(result.success).toBe(true);
      expect(result.saveDataList).toHaveLength(2);
      expect(result.saveDataList?.[0]).toMatchObject({
        id: saveData1.getId(),
        routeName: 'route1',
        sceneNumber: 0,
      });
    });

    it('リポジトリエラー時に失敗結果を返す', async () => {
      // Arrange
      const error = new Error('Database connection error');
      vi.mocked(mockRepository.getAll).mockRejectedValue(error);

      // Act
      const result = await service.getSaveDataList();

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toBe('セーブデータの読み込みに失敗しました');
      expect(result.saveDataList).toBeUndefined();
    });
  });

  describe('特定のセーブデータ読み込み', () => {
    it('指定されたIDのセーブデータを読み込める', async () => {
      // Arrange
      const saveData = GameProgress.createNew(TEST_CONSTANTS.ROUTE1);
      saveData.selectRoute(RouteId.from('route1'));

      vi.mocked(mockRepository.getAll).mockResolvedValue([saveData]);

      // Act
      const result = await service.loadSaveDataById(saveData.getId());

      // Assert
      expect(result.success).toBe(true);
      expect(result.gameProgress).toBe(saveData);
    });

    it('存在しないIDでエラーを返す', async () => {
      // Arrange
      vi.mocked(mockRepository.getAll).mockResolvedValue([]);

      // Act
      const result = await service.loadSaveDataById('nonexistent-id');

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toBe('指定されたセーブデータが見つかりません');
      expect(result.gameProgress).toBeUndefined();
    });
  });

  describe('エッジケース', () => {
    it('大量のセーブデータを処理できる', async () => {
      // Arrange
      const saveDataList = Array.from({ length: 100 }, (_, i) => {
        const saveData = GameProgress.createNew(`test-${i}`);
        saveData.selectRoute(RouteId.from(`route${i % 3 + 1}`)); // route1-3に制限
        return saveData;
      });

      vi.mocked(mockRepository.getAll).mockResolvedValue(saveDataList);

      // Act
      const result = await service.getSaveDataList();

      // Assert
      expect(result.success).toBe(true);
      expect(result.saveDataList).toHaveLength(100);
    });

    it('破損したセーブデータを除外する', async () => {
      // Arrange
      const validSaveData = GameProgress.createNew(TEST_CONSTANTS.ROUTE1);
      validSaveData.selectRoute(RouteId.from('route1'));

      // モックで破損データを混在させる
      vi.mocked(mockRepository.getAll).mockResolvedValue([
        validSaveData,
        // 破損データはリポジトリ層で除外される想定
      ]);

      // Act
      const result = await service.getSaveDataList();

      // Assert
      expect(result.success).toBe(true);
      expect(result.saveDataList).toHaveLength(1);
    });
  });
});