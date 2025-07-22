import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SaveDataListView } from './SaveDataListView';
import { SaveDataListService, SaveDataSummary } from '../application/services/SaveDataListService';

describe('SaveDataListView', () => {
  let view: SaveDataListView;
  let mockService: SaveDataListService;
  let mockOnSelectCallback: vi.MockedFunction<(id: string) => void>;
  let mockOnCancelCallback: vi.MockedFunction<() => void>;

  beforeEach(() => {
    mockService = {
      getSaveDataList: vi.fn(),
      loadSaveDataById: vi.fn(),
    } as unknown as SaveDataListService;

    mockOnSelectCallback = vi.fn();
    mockOnCancelCallback = vi.fn();

    view = new SaveDataListView(
      mockService,
      mockOnSelectCallback,
      mockOnCancelCallback
    );
  });

  describe('セーブデータ一覧表示', () => {
    it('空のセーブデータ一覧を表示できる', async () => {
      // Arrange
      vi.mocked(mockService.getSaveDataList).mockResolvedValue({
        success: true,
        saveDataList: [],
      });

      // Act
      const result = await view.show();

      // Assert
      expect(result.success).toBe(true);
      expect(mockService.getSaveDataList).toHaveBeenCalledOnce();
    });

    it('セーブデータ一覧を表示できる', async () => {
      // Arrange
      const mockSaveDataList: SaveDataSummary[] = [
        {
          id: 'save1',
          routeName: 'route1',
          sceneNumber: 5,
          lastUpdated: new Date('2025-01-01'),
        },
        {
          id: 'save2', 
          routeName: 'route2',
          sceneNumber: 10,
          lastUpdated: new Date('2025-01-02'),
        },
      ];

      vi.mocked(mockService.getSaveDataList).mockResolvedValue({
        success: true,
        saveDataList: mockSaveDataList,
      });

      // Act
      const result = await view.show();

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toContain('2件のセーブデータ');
    });

    it('セーブデータ読み込みエラー時はエラーメッセージを表示', async () => {
      // Arrange
      vi.mocked(mockService.getSaveDataList).mockResolvedValue({
        success: false,
        message: 'データベースエラー',
      });

      // Act
      const result = await view.show();

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toBe('データベースエラー');
    });
  });

  describe('セーブデータ選択', () => {
    it('セーブデータを選択できる', async () => {
      // Arrange
      const saveId = 'save1';

      // Act
      await view.selectSaveData(saveId);

      // Assert  
      expect(mockOnSelectCallback).toHaveBeenCalledWith(saveId);
    });

    it('キャンセル時はコールバックが呼ばれる', () => {
      // Act
      view.cancel();

      // Assert
      expect(mockOnCancelCallback).toHaveBeenCalledOnce();
    });
  });

  describe('レンダリング', () => {
    it('HTMLコンテンツを生成できる', async () => {
      // Arrange
      const mockSaveDataList: SaveDataSummary[] = [
        {
          id: 'save1',
          routeName: 'route1',
          sceneNumber: 3,
          lastUpdated: new Date('2025-01-01T10:00:00Z'),
        },
      ];

      vi.mocked(mockService.getSaveDataList).mockResolvedValue({
        success: true,
        saveDataList: mockSaveDataList,
      });

      // Act
      await view.show();
      const htmlContent = view.getHtmlContent();

      // Assert
      expect(htmlContent).toContain('セーブデータ一覧');
      expect(htmlContent).toContain('route1');
      expect(htmlContent).toContain('シーン: 3');
      expect(htmlContent).toContain('2025/01/01');
    });

    it('空のデータの場合は適切なメッセージを表示', async () => {
      // Arrange
      vi.mocked(mockService.getSaveDataList).mockResolvedValue({
        success: true,
        saveDataList: [],
      });

      // Act
      await view.show();
      const htmlContent = view.getHtmlContent();

      // Assert
      expect(htmlContent).toContain('セーブデータがありません');
    });
  });
});