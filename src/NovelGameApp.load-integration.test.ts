import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NovelGameApp } from './NovelGameApp';

// Canvas要素のモック
Object.defineProperty(global, 'HTMLCanvasElement', {
  value: class HTMLCanvasElement {
    getContext() {
      return {
        font: '',
        fillStyle: '',
        clearRect: vi.fn(),
        fillRect: vi.fn(),
        fillText: vi.fn(),
        measureText: () => ({ width: 100 }),
      };
    }
  },
});

// DOM要素のモック
Object.defineProperty(global.document, 'querySelector', {
  value: vi.fn(() => ({
    width: 800,
    height: 600,
    addEventListener: vi.fn(),
    getContext: () => ({
      font: '',
      fillStyle: '',
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      fillText: vi.fn(),
      measureText: () => ({ width: 100 }),
    }),
  })),
});

Object.defineProperty(global.document, 'addEventListener', {
  value: vi.fn(),
});

describe('NovelGameApp - ロード機能統合テスト', () => {
  let app: NovelGameApp;

  beforeEach(() => {
    // DOM環境をモック
    vi.clearAllMocks();
    app = new NovelGameApp();
  });

  describe('ロードボタンの動作', () => {
    it('ロードボタンクリック時にセーブデータ一覧を表示する', async () => {
      // Arrange
      const showSaveDataListSpy = vi.spyOn(app as any, 'showSaveDataList');

      // Act - ロードボタンをクリック
      await (app as any).selectMenuOption('load');

      // Assert - セーブデータ一覧表示メソッドが呼ばれることを確認
      expect(showSaveDataListSpy).toHaveBeenCalledOnce();
    });

    it('セーブデータ一覧表示でゲーム状態がload_listに変更される', async () => {
      // Act
      await (app as any).selectMenuOption('load');

      // Assert
      expect((app as any).gameState).toBe('load_list');
    });

    it('セーブデータが選択された時に該当データをロードする', async () => {
      // Arrange
      const testSaveId = 'test-save-123';
      const loadSaveDataSpy = vi.spyOn(app as any, 'loadSelectedSaveData');

      // Act
      await (app as any).onSaveDataSelected(testSaveId);

      // Assert
      expect(loadSaveDataSpy).toHaveBeenCalledWith(testSaveId);
    });

    it('セーブデータ選択をキャンセルした時にメニューに戻る', async () => {
      // Arrange
      const showMainMenuSpy = vi.spyOn(app as any, 'showMainMenu');

      // Act
      (app as any).onSaveDataSelectionCancelled();

      // Assert
      expect(showMainMenuSpy).toHaveBeenCalledOnce();
      expect((app as any).gameState).toBe('menu');
    });
  });

  describe('エラーハンドリング', () => {
    it('セーブデータ読み込みエラー時に適切なエラーメッセージを表示', async () => {
      // Arrange
      const showMessageSpy = vi.spyOn(app as any, 'showMessage');

      // セーブデータリストサービスでエラーが発生する状況をモック
      const mockError = new Error('Database error');
      const mockService = (app as any).saveDataListService;
      vi.spyOn(mockService, 'getSaveDataList').mockRejectedValue(mockError);

      // Act
      await (app as any).selectMenuOption('load');

      // Assert
      expect(showMessageSpy).toHaveBeenCalledWith(
        expect.stringContaining('セーブデータの読み込みに失敗')
      );
    });
  });

  describe('UI状態管理', () => {
    it('load_list状態でESCキー押下時にメニューに戻る', () => {
      // Arrange
      (app as any).gameState = 'load_list';
      const showMainMenuSpy = vi.spyOn(app as any, 'showMainMenu');

      // Act
      const escapeKeyEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      (app as any).handleKeyDown(escapeKeyEvent);

      // Assert
      expect(showMainMenuSpy).toHaveBeenCalledOnce();
      expect((app as any).gameState).toBe('menu');
    });
  });
});