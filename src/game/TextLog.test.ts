import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TextLog } from './TextLog';
import { SaveDataDB } from '../storage/SaveData';

// モックの作成
vi.mock('../storage/SaveData', () => ({
  SaveDataDB: vi.fn().mockImplementation(() => ({
    updateSaveData: vi.fn(),
    getOrCreateSaveData: vi.fn(),
  })),
}));

describe('TextLog', () => {
  let textLog: TextLog;
  let mockDB: any;

  beforeEach(() => {
    mockDB = {
      updateSaveData: vi.fn(),
      getOrCreateSaveData: vi.fn(),
    };

    (SaveDataDB as any).mockImplementation(() => mockDB);
    textLog = new TextLog();
  });

  describe('テキストログの追加', () => {
    it('新しいテキストを追加できる', () => {
      textLog.addText('route1', 1, 'こんにちは');

      const logs = textLog.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0]).toEqual({
        route: 'route1',
        scene: 1,
        text: 'こんにちは',
        timestamp: expect.any(Date),
      });
    });

    it('複数のテキストを順番に追加できる', () => {
      textLog.addText('route1', 1, 'こんにちは');
      textLog.addText('route1', 2, 'さようなら');

      const logs = textLog.getLogs();
      expect(logs).toHaveLength(2);
      expect(logs[0].text).toBe('こんにちは');
      expect(logs[1].text).toBe('さようなら');
    });

    it('異なるルートのテキストを追加できる', () => {
      textLog.addText('route1', 1, 'ルート1のテキスト');
      textLog.addText('route2', 1, 'ルート2のテキスト');

      const logs = textLog.getLogs();
      expect(logs).toHaveLength(2);
      expect(logs[0].route).toBe('route1');
      expect(logs[1].route).toBe('route2');
    });
  });

  describe('テキストログの取得', () => {
    it('空のログを取得できる', () => {
      const logs = textLog.getLogs();
      expect(logs).toEqual([]);
    });

    it('特定のルートのログのみを取得できる', () => {
      textLog.addText('route1', 1, 'ルート1のテキスト');
      textLog.addText('route2', 1, 'ルート2のテキスト');
      textLog.addText('route1', 2, 'ルート1のテキスト2');

      const route1Logs = textLog.getLogsByRoute('route1');
      expect(route1Logs).toHaveLength(2);
      expect(route1Logs[0].text).toBe('ルート1のテキスト');
      expect(route1Logs[1].text).toBe('ルート1のテキスト2');
    });

    it('存在しないルートのログは空配列を返す', () => {
      const logs = textLog.getLogsByRoute('nonexistent');
      expect(logs).toEqual([]);
    });
  });

  describe('テキストログのクリア', () => {
    it('すべてのログをクリアできる', () => {
      textLog.addText('route1', 1, 'テキスト1');
      textLog.addText('route2', 1, 'テキスト2');

      textLog.clearLogs();

      const logs = textLog.getLogs();
      expect(logs).toEqual([]);
    });

    it('特定のルートのログのみをクリアできる', () => {
      textLog.addText('route1', 1, 'ルート1のテキスト');
      textLog.addText('route2', 1, 'ルート2のテキスト');

      textLog.clearLogsByRoute('route1');

      const allLogs = textLog.getLogs();
      expect(allLogs).toHaveLength(1);
      expect(allLogs[0].route).toBe('route2');
    });
  });

  describe('テキストログの検索', () => {
    it('テキスト内容で検索できる', () => {
      textLog.addText('route1', 1, 'こんにちは、世界！');
      textLog.addText('route1', 2, 'さようなら、世界！');
      textLog.addText('route2', 1, 'こんばんは');

      const searchResults = textLog.searchLogs('世界');
      expect(searchResults).toHaveLength(2);
      expect(searchResults[0].text).toBe('こんにちは、世界！');
      expect(searchResults[1].text).toBe('さようなら、世界！');
    });

    it('検索結果が見つからない場合は空配列を返す', () => {
      textLog.addText('route1', 1, 'こんにちは');

      const searchResults = textLog.searchLogs('存在しないテキスト');
      expect(searchResults).toEqual([]);
    });
  });

  describe('テキストログの保存', () => {
    it('ログを保存できる', async () => {
      textLog.addText('route1', 1, 'テストテキスト');

      await textLog.saveLogs();

      expect(mockDB.updateSaveData).toHaveBeenCalledWith({
        textLogs: expect.any(Array),
      });
    });

    it('保存したログを復元できる', async () => {
      const mockLogs = [
        {
          route: 'route1',
          scene: 1,
          text: '保存されたテキスト',
          timestamp: new Date('2023-01-01T00:00:00Z'),
        },
      ];

      mockDB.getOrCreateSaveData.mockResolvedValue({
        textLogs: mockLogs,
      });

      await textLog.loadLogs();

      const logs = textLog.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].text).toBe('保存されたテキスト');
    });
  });

  describe('ログの制限', () => {
    it('最大ログ数を超えた場合、古いログが削除される', () => {
      // 最大ログ数を5に設定した場合のテスト
      textLog.setMaxLogs(5);

      for (let i = 1; i <= 7; i++) {
        textLog.addText('route1', i, `テキスト${i}`);
      }

      const logs = textLog.getLogs();
      expect(logs).toHaveLength(5);
      expect(logs[0].text).toBe('テキスト3'); // 最初の2つが削除される
      expect(logs[4].text).toBe('テキスト7');
    });
  });
});
