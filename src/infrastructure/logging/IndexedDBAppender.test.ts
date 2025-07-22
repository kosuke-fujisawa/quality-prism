import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { IndexedDBAppender } from './IndexedDBAppender';
import { LogLevel, LogLayer, LogEntry } from '../../domain/interfaces/ILogger';

// IndexedDBのモック
class MockIDBDatabase {
  private stores: Map<string, any[]> = new Map();
  objectStoreNames = { contains: vi.fn() };

  transaction(storeNames: string[], mode: string) {
    return new MockIDBTransaction(this.stores, storeNames);
  }

  createObjectStore(name: string, options: any) {
    this.stores.set(name, []);
    return new MockIDBObjectStore(this.stores.get(name)!);
  }

  close() {}
}

class MockIDBTransaction {
  constructor(
    private stores: Map<string, any[]>,
    private storeNames: string[]
  ) {}

  objectStore(name: string) {
    return new MockIDBObjectStore(this.stores.get(name) || []);
  }
}

class MockIDBObjectStore {
  private indexes: Map<string, any> = new Map();

  constructor(private data: any[]) {}

  add(value: any) {
    return new MockIDBRequest(() => {
      this.data.push(value);
    });
  }

  delete(key: any) {
    return new MockIDBRequest(() => {
      const index = this.data.findIndex((item) => item.id === key);
      if (index !== -1) {
        this.data.splice(index, 1);
      }
    });
  }

  clear() {
    return new MockIDBRequest(() => {
      this.data.length = 0;
    });
  }

  count() {
    return new MockIDBRequest(() => this.data.length);
  }

  createIndex(name: string, keyPath: string, options: any) {
    this.indexes.set(name, { keyPath, options });
  }

  index(name: string) {
    return {
      openCursor: (range?: any, direction?: string) => {
        return new MockIDBRequest(() => {
          const sorted = [...this.data].sort((a, b) => {
            if (direction === 'prev') {
              return (
                new Date(b.timestamp).getTime() -
                new Date(a.timestamp).getTime()
              );
            }
            return (
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            );
          });
          return new MockIDBCursor(sorted);
        });
      },
    };
  }
}

class MockIDBCursor {
  private index = 0;

  constructor(private data: any[]) {}

  get value() {
    return this.data[this.index];
  }

  get primaryKey() {
    return this.data[this.index]?.id;
  }

  continue() {
    this.index++;
  }
}

class MockIDBRequest {
  result: any;
  error: any = null;
  onsuccess: ((event: any) => void) | null = null;
  onerror: ((event: any) => void) | null = null;

  constructor(private action: () => any) {
    setTimeout(() => {
      try {
        this.result = this.action();
        if (this.onsuccess) {
          this.onsuccess({ target: this });
        }
      } catch (error) {
        this.error = error;
        if (this.onerror) {
          this.onerror({ target: this });
        }
      }
    }, 0);
  }
}

describe('IndexedDBAppender', () => {
  let mockIndexedDB: any;
  let appender: IndexedDBAppender;

  beforeEach(() => {
    // IndexedDBのモックを設定
    mockIndexedDB = {
      open: vi.fn((name: string, version: number) => {
        const request = new MockIDBRequest(() => new MockIDBDatabase());
        // onupgradeneededを非同期で呼び出し
        setTimeout(() => {
          if (request.onupgradeneeded) {
            request.onupgradeneeded({ target: request });
          }
        }, 0);
        return request;
      }),
    };

    // グローバルのwindowオブジェクトにモックを設定
    Object.defineProperty(global, 'window', {
      value: { indexedDB: mockIndexedDB },
      writable: true,
    });
  });

  afterEach(() => {
    if (appender) {
      appender.close();
    }
  });

  describe('初期化', () => {
    it('IndexedDBが利用可能な場合は正常に初期化される', async () => {
      appender = new IndexedDBAppender();

      // 初期化完了を待機
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockIndexedDB.open).toHaveBeenCalledWith('gameLogsDB', 1);
    });

    it('カスタムパラメータで初期化できる', async () => {
      appender = new IndexedDBAppender('customDB', 'customStore', 500);

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockIndexedDB.open).toHaveBeenCalledWith('customDB', 1);
    });
  });

  describe('ログエントリの追加', () => {
    beforeEach(async () => {
      appender = new IndexedDBAppender();
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    it('ログエントリを正常に追加できる', async () => {
      const entry: LogEntry = {
        level: LogLevel.INFO,
        message: 'Test message',
        timestamp: new Date(),
        context: {
          layer: LogLayer.DOMAIN,
          operation: 'test',
        },
      };

      await appender.append(entry);

      // IndexedDBの操作は非同期なので少し待機
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    it('エラー情報を含むログエントリを追加できる', async () => {
      const error = new Error('Test error');
      const entry: LogEntry = {
        level: LogLevel.ERROR,
        message: 'Error occurred',
        timestamp: new Date(),
        error,
        context: {
          layer: LogLayer.DOMAIN,
          operation: 'test-error',
        },
      };

      await appender.append(entry);

      await new Promise((resolve) => setTimeout(resolve, 100));
    });
  });

  describe('エラーハンドリング', () => {
    it('IndexedDBが利用できない環境でもエラーを投げない', async () => {
      // IndexedDBを無効化
      Object.defineProperty(global, 'window', {
        value: undefined,
        writable: true,
      });

      appender = new IndexedDBAppender();

      const entry: LogEntry = {
        level: LogLevel.INFO,
        message: 'Test message',
        timestamp: new Date(),
      };

      // エラーを投げないことを確認（短時間で）
      await expect(appender.append(entry)).resolves.toBeUndefined();
    }, 1000);

    it('初期化に失敗した場合でもappendでエラーを投げない', async () => {
      // 失敗するIndexedDBのモック
      const failingIndexedDB = {
        open: vi.fn(() => {
          const request = new MockIDBRequest(() => {
            throw new Error('DB initialization failed');
          });
          return request;
        }),
      };

      Object.defineProperty(global, 'window', {
        value: { indexedDB: failingIndexedDB },
        writable: true,
      });

      appender = new IndexedDBAppender();

      const entry: LogEntry = {
        level: LogLevel.INFO,
        message: 'Test message',
        timestamp: new Date(),
      };

      await new Promise((resolve) => setTimeout(resolve, 100));
      await expect(appender.append(entry)).resolves.toBeUndefined();
    }, 1000);
  });

  describe('ログ検索', () => {
    beforeEach(async () => {
      appender = new IndexedDBAppender();
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    it('デフォルトでログを検索できる', async () => {
      const results = await appender.searchLogs();
      expect(Array.isArray(results)).toBe(true);
    }, 1000);

    it('検索条件を指定してログを検索できる', async () => {
      const criteria = {
        level: LogLevel.WARN,
        from: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24時間前
        to: new Date(),
        limit: 50,
      };

      const results = await appender.searchLogs(criteria);
      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('ログクリア', () => {
    beforeEach(async () => {
      appender = new IndexedDBAppender();
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    it('全ログエントリを削除できる', async () => {
      await expect(appender.clearLogs()).resolves.toBeUndefined();
    });
  });

  describe('接続管理', () => {
    beforeEach(async () => {
      appender = new IndexedDBAppender();
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    it('接続を正常に閉じることができる', () => {
      expect(() => appender.close()).not.toThrow();
    });
  });
});
