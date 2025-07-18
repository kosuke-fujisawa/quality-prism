import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  ConsoleAppender,
  JsonLogFormatter,
  HumanReadableLogFormatter,
} from './ConsoleAppender';
import {
  LogLevel,
  LogLayer,
  LogEntry,
} from '../../domain/interfaces/ILogger';

describe('ConsoleAppender', () => {
  let consoleDebugSpy: any;
  let consoleInfoSpy: any;
  let consoleWarnSpy: any;
  let consoleErrorSpy: any;
  let consoleLogSpy: any;

  beforeEach(() => {
    consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('ログレベル別出力', () => {
    it('DEBUGレベルはconsole.debugで出力される', () => {
      const formatter = new JsonLogFormatter();
      const appender = new ConsoleAppender(formatter);
      const entry: LogEntry = {
        level: LogLevel.DEBUG,
        message: 'debug message',
        timestamp: new Date(),
      };

      appender.append(entry);

      expect(consoleDebugSpy).toHaveBeenCalledWith(
        expect.stringContaining('"message":"debug message"')
      );
    });

    it('INFOレベルはconsole.infoで出力される', () => {
      const formatter = new JsonLogFormatter();
      const appender = new ConsoleAppender(formatter);
      const entry: LogEntry = {
        level: LogLevel.INFO,
        message: 'info message',
        timestamp: new Date(),
      };

      appender.append(entry);

      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining('"message":"info message"')
      );
    });

    it('WARNレベルはconsole.warnで出力される', () => {
      const formatter = new JsonLogFormatter();
      const appender = new ConsoleAppender(formatter);
      const entry: LogEntry = {
        level: LogLevel.WARN,
        message: 'warn message',
        timestamp: new Date(),
      };

      appender.append(entry);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('"message":"warn message"')
      );
    });

    it('ERRORレベルはconsole.errorで出力される', () => {
      const formatter = new JsonLogFormatter();
      const appender = new ConsoleAppender(formatter);
      const entry: LogEntry = {
        level: LogLevel.ERROR,
        message: 'error message',
        timestamp: new Date(),
      };

      appender.append(entry);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('"message":"error message"')
      );
    });

    it('エラーオブジェクト付きのERRORログは2つの引数で出力される', () => {
      const formatter = new JsonLogFormatter();
      const appender = new ConsoleAppender(formatter);
      const error = new Error('test error');
      const entry: LogEntry = {
        level: LogLevel.ERROR,
        message: 'error message',
        error,
        timestamp: new Date(),
      };

      appender.append(entry);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('"message":"error message"'),
        error
      );
    });
  });
});

describe('JsonLogFormatter', () => {
  let formatter: JsonLogFormatter;

  beforeEach(() => {
    formatter = new JsonLogFormatter();
  });

  it('基本的なログエントリをJSON形式で出力する', () => {
    const timestamp = new Date('2024-01-01T12:00:00.000Z');
    const entry: LogEntry = {
      level: LogLevel.INFO,
      message: 'test message',
      timestamp,
    };

    const result = formatter.format(entry);
    const parsed = JSON.parse(result);

    expect(parsed.timestamp).toBe('2024-01-01T12:00:00.000Z');
    expect(parsed.level).toBe('INFO');
    expect(parsed.message).toBe('test message');
    expect(parsed.context).toBeUndefined();
    expect(parsed.error).toBeUndefined();
  });

  it('コンテキスト情報を含むログエントリを出力する', () => {
    const timestamp = new Date('2024-01-01T12:00:00.000Z');
    const context = {
      userId: 'user-123',
      operation: 'test-operation',
      layer: LogLayer.DOMAIN,
      metadata: { key: 'value' },
    };
    const entry: LogEntry = {
      level: LogLevel.DEBUG,
      message: 'test message with context',
      context,
      timestamp,
    };

    const result = formatter.format(entry);
    const parsed = JSON.parse(result);

    expect(parsed.context).toEqual(context);
  });

  it('エラー情報を含むログエントリを出力する', () => {
    const timestamp = new Date('2024-01-01T12:00:00.000Z');
    const error = new Error('test error');
    error.stack = 'Error: test error\n    at test:1:1';
    const entry: LogEntry = {
      level: LogLevel.ERROR,
      message: 'error occurred',
      error,
      timestamp,
    };

    const result = formatter.format(entry);
    const parsed = JSON.parse(result);

    expect(parsed.error).toEqual({
      name: 'Error',
      message: 'test error',
      stack: 'Error: test error\n    at test:1:1',
    });
  });
});

describe('HumanReadableLogFormatter', () => {
  let formatter: HumanReadableLogFormatter;

  beforeEach(() => {
    formatter = new HumanReadableLogFormatter();
  });

  it('基本的なログエントリを人間が読みやすい形式で出力する', () => {
    const timestamp = new Date('2024-01-01T12:00:00.000Z');
    const entry: LogEntry = {
      level: LogLevel.INFO,
      message: 'test message',
      timestamp,
    };

    const result = formatter.format(entry);

    expect(result).toBe('2024-01-01T12:00:00.000Z INFO  test message');
  });

  it('コンテキスト情報を含むログエントリを出力する', () => {
    const timestamp = new Date('2024-01-01T12:00:00.000Z');
    const context = {
      userId: 'user-123',
      operation: 'test-operation',
      layer: LogLayer.DOMAIN,
      sessionId: 'session-456',
    };
    const entry: LogEntry = {
      level: LogLevel.WARN,
      message: 'warning message',
      context,
      timestamp,
    };

    const result = formatter.format(entry);

    expect(result).toContain('2024-01-01T12:00:00.000Z WARN  warning message [');
    expect(result).toContain('layer=domain');
    expect(result).toContain('op=test-operation');
    expect(result).toContain('user=user-123');
    expect(result).toContain('session=session-456');
  });

  it('コンテキストの一部のみが提供された場合も正しく出力する', () => {
    const timestamp = new Date('2024-01-01T12:00:00.000Z');
    const context = {
      layer: LogLayer.APPLICATION,
      userId: 'user-123',
    };
    const entry: LogEntry = {
      level: LogLevel.ERROR,
      message: 'error message',
      context,
      timestamp,
    };

    const result = formatter.format(entry);

    expect(result).toBe(
      '2024-01-01T12:00:00.000Z ERROR error message [layer=application user=user-123]'
    );
  });

  it('コンテキストがない場合はコンテキスト部分を出力しない', () => {
    const timestamp = new Date('2024-01-01T12:00:00.000Z');
    const entry: LogEntry = {
      level: LogLevel.DEBUG,
      message: 'debug message',
      timestamp,
    };

    const result = formatter.format(entry);

    expect(result).toBe('2024-01-01T12:00:00.000Z DEBUG debug message');
  });
});