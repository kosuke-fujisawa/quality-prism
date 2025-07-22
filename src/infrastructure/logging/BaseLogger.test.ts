import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BaseLogger } from './BaseLogger';
import {
  LogLevel,
  LogLayer,
  LogEntry,
  ILogAppender,
} from '../../domain/interfaces/ILogger';

describe('BaseLogger', () => {
  let mockAppender: ILogAppender;
  let logger: BaseLogger;

  beforeEach(() => {
    mockAppender = {
      append: vi.fn(),
      flush: vi.fn().mockResolvedValue(undefined),
    };
    logger = new BaseLogger([mockAppender], LogLevel.DEBUG);
  });

  describe('基本ロギング機能', () => {
    it('DEBUGレベルのログを出力できる', () => {
      logger.debug('debug message');

      expect(mockAppender.append).toHaveBeenCalledWith(
        expect.objectContaining({
          level: LogLevel.DEBUG,
          message: 'debug message',
          timestamp: expect.any(Date),
        })
      );
    });

    it('INFOレベルのログを出力できる', () => {
      logger.info('info message');

      expect(mockAppender.append).toHaveBeenCalledWith(
        expect.objectContaining({
          level: LogLevel.INFO,
          message: 'info message',
          timestamp: expect.any(Date),
        })
      );
    });

    it('WARNレベルのログを出力できる', () => {
      logger.warn('warning message');

      expect(mockAppender.append).toHaveBeenCalledWith(
        expect.objectContaining({
          level: LogLevel.WARN,
          message: 'warning message',
          timestamp: expect.any(Date),
        })
      );
    });

    it('ERRORレベルのログを出力できる', () => {
      const error = new Error('test error');
      logger.error('error message', error);

      expect(mockAppender.append).toHaveBeenCalledWith(
        expect.objectContaining({
          level: LogLevel.ERROR,
          message: 'error message',
          error,
          timestamp: expect.any(Date),
        })
      );
    });
  });

  describe('コンテキスト情報', () => {
    it('コンテキスト情報付きでログを出力できる', () => {
      const context = {
        userId: 'user-123',
        operation: 'test-operation',
        layer: LogLayer.DOMAIN,
        metadata: { key: 'value' },
      };

      logger.info('message with context', context);

      expect(mockAppender.append).toHaveBeenCalledWith(
        expect.objectContaining({
          level: LogLevel.INFO,
          message: 'message with context',
          context,
          timestamp: expect.any(Date),
        })
      );
    });

    it('コンテキスト情報なしでもログを出力できる', () => {
      logger.info('message without context');

      expect(mockAppender.append).toHaveBeenCalledWith(
        expect.objectContaining({
          level: LogLevel.INFO,
          message: 'message without context',
          context: undefined,
          timestamp: expect.any(Date),
        })
      );
    });
  });

  describe('ログレベルフィルタリング', () => {
    it('ログレベル以上のログのみを出力する', () => {
      logger.setLevel(LogLevel.WARN);

      logger.debug('debug message');
      logger.info('info message');
      logger.warn('warn message');
      logger.error('error message');

      expect(mockAppender.append).toHaveBeenCalledTimes(2);
      expect(mockAppender.append).toHaveBeenCalledWith(
        expect.objectContaining({ level: LogLevel.WARN })
      );
      expect(mockAppender.append).toHaveBeenCalledWith(
        expect.objectContaining({ level: LogLevel.ERROR })
      );
    });

    it('ログレベルを変更できる', () => {
      expect(logger.getLevel()).toBe(LogLevel.DEBUG);

      logger.setLevel(LogLevel.INFO);
      expect(logger.getLevel()).toBe(LogLevel.INFO);
    });
  });

  describe('複数アペンダー', () => {
    it('複数のアペンダーにログを送信する', () => {
      const mockAppender2: ILogAppender = {
        append: vi.fn(),
      };

      logger.addAppender(mockAppender2);
      logger.info('test message');

      expect(mockAppender.append).toHaveBeenCalledTimes(1);
      expect(mockAppender2.append).toHaveBeenCalledTimes(1);
    });

    it('アペンダーエラーが他のアペンダーに影響しない', () => {
      const faultyAppender: ILogAppender = {
        append: vi.fn().mockImplementation(() => {
          throw new Error('Appender error');
        }),
      };
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      logger.addAppender(faultyAppender);
      logger.info('test message');

      expect(mockAppender.append).toHaveBeenCalledTimes(1);
      expect(faultyAppender.append).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Log appender error:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('フラッシュ機能', () => {
    it('すべてのアペンダーをフラッシュする', async () => {
      const mockAppender2: ILogAppender = {
        append: vi.fn(),
        flush: vi.fn().mockResolvedValue(undefined),
      };

      logger.addAppender(mockAppender2);
      await logger.flush();

      expect(mockAppender.flush).toHaveBeenCalledTimes(1);
      expect(mockAppender2.flush).toHaveBeenCalledTimes(1);
    });

    it('flushメソッドがないアペンダーは無視される', async () => {
      const mockAppender2: ILogAppender = {
        append: vi.fn(),
      };

      logger.addAppender(mockAppender2);
      await expect(logger.flush()).resolves.not.toThrow();
    });
  });

  describe('エッジケース', () => {
    it('アペンダーなしでもエラーにならない', () => {
      const loggerWithoutAppenders = new BaseLogger([], LogLevel.DEBUG);
      expect(() => loggerWithoutAppenders.info('test')).not.toThrow();
    });

    it('nullまたはundefinedのコンテキストを処理できる', () => {
      logger.info('message', undefined);
      logger.error('error message', undefined, undefined);

      expect(mockAppender.append).toHaveBeenCalledTimes(2);
    });

    it('タイムスタンプが適切に設定される', () => {
      const before = new Date();
      logger.info('test message');
      const after = new Date();

      const logEntry = (mockAppender.append as any).mock
        .calls[0][0] as LogEntry;
      expect(logEntry.timestamp.getTime()).toBeGreaterThanOrEqual(
        before.getTime()
      );
      expect(logEntry.timestamp.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });
});
