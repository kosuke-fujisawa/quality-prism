import {
  ILogAppender,
  LogEntry,
} from '../../domain/interfaces/ILogger';

/**
 * IndexedDBアペンダー
 * ブラウザのIndexedDBにログを永続化
 */
export class IndexedDBAppender implements ILogAppender {
  private readonly dbName: string;
  private readonly storeName: string;
  private readonly maxEntries: number;
  private db: IDBDatabase | null = null;
  private isInitialized = false;

  constructor(
    dbName: string = 'gameLogsDB',
    storeName: string = 'logs',
    maxEntries: number = 1000
  ) {
    this.dbName = dbName;
    this.storeName = storeName;
    this.maxEntries = maxEntries;
    this.initialize();
  }

  async append(entry: LogEntry): Promise<void> {
    if (!this.isInitialized) {
      await this.waitForInitialization();
    }

    if (!this.db) {
      console.warn('IndexedDB not available, skipping log entry');
      return;
    }

    try {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      const logRecord = {
        id: Date.now() + Math.random(),
        timestamp: entry.timestamp.toISOString(),
        level: entry.level,
        message: entry.message,
        context: entry.context,
        error: entry.error ? {
          name: entry.error.name,
          message: entry.error.message,
          stack: entry.error.stack,
        } : undefined,
      };

      await new Promise<void>((resolve, reject) => {
        const request = store.add(logRecord);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      // 古いエントリを削除してサイズ制限を維持
      await this.cleanupOldEntries();
    } catch (error) {
      console.error('Failed to store log entry in IndexedDB:', error);
    }
  }

  /**
   * IndexedDBを初期化
   */
  private async initialize(): Promise<void> {
    if (typeof window === 'undefined' || !window.indexedDB) {
      console.warn('IndexedDB not available in this environment');
      return;
    }

    try {
      this.db = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = window.indexedDB.open(this.dbName, 1);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(this.storeName)) {
            const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
            store.createIndex('timestamp', 'timestamp', { unique: false });
            store.createIndex('level', 'level', { unique: false });
          }
        };
      });
      
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize IndexedDB:', error);
    }
  }

  /**
   * 初期化完了を待機
   */
  private async waitForInitialization(): Promise<void> {
    const maxWait = 5000; // 5秒
    const startTime = Date.now();
    
    while (!this.isInitialized && Date.now() - startTime < maxWait) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  /**
   * 古いエントリを削除してサイズ制限を維持
   */
  private async cleanupOldEntries(): Promise<void> {
    if (!this.db) return;

    try {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('timestamp');
      
      const countRequest = store.count();
      const count = await new Promise<number>((resolve, reject) => {
        countRequest.onsuccess = () => resolve(countRequest.result);
        countRequest.onerror = () => reject(countRequest.error);
      });

      if (count > this.maxEntries) {
        const deleteCount = count - this.maxEntries;
        const cursorRequest = index.openCursor();
        let deletedCount = 0;

        await new Promise<void>((resolve, reject) => {
          cursorRequest.onsuccess = (event) => {
            const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
            if (cursor && deletedCount < deleteCount) {
              store.delete(cursor.primaryKey);
              deletedCount++;
              cursor.continue();
            } else {
              resolve();
            }
          };
          cursorRequest.onerror = () => reject(cursorRequest.error);
        });
      }
    } catch (error) {
      console.error('Failed to cleanup old log entries:', error);
    }
  }

  /**
   * ログエントリを検索
   */
  async searchLogs(
    criteria: {
      level?: number;
      from?: Date;
      to?: Date;
      limit?: number;
    } = {}
  ): Promise<any[]> {
    if (!this.db) return [];

    try {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('timestamp');
      
      const results: any[] = [];
      const limit = criteria.limit || 100;

      await new Promise<void>((resolve, reject) => {
        const cursorRequest = index.openCursor(null, 'prev'); // 新しい順
        
        cursorRequest.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
          if (cursor && results.length < limit) {
            const record = cursor.value;
            
            // フィルタ条件をチェック
            if (criteria.level && record.level < criteria.level) {
              cursor.continue();
              return;
            }
            
            if (criteria.from || criteria.to) {
              const timestamp = new Date(record.timestamp);
              if (criteria.from && timestamp < criteria.from) {
                cursor.continue();
                return;
              }
              if (criteria.to && timestamp > criteria.to) {
                cursor.continue();
                return;
              }
            }
            
            results.push(record);
            cursor.continue();
          } else {
            resolve();
          }
        };
        
        cursorRequest.onerror = () => reject(cursorRequest.error);
      });

      return results;
    } catch (error) {
      console.error('Failed to search logs:', error);
      return [];
    }
  }

  /**
   * 全ログエントリを削除
   */
  async clearLogs(): Promise<void> {
    if (!this.db) return;

    try {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      await new Promise<void>((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to clear logs:', error);
    }
  }

  /**
   * データベース接続を閉じる
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.isInitialized = false;
    }
  }
}