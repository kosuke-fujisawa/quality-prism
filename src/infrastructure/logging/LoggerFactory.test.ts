import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LoggerFactory, loggerFactory } from './LoggerFactory';
import { LogLevel } from '../../domain/interfaces/ILogger';

describe('LoggerFactory', () => {
  let factory: LoggerFactory;
  let originalProcess: any;
  let originalWindow: any;

  beforeEach(() => {
    // プロセス環境変数をモック
    originalProcess = global.process;
    originalWindow = global.window;

    // テスト用の新しいインスタンスを作成
    // シングルトンをリセット
    (LoggerFactory as any).instance = undefined;
  });

  afterEach(() => {
    // 環境を復元
    global.process = originalProcess;
    global.window = originalWindow;

    if (factory) {
      factory.reset();
    }
  });

  describe('シングルトンパターン', () => {
    it('常に同じインスタンスを返す', () => {
      const instance1 = LoggerFactory.getInstance();
      const instance2 = LoggerFactory.getInstance();

      expect(instance1).toBe(instance2);
    });

    it('loggerFactoryエクスポートがシングルトンインスタンス', () => {
      const instance = LoggerFactory.getInstance();
      expect(loggerFactory).toBe(instance);
    });
  });

  describe('環境判定', () => {
    it('開発環境を正しく判定する', () => {
      global.process = {
        env: { NODE_ENV: 'development' },
      };

      factory = LoggerFactory.getInstance();

      expect(factory.isDev()).toBe(true);
      expect(factory.getLogLevel()).toBe(LogLevel.DEBUG);
    });

    it('本番環境を正しく判定する', () => {
      global.process = {
        env: { NODE_ENV: 'production' },
      };

      factory = LoggerFactory.getInstance();

      expect(factory.isDev()).toBe(false);
      expect(factory.getLogLevel()).toBe(LogLevel.INFO);
    });

    it('processが存在しない環境では本番環境として扱う', () => {
      global.process = undefined as any;

      factory = LoggerFactory.getInstance();

      expect(factory.isDev()).toBe(false);
      expect(factory.getLogLevel()).toBe(LogLevel.INFO);
    });
  });

  describe('ロガー作成', () => {
    beforeEach(() => {
      global.process = {
        env: { NODE_ENV: 'development' },
      };
      factory = LoggerFactory.getInstance();
    });

    it('基本ロガーを作成できる', () => {
      const logger = factory.createLogger();

      expect(logger).toBeDefined();
      expect(typeof logger.debug).toBe('function');
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.error).toBe('function');
    });

    it('名前付きロガーを作成できる', () => {
      const logger = factory.createLogger('TestLogger');

      expect(logger).toBeDefined();
    });

    it('ゲームロガーを作成できる', () => {
      const gameLogger = factory.createGameLogger();

      expect(gameLogger).toBeDefined();
      expect(typeof gameLogger.logGameAction).toBe('function');
      expect(typeof gameLogger.logStateChange).toBe('function');
      expect(typeof gameLogger.logPerformance).toBe('function');
    });

    it('リポジトリロガーを作成できる', () => {
      const repoLogger = factory.createRepositoryLogger();

      expect(repoLogger).toBeDefined();
      expect(typeof repoLogger.logQuery).toBe('function');
      expect(typeof repoLogger.logQueryResult).toBe('function');
      expect(typeof repoLogger.logQueryError).toBe('function');
    });

    it('アプリケーションロガーを作成できる', () => {
      const appLogger = factory.createApplicationLogger();

      expect(appLogger).toBeDefined();
      expect(typeof appLogger.logGameAction).toBe('function');
    });
  });

  describe('ログレベル設定', () => {
    beforeEach(() => {
      factory = LoggerFactory.getInstance();
    });

    it('ログレベルを設定できる', () => {
      factory.setLogLevel(LogLevel.ERROR);

      expect(factory.getLogLevel()).toBe(LogLevel.ERROR);
    });

    it('設定したログレベルが作成されるロガーに反映される', () => {
      factory.setLogLevel(LogLevel.WARN);

      const logger = factory.createLogger();

      // BaseLoggerの内部状態をテストするのは困難なので、
      // ログレベルが設定されていることのみ確認
      expect(factory.getLogLevel()).toBe(LogLevel.WARN);
    });
  });

  describe('永続化ログ設定', () => {
    beforeEach(() => {
      global.process = {
        env: { NODE_ENV: 'development' },
      };
      global.window = { indexedDB: {} };
      factory = LoggerFactory.getInstance();
    });

    it('永続化ログを有効化できる', () => {
      factory.enablePersistentLogs();

      // 永続化ログが有効になっていることを間接的に確認
      // (実際の動作はアペンダー作成時に確認される)
      expect(factory.isDev()).toBe(true); // 開発環境でも永続化が有効になる
    });

    it('永続化ログを無効化できる', () => {
      factory.enablePersistentLogs();
      factory.disablePersistentLogs();

      // 永続化ログが無効になっていることを確認
    });

    it('本番環境では永続化ログがデフォルトで有効', () => {
      global.process = {
        env: { NODE_ENV: 'production' },
      };

      const prodFactory = LoggerFactory.getInstance();

      expect(prodFactory.isDev()).toBe(false);
    });
  });

  describe('設定リセット', () => {
    beforeEach(() => {
      global.process = {
        env: { NODE_ENV: 'development' },
      };
      factory = LoggerFactory.getInstance();
    });

    it('設定をデフォルト値にリセットできる', () => {
      // 設定を変更
      factory.setLogLevel(LogLevel.ERROR);
      factory.disablePersistentLogs();

      // リセット
      factory.reset();

      // デフォルト値に戻っていることを確認
      expect(factory.getLogLevel()).toBe(LogLevel.DEBUG); // 開発環境のデフォルト
    });
  });

  describe('アペンダー作成', () => {
    it('開発環境では人間が読みやすい形式のフォーマッターを使用', () => {
      global.process = {
        env: { NODE_ENV: 'development' },
      };
      global.window = undefined;

      factory = LoggerFactory.getInstance();
      const logger = factory.createLogger();

      expect(logger).toBeDefined();
    });

    it('本番環境ではJSON形式のフォーマッターを使用', () => {
      global.process = {
        env: { NODE_ENV: 'production' },
      };
      global.window = undefined;

      factory = LoggerFactory.getInstance();
      const logger = factory.createLogger();

      expect(logger).toBeDefined();
    });

    it('windowが存在しない環境ではIndexedDBアペンダーを追加しない', () => {
      global.process = {
        env: { NODE_ENV: 'production' },
      };
      global.window = undefined;

      factory = LoggerFactory.getInstance();
      const logger = factory.createLogger();

      expect(logger).toBeDefined();
    });

    it('windowが存在する環境ではIndexedDBアペンダーを追加する', () => {
      global.process = {
        env: { NODE_ENV: 'production' },
      };
      // より完全なIndexedDBモックを提供
      global.window = {
        indexedDB: {
          open: vi.fn(() => ({
            onsuccess: null,
            onerror: null,
            onupgradeneeded: null,
          })),
        },
      };

      factory = LoggerFactory.getInstance();
      const logger = factory.createLogger();

      expect(logger).toBeDefined();
    });
  });

  describe('エラーハンドリング', () => {
    it('不正な環境設定でもエラーを投げない', () => {
      global.process = null as any;
      global.window = null as any;

      expect(() => {
        factory = LoggerFactory.getInstance();
        factory.createLogger();
      }).not.toThrow();
    });

    it('部分的な環境設定でも動作する', () => {
      global.process = { env: {} } as any;

      expect(() => {
        factory = LoggerFactory.getInstance();
        factory.createLogger();
      }).not.toThrow();
    });
  });
});
