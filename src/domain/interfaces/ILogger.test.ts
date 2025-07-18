import { describe, it, expect } from 'vitest';
import {
  LogLevel,
  LogLayer,
  type LogContext,
  type LogEntry,
  type ILogger,
  type IGameLogger,
  type IRepositoryLogger,
  type GameLogContext,
} from './ILogger';

describe('ロガーインターフェース', () => {
  describe('LogLevel', () => {
    it('ログレベルが正しく定義されている', () => {
      expect(LogLevel.DEBUG).toBe(0);
      expect(LogLevel.INFO).toBe(1);
      expect(LogLevel.WARN).toBe(2);
      expect(LogLevel.ERROR).toBe(3);
    });

    it('ログレベルの順序が正しい', () => {
      expect(LogLevel.DEBUG < LogLevel.INFO).toBe(true);
      expect(LogLevel.INFO < LogLevel.WARN).toBe(true);
      expect(LogLevel.WARN < LogLevel.ERROR).toBe(true);
    });
  });

  describe('LogLayer', () => {
    it('DDDレイヤーが正しく定義されている', () => {
      expect(LogLayer.DOMAIN).toBe('domain');
      expect(LogLayer.APPLICATION).toBe('application');
      expect(LogLayer.INFRASTRUCTURE).toBe('infrastructure');
      expect(LogLayer.PRESENTATION).toBe('presentation');
    });
  });

  describe('LogContext', () => {
    it('基本的なコンテキスト情報を持てる', () => {
      const context: LogContext = {
        userId: 'user-123',
        sessionId: 'session-456',
        operation: 'test-operation',
        layer: LogLayer.DOMAIN,
        metadata: { key: 'value' },
        timestamp: new Date(),
      };

      expect(context.userId).toBe('user-123');
      expect(context.sessionId).toBe('session-456');
      expect(context.operation).toBe('test-operation');
      expect(context.layer).toBe(LogLayer.DOMAIN);
      expect(context.metadata).toEqual({ key: 'value' });
      expect(context.timestamp).toBeInstanceOf(Date);
    });

    it('すべてのプロパティがオプショナル', () => {
      const context: LogContext = {};
      expect(context).toEqual({});
    });
  });

  describe('GameLogContext', () => {
    it('ゲーム固有のコンテキスト情報を持てる', () => {
      const context: GameLogContext = {
        userId: 'user-123',
        routeId: 'route1',
        sceneNumber: 5,
        gameState: 'playing',
        layer: LogLayer.APPLICATION,
      };

      expect(context.routeId).toBe('route1');
      expect(context.sceneNumber).toBe(5);
      expect(context.gameState).toBe('playing');
      expect(context.layer).toBe(LogLayer.APPLICATION);
    });
  });

  describe('LogEntry', () => {
    it('ログエントリが正しい構造を持つ', () => {
      const timestamp = new Date();
      const error = new Error('test error');
      const context: LogContext = {
        operation: 'test',
        layer: LogLayer.DOMAIN,
      };

      const entry: LogEntry = {
        level: LogLevel.ERROR,
        message: 'test message',
        context,
        error,
        timestamp,
      };

      expect(entry.level).toBe(LogLevel.ERROR);
      expect(entry.message).toBe('test message');
      expect(entry.context).toBe(context);
      expect(entry.error).toBe(error);
      expect(entry.timestamp).toBe(timestamp);
    });

    it('最小限のログエントリを作成できる', () => {
      const timestamp = new Date();
      const entry: LogEntry = {
        level: LogLevel.INFO,
        message: 'simple message',
        timestamp,
      };

      expect(entry.level).toBe(LogLevel.INFO);
      expect(entry.message).toBe('simple message');
      expect(entry.timestamp).toBe(timestamp);
      expect(entry.context).toBeUndefined();
      expect(entry.error).toBeUndefined();
    });
  });

  describe('ILogger interface', () => {
    it('基本ロガーインターフェースが正しく定義されている', () => {
      // TypeScriptのコンパイル時チェックのためのテスト
      const mockLogger: ILogger = {
        debug: (message: string, context?: LogContext) => {},
        info: (message: string, context?: LogContext) => {},
        warn: (message: string, context?: LogContext) => {},
        error: (message: string, error?: Error, context?: LogContext) => {},
      };

      expect(typeof mockLogger.debug).toBe('function');
      expect(typeof mockLogger.info).toBe('function');
      expect(typeof mockLogger.warn).toBe('function');
      expect(typeof mockLogger.error).toBe('function');
    });
  });

  describe('IGameLogger interface', () => {
    it('ゲームロガーインターフェースが正しく定義されている', () => {
      const mockGameLogger: IGameLogger = {
        debug: (message: string, context?: LogContext) => {},
        info: (message: string, context?: LogContext) => {},
        warn: (message: string, context?: LogContext) => {},
        error: (message: string, error?: Error, context?: LogContext) => {},
        logGameAction: (action: string, context?: GameLogContext) => {},
        logStateChange: (from: string, to: string, context?: GameLogContext) => {},
        logPerformance: (operation: string, duration: number, context?: LogContext) => {},
      };

      expect(typeof mockGameLogger.logGameAction).toBe('function');
      expect(typeof mockGameLogger.logStateChange).toBe('function');
      expect(typeof mockGameLogger.logPerformance).toBe('function');
    });
  });

  describe('IRepositoryLogger interface', () => {
    it('リポジトリロガーインターフェースが正しく定義されている', () => {
      const mockRepoLogger: IRepositoryLogger = {
        debug: (message: string, context?: LogContext) => {},
        info: (message: string, context?: LogContext) => {},
        warn: (message: string, context?: LogContext) => {},
        error: (message: string, error?: Error, context?: LogContext) => {},
        logQuery: (repository: string, operation: string, params?: any) => {},
        logQueryResult: (repository: string, operation: string, resultCount: number) => {},
        logQueryError: (repository: string, operation: string, error: Error) => {},
      };

      expect(typeof mockRepoLogger.logQuery).toBe('function');
      expect(typeof mockRepoLogger.logQueryResult).toBe('function');
      expect(typeof mockRepoLogger.logQueryError).toBe('function');
    });
  });
});