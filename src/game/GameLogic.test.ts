import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameLogic } from './GameLogic';
import { SaveDataDB } from '../storage/SaveData';

// モックの作成
vi.mock('../storage/SaveData', () => ({
  SaveDataDB: vi.fn().mockImplementation(() => ({
    getOrCreateSaveData: vi.fn(),
    updateSaveData: vi.fn(),
    getSettings: vi.fn(),
  })),
}));

describe('GameLogic', () => {
  let gameLogic: GameLogic;
  let mockDB: any;

  beforeEach(() => {
    mockDB = {
      getOrCreateSaveData: vi.fn(),
      updateSaveData: vi.fn(),
      getSettings: vi.fn(),
    };

    (SaveDataDB as any).mockImplementation(() => mockDB);
    gameLogic = new GameLogic();
  });

  describe('初期化', () => {
    it('ゲームロジックが正しく初期化される', () => {
      expect(gameLogic).toBeDefined();
      expect(gameLogic.availableRoutes).toEqual(['route1', 'route2', 'route3']);
      expect(gameLogic.currentRoute).toBe('');
      expect(gameLogic.currentScene).toBe(0);
    });
  });

  describe('ルート選択', () => {
    it('利用可能なルートを選択できる', async () => {
      mockDB.getOrCreateSaveData.mockResolvedValue({
        currentRoute: '',
        currentScene: 0,
        clearedRoutes: [],
        isTrueRouteUnlocked: false,
      });

      const result = await gameLogic.selectRoute('route1');

      expect(result).toBe(true);
      expect(gameLogic.currentRoute).toBe('route1');
      expect(gameLogic.currentScene).toBe(0);
      expect(mockDB.updateSaveData).toHaveBeenCalledWith({
        currentRoute: 'route1',
        currentScene: 0,
      });
    });

    it('存在しないルートは選択できない', async () => {
      mockDB.getOrCreateSaveData.mockResolvedValue({
        currentRoute: '',
        currentScene: 0,
        clearedRoutes: [],
        isTrueRouteUnlocked: false,
      });

      const result = await gameLogic.selectRoute('invalidRoute');

      expect(result).toBe(false);
      expect(gameLogic.currentRoute).toBe('');
    });

    it('トゥルールートは3つのルートクリア後にのみ選択可能', async () => {
      mockDB.getOrCreateSaveData.mockResolvedValue({
        currentRoute: '',
        currentScene: 0,
        clearedRoutes: ['route1', 'route2', 'route3'],
        isTrueRouteUnlocked: false,
      });

      const result = await gameLogic.selectRoute('trueRoute');

      expect(result).toBe(true);
      expect(gameLogic.currentRoute).toBe('trueRoute');
    });

    it('3つのルートクリア前はトゥルールートが選択不可', async () => {
      mockDB.getOrCreateSaveData.mockResolvedValue({
        currentRoute: '',
        currentScene: 0,
        clearedRoutes: ['route1'],
        isTrueRouteUnlocked: false,
      });

      const result = await gameLogic.selectRoute('trueRoute');

      expect(result).toBe(false);
    });
  });

  describe('シーン進行', () => {
    it('次のシーンに進める', async () => {
      gameLogic.currentRoute = 'route1';
      gameLogic.currentScene = 5;

      await gameLogic.nextScene();

      expect(gameLogic.currentScene).toBe(6);
      expect(mockDB.updateSaveData).toHaveBeenCalledWith({
        currentRoute: 'route1',
        currentScene: 6,
      });
    });

    it('ルートの最終シーンでクリア処理が実行される', async () => {
      gameLogic.currentRoute = 'route1';
      gameLogic.currentScene = 99; // 最終シーン想定

      mockDB.getOrCreateSaveData.mockResolvedValue({
        currentRoute: 'route1',
        currentScene: 99,
        clearedRoutes: [],
        isTrueRouteUnlocked: false,
      });

      const isCleared = await gameLogic.nextScene();

      expect(isCleared).toBe(true);
      expect(mockDB.updateSaveData).toHaveBeenCalledWith({
        clearedRoutes: ['route1'],
      });
    });
  });

  describe('オートセーブ', () => {
    it('オートセーブが有効な場合に自動保存される', async () => {
      mockDB.getSettings.mockResolvedValue({
        autoSave: true,
      });

      await gameLogic.autoSave();

      expect(mockDB.updateSaveData).toHaveBeenCalledWith({
        currentRoute: gameLogic.currentRoute,
        currentScene: gameLogic.currentScene,
      });
    });

    it('オートセーブが無効な場合は保存されない', async () => {
      mockDB.getSettings.mockResolvedValue({
        autoSave: false,
      });

      await gameLogic.autoSave();

      expect(mockDB.updateSaveData).not.toHaveBeenCalled();
    });
  });

  describe('ゲーム状態の読み込み', () => {
    it('既存のセーブデータから状態を復元できる', async () => {
      mockDB.getOrCreateSaveData.mockResolvedValue({
        currentRoute: 'route2',
        currentScene: 10,
        clearedRoutes: ['route1'],
        isTrueRouteUnlocked: false,
      });

      await gameLogic.loadGameState();

      expect(gameLogic.currentRoute).toBe('route2');
      expect(gameLogic.currentScene).toBe(10);
    });
  });
});
